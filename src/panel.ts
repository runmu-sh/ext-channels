/**
 * The Channels panel as a Vue component (render functions, no SFC compiler; `vue` is the host's own through
 * the import map), ported from μClient's features/world-panels/ChannelsPanel.vue onto the SDK.
 *
 * Composed as Underspire's chat: the rail of channel chips (accent bottom rule), then the view: head (title,
 * italic topic, tools Settings · Search · Mute · Pop out), the config strip (colour, alerts), the search strip,
 * single-line messages (time, sender, text, reactions) and the ❯ composer over an accent rule. With
 * `params.channel` it is a popped-out view of that one channel: no switching, its own composer, it marks its
 * channel read, and it survives a layout reload.
 */
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, shallowRef, watch, type PropType, type VNode } from 'vue';
import { CHANNEL_COLORS, type ChannelColor, type ChannelMessage, type ChannelsView, type Dispose, type Mu } from '@muclient/sdk';
import { COPY } from './copy.ts';
import {
  activeHitId, activeKeyOf, activeOf, atBottom, bodyOf, clampHit, countText, firstUnreadId, groupedIds, hhmm, isFindKey, messagesOf,
  moveIndex, newerThan, normConfig, patchConfig, popOutArgs, railOf, readAction, replyText, searchKey, searchMessages, soloOf, stepIndex,
  swatchStyle, tintStyle, withConfig, type Alert, type ChanConfig, type ChannelRow,
} from './logic.ts';
import { KIND_CHANNEL, KIND_MESSAGE, SETTING } from './settings.ts';

/** "Reply to X" from the message menu (index.ts) reaches every mounted view: (sid, channel key, sender). */
export type ReplyBus = Set<(sid: string, key: string, sender: string) => void>;

const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

const INPUT = '[data-testid="channel-input"]';

/** Hot reload: the composer's unsent text, or undefined when there is none. */
export function snapshotDraft(el: HTMLElement): string | undefined {
  const v = el.querySelector<HTMLInputElement>(INPUT)?.value;
  return v ? v : undefined;
}

/** Hot reload: put the unsent text back into the new build's composer (an input event, so the draft follows). */
export function restoreDraft(el: HTMLElement, state: unknown): void {
  const input = el.querySelector<HTMLInputElement>(INPUT);
  if (typeof state !== 'string' || !state || !input) return;
  input.value = state;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

export function createChannelsPanel(mu: Mu, replies: ReplyBus = new Set()) {
  const c = mu.ui.css;
  return defineComponent({
    name: 'ChannelsPanel',
    props: {
      sid: { type: String as PropType<string | null>, default: null },
      worldId: { type: String as PropType<string | null>, default: null },
      params: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    },
    setup(props) {
      const solo = computed(() => soloOf(props.params));
      const hostView = shallowRef<ChannelsView | null>(null);
      // The per-channel settings of the session's world: this extension's `config` setting (1.2.0).
      const config = shallowRef<ChanConfig>({});
      // Follow the panel's session: a new sid drops the old subscriptions and watches the new one (both watches call
      // back with the current value at once, so no separate get).
      watch(() => props.sid, (sid, _old, onCleanup) => {
        hostView.value = null;
        config.value = {};
        if (!sid) return;
        const offs = [
          mu.channels.watch((v) => { hostView.value = v; }, sid),
          mu.settings.watch<unknown>(SETTING.config, (v) => { config.value = normConfig(v); }, { sid }),
        ];
        onCleanup(() => { for (const o of offs) o(); });
      }, { immediate: true });
      const st = computed(() => withConfig(hostView.value, config.value));

      const activeKey = computed(() => activeKeyOf(st.value, solo.value));
      const active = computed(() => activeOf(st.value, solo.value));
      const rail = computed(() => railOf(st.value, solo.value));
      const msgs = computed(() => messagesOf(st.value, solo.value));
      const grouped = computed(() => groupedIds(msgs.value));
      const showCfg = ref(false);
      const draft = ref('');
      const view = ref<HTMLElement | null>(null);
      const composer = ref<HTMLInputElement | null>(null);

      const muted = computed(() => !!active.value?.muted);
      const alert = computed<Alert>(() => active.value?.alert ?? 'mentions');
      const color = computed<ChannelColor | null>(() => active.value?.color ?? null);
      /** Save a change to the active channel's settings in the session's world. Unmuting marks the channel read, so what came in while it was muted does not show as unread. */
      const configure = (patch: { muted?: boolean; alert?: Alert; color?: ChannelColor | null }) => {
        const a = active.value, sid = props.sid;
        if (!sid || !a) return;
        const worldId = props.worldId || mu.sessions.list().find((x) => x.id === sid)?.worldId;
        if (!worldId) return;
        mu.settings.set(SETTING.config, patchConfig(config.value, a.key, patch), worldId);
        if (patch.muted === false && a.hostUnread) mu.channels.markRead(a.key, sid);
      };

      // ── the "new" divider: before the first message that was unread when the channel was opened ──
      // Captured from the channel's unread count as it is shown (before reading clears it); dropped on a switch.
      const dividerAt = ref<number | null>(null);
      /** A chip click selects (which clears the unread): what was unread is noted first. */
      let noted: { key: string; id: number | null } | null = null;
      let shownKey = '';

      // ── scroll: follow the bottom; scrolled up, count what arrives and offer the latest ──
      const stuck = ref(true);
      const seenId = ref<number | null>(null);
      const pending = computed(() => (stuck.value ? 0 : newerThan(msgs.value, seenId.value)));
      function onScroll() {
        const el = view.value;
        if (!el) return;
        const was = stuck.value;
        stuck.value = atBottom(el);
        if (stuck.value) seenId.value = null;
        else if (was) seenId.value = msgs.value[msgs.value.length - 1]?.id ?? null;
      }
      function toBottom() {
        const el = view.value;
        if (el) el.scrollTop = el.scrollHeight;
        stuck.value = true; seenId.value = null;
      }

      // ── search (the terminal's rules and look: hit rows tinted, the active one outlined, n/N, ↑ ↓, Esc) ──
      const searching = ref(false);
      const query = ref('');
      const searchInput = ref<HTMLInputElement | null>(null);
      const hitIdx = ref(-1);
      const found = computed(() => searchMessages(msgs.value, searching.value ? query.value : ''));
      const hitSet = computed(() => new Set(found.value.hits));
      const activeHit = computed(() => activeHitId(found.value, hitIdx.value));
      const count = computed(() => countText(found.value, query.value, hitIdx.value));
      async function reveal() {
        await nextTick();
        const id = activeHit.value;
        if (id < 0 || !view.value) return;
        view.value.querySelector<HTMLElement>(`[data-mid="${id}"]`)?.scrollIntoView?.({ block: 'nearest' });
      }
      watch(() => [query.value, activeKey.value, searching.value], () => { hitIdx.value = found.value.hits.length - 1; void reveal(); });
      watch(() => found.value.hits.length, (n) => { hitIdx.value = clampHit(hitIdx.value, n); });
      function step(dir: 1 | -1) {
        const n = found.value.hits.length;
        if (!n) return;
        hitIdx.value = stepIndex(hitIdx.value, dir, n);
        void reveal();
      }
      function openSearch() { searching.value = true; void nextTick(() => { searchInput.value?.focus(); searchInput.value?.select(); }); }
      function closeSearch() { query.value = ''; searching.value = false; view.value?.focus(); }
      function toggleSearch() { if (searching.value) closeSearch(); else openSearch(); }
      function onSearchKey(e: KeyboardEvent) {
        const k = searchKey(e);
        if (k === 'close') { closeSearch(); e.preventDefault(); e.stopPropagation(); }
        else if (k) { step(k === 'next' ? 1 : -1); e.preventDefault(); }
      }
      function onPanelKey(e: KeyboardEvent) {
        if (isFindKey(e) && st.value?.known) { openSearch(); e.preventDefault(); e.stopPropagation(); }
      }

      // ── keyboard in the list: ↑ ↓ Home End move between messages (one tab stop: the focused row) ──
      const focusIdx = ref(-1);
      watch(activeKey, () => { focusIdx.value = -1; });
      function focusRow(i: number) {
        focusIdx.value = i;
        void nextTick(() => view.value?.querySelectorAll<HTMLElement>('.msg')[i]?.focus());
      }
      function onListKey(e: KeyboardEvent) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const rows = msgs.value.length;
        const cur = e.target === view.value ? -1 : focusIdx.value;
        const to = moveIndex(e.key, cur, rows);
        if (to !== null) { focusRow(to); e.preventDefault(); return; }
        if (e.key === 'Escape' && replyTo.value) { cancelReply(); e.preventDefault(); }
      }

      // ── reply: "Reply to X", the text goes out as `@X: text` ──
      const replyTo = ref('');
      function startReply(sender: string) {
        if (!sender) return;
        replyTo.value = sender;
        void nextTick(() => composer.value?.focus());
      }
      function cancelReply() { replyTo.value = ''; composer.value?.focus(); }
      const onReply = (sid: string, key: string, sender: string) => { if (sid === props.sid && key === activeKey.value) startReply(sender); };
      replies.add(onReply);
      onBeforeUnmount(() => { replies.delete(onReply); });

      // ── the message context menu: each row is a `channels.message` target (this extension's and other extensions' entries) ──
      const rowTargets = new Map<number, { el: HTMLElement; off: Dispose }>();
      function markRow(el: Element | null, m: ChannelMessage) {
        if (!(el instanceof HTMLElement) || !props.sid || typeof mu.menus?.target !== 'function') return;
        const had = rowTargets.get(m.id);
        if (had?.el === el) return;
        had?.off();
        rowTargets.set(m.id, { el, off: mu.menus.target(el, { kind: KIND_MESSAGE, sid: props.sid, data: { key: activeKey.value, message: m } }) });
      }
      // ── a chip is a `channels.channel` target; a right-click no menu entry takes opens the channel's settings ──
      const chipTargets = new Map<string, { el: HTMLElement; off: Dispose }>();
      function markChip(el: Element | null, key: string) {
        if (!(el instanceof HTMLElement) || !props.sid) return;
        const had = chipTargets.get(key);
        if (had?.el === el) return;
        had?.off();
        const offs: Dispose[] = [];
        if (typeof mu.menus?.target === 'function') offs.push(mu.menus.target(el, { kind: KIND_CHANNEL, sid: props.sid, data: { key } }));
        // Added after the target, so the host's menu listener runs first and prevents the default when it opened a menu.
        const onCtx = (e: Event) => { if (e.defaultPrevented) return; e.preventDefault(); cfgFor(key); };
        el.addEventListener('contextmenu', onCtx);
        offs.push(() => el.removeEventListener('contextmenu', onCtx));
        chipTargets.set(key, { el, off: () => { for (const o of offs) o(); } });
      }
      watch(() => rail.value.map((c) => c.key).join(','), () => {
        const live = new Set(rail.value.map((c) => c.key));
        for (const [k, r] of chipTargets) if (!live.has(k) || !r.el.isConnected) { r.off(); chipTargets.delete(k); }
      }, { flush: 'post' });
      onBeforeUnmount(() => { for (const r of chipTargets.values()) r.off(); chipTargets.clear(); });
      watch(() => msgs.value.map((m) => m.id).join(','), () => {
        const live = new Set(msgs.value.map((m) => m.id));
        for (const [id, r] of rowTargets) if (!live.has(id) || !r.el.isConnected) { r.off(); rowTargets.delete(id); }
      }, { flush: 'post' });
      onBeforeUnmount(() => { for (const r of rowTargets.values()) r.off(); rowTargets.clear(); });

      function pick(key: string) {
        if (!props.sid || solo.value) return;
        const ch = st.value?.channels.find((x) => x.key === key);
        if (key !== activeKey.value) noted = { key, id: ch ? firstUnreadId(st.value?.messages[key] ?? [], ch.unread) : null };
        mu.channels.select(key, props.sid);
      }
      function cfgFor(key: string) { pick(key); showCfg.value = true; }
      function popOut() {
        const ch = active.value;
        if (!props.sid || !ch) return;
        mu.panels.open(...popOutArgs(ch, props.sid));
      }
      async function send(e: Event) {
        e.preventDefault();
        if (!props.sid || !draft.value.trim()) return;
        const t = replyText(replyTo.value, draft.value);
        draft.value = '';
        replyTo.value = '';
        // The world's reply format (this extension's `replyFormat` setting); the host fills {channel} and {text}.
        const format = mu.settings.get<string>(SETTING.replyFormat, { sid: props.sid });
        await mu.channels.send(t, activeKey.value, props.sid, typeof format === 'string' && format.trim() ? { format } : undefined);
      }
      // Keyed on the last message id, not the count: the host caps a channel's history (500), so the length
      // stops changing once it is full while new messages keep arriving.
      watch([() => msgs.value[msgs.value.length - 1]?.id, activeKey, () => active.value?.unread], async () => {
        // A channel coming up: the divider goes before what was unread then (it stays while the channel is shown;
        // what arrives while it is shown is read at once). The reply and the scroll state start over.
        const a = active.value;
        if (a && a.key !== shownKey) {
          shownKey = a.key;
          dividerAt.value = noted?.key === a.key ? noted.id : firstUnreadId(msgs.value, a.unread);
          noted = null;
          replyTo.value = ''; stuck.value = true; seenId.value = null;
        }
        // Reading a channel clears its unread count (the popped-out view reads its own channel).
        const r = props.sid ? readAction(st.value, solo.value) : null;
        if (r && props.sid) { if (r.op === 'markRead') mu.channels.markRead(r.key, props.sid); else mu.channels.select(r.key, props.sid); }
        await nextTick();
        if (view.value && activeHit.value < 0 && stuck.value) view.value.scrollTop = view.value.scrollHeight;
      }, { immediate: true });

      const chip = (ch: ChannelRow): VNode => h('button', {
        key: ch.key, type: 'button', 'data-key': ch.key,
        class: cls('cc', ch.key === activeKey.value && 'on', ch.muted && 'muted', ch.mention && 'mention', !!ch.color && 'tinted'),
        style: tintStyle(ch.color), 'data-color': ch.color || undefined, 'aria-pressed': String(ch.key === activeKey.value),
        'aria-current': ch.key === activeKey.value ? 'true' : undefined,
        'aria-label': COPY.chipLabel(ch.caption, ch.unread, ch.mention, ch.online, ch.muted), title: ch.caption,
        onClick: () => pick(ch.key),
        ref: ((el: unknown) => markChip(el as Element | null, ch.key)) as never,
      }, [
        h('span', { class: 'name' }, ch.caption),
        ch.mention ? h('span', { class: 'at', 'aria-hidden': 'true' }, '@') : null,
        ch.online !== null ? h('span', { class: 'online', title: COPY.online(ch.online), 'aria-hidden': 'true' }, String(ch.online)) : null,
        ch.unread ? h('span', { class: cls('bd', c.count), 'aria-hidden': 'true' }, String(ch.unread)) : null,
      ]);

      const tool = (on: boolean, extra: Record<string, unknown>, label: string) =>
        h('button', { type: 'button', class: cls(c.cmd, 't', on && 'on'), ...extra }, label);

      const cfgStrip = (name: string) => h('div', { class: 'ccfg', 'data-testid': 'channel-cfg' }, [
        h('div', { class: 'cfg-row' }, [
          h('span', COPY.color),
          h('span', { class: 'swatches', role: 'radiogroup', 'aria-label': COPY.color, 'data-testid': 'channel-colors' }, [
            h('button', {
              type: 'button', class: cls('sw', 'none', !color.value && 'on'), role: 'radio', 'aria-checked': String(!color.value),
              title: COPY.colorDefault, 'aria-label': COPY.colorDefault, 'data-color': '', onClick: () => configure({ color: null }),
            }, '×'),
            ...CHANNEL_COLORS.map((k) => h('button', {
              key: k, type: 'button', class: cls('sw', color.value === k && 'on'), role: 'radio', 'aria-checked': String(color.value === k),
              style: swatchStyle(k), title: COPY.colors[k], 'aria-label': COPY.colors[k], 'data-color': k, onClick: () => configure({ color: k }),
            })),
          ]),
        ]),
        h('label', { class: 'cfg-row' }, [
          h('span', COPY.alerts),
          h('select', {
            class: cls('sel', c.field), value: alert.value, 'aria-label': COPY.alertsLabel(name),
            onChange: (e: Event) => configure({ alert: (e.target as HTMLSelectElement).value as Alert }),
          }, [
            h('option', { value: 'all', selected: alert.value === 'all' }, COPY.alertAll),
            h('option', { value: 'mentions', selected: alert.value === 'mentions' }, COPY.alertMentions),
            h('option', { value: 'none', selected: alert.value === 'none' }, COPY.alertNone),
          ]),
        ]),
      ]);

      const searchStrip = () => h('div', { class: 'csearch', 'data-testid': 'channel-search' }, [
        h('span', { class: 's-glyph', 'aria-hidden': 'true' }, '⌕'),
        h('input', {
          ref: searchInput, value: query.value, placeholder: COPY.searchPlaceholder, 'aria-label': COPY.searchPlaceholder, spellcheck: 'false',
          'data-testid': 'channel-search-input',
          onInput: (e: Event) => { query.value = (e.target as HTMLInputElement).value; },
          onKeydown: onSearchKey,
        }),
        h('span', { class: cls('cnt', found.value.error && 'err'), 'data-testid': 'channel-search-count', 'aria-live': 'polite' }, count.value),
        h('button', { type: 'button', class: cls(c.cmd, 's-btn'), 'aria-label': COPY.prev, 'data-s': 'prev', onClick: () => step(-1) }, COPY.prevLabel),
        h('button', { type: 'button', class: cls(c.cmd, 's-btn'), 'aria-label': COPY.next, 'data-s': 'next', onClick: () => step(1) }, COPY.nextLabel),
        h('button', { type: 'button', class: cls(c.cmd, 's-btn'), 'aria-label': COPY.close, 'data-s': 'close', onClick: closeSearch }, COPY.closeLabel),
      ]);

      const row = (m: ChannelMessage, i: number): VNode[] => {
        // After the divider a message starts a new group.
        const g = grouped.value.has(m.id) && !(m.id === dividerAt.value && !searching.value);
        const time = hhmm(m.ts);
        const out: VNode[] = [];
        if (m.id === dividerAt.value && !searching.value) {
          out.push(h('div', { key: `new-${m.id}`, class: 'divider', role: 'separator', 'aria-label': COPY.newDividerLabel, 'data-testid': 'channel-new' }, [h('span', COPY.newDivider)]));
        }
        out.push(h('div', {
          key: m.id, 'data-mid': m.id, role: 'article', tabindex: i === focusIdx.value ? '0' : '-1',
          'aria-label': COPY.messageLabel(m.sender, time, m.text),
          class: cls('msg', g && 'grouped', m.mention && 'mention', hitSet.value.has(m.id) && 'hit', m.id === activeHit.value && 'active'),
          ref: ((el: unknown) => markRow(el as Element | null, m)) as never,
          onFocus: () => { focusIdx.value = i; },
        }, [
          g ? null : h('span', { class: 'mts' }, time),
          g ? null : h('span', { class: 'sender' }, m.sender),
          h('span', { class: 'b text' }, m.text),
          m.reactions ? h('span', { class: 'reacts' }, Object.entries(m.reactions).map(([r, n]) => h('span', { key: r, class: 'react' }, `${r} ${n}`))) : null,
          m.sender ? h('span', { class: 'mt' }, [
            h('button', {
              type: 'button', class: cls(c.cmd, c.sq, 'mt-btn'), title: COPY.reply, 'aria-label': COPY.replyLabel(m.sender), 'data-testid': 'channel-reply',
              onClick: (e: MouseEvent) => { e.stopPropagation(); startReply(m.sender); },
            }, '↩'),
          ]) : null,
        ]));
        return out;
      };

      const messages = (a: ChannelRow) => h('div', { class: 'msgs-wrap' }, [
        h('div', {
          ref: view, class: 'msgs', role: 'log', 'data-focus-region': 'channels', tabindex: '-1', 'data-testid': 'channel-msgs', style: tintStyle(a.color),
          'aria-label': COPY.messagesLabel(a.caption), onScroll, onKeydown: onListKey,
        }, msgs.value.length ? msgs.value.flatMap(row) : [h('p', { class: c.empty }, COPY.noMessages)]),
        pending.value > 0 ? h('button', {
          type: 'button', class: 'latest', 'aria-label': COPY.latestLabel, 'data-testid': 'channel-latest', onClick: () => { toBottom(); view.value?.focus(); },
        }, `↓ ${COPY.latest(pending.value)}`) : null,
      ]);

      return () => {
        const body = bodyOf(st.value, solo.value);
        const kids: Array<VNode | null> = [];
        if (body === 'gone') {
          kids.push(h('p', { class: cls(c.empty, 'awaiting'), 'data-testid': 'channels-gone' }, COPY.gone(solo.value)));
        } else {
          kids.push(h('div', { class: 'rail', role: 'group', 'aria-label': COPY.rail, 'data-testid': 'channel-rail' }, [
            ...rail.value.map(chip),
            rail.value.length ? null : h('span', { class: 'rail-empty' }, COPY.none),
          ]));
          const a = active.value;
          if (body === 'awaiting') kids.push(h('p', { class: cls(c.empty, 'awaiting'), tabindex: '-1', 'data-focus-region': 'channels', 'data-testid': 'channels-empty' }, COPY.awaiting));
          else if (body === 'none' || !a) kids.push(h('p', { class: cls(c.empty, 'awaiting'), 'data-testid': 'channels-none' }, COPY.noChannel));
          else kids.push(h('div', { class: 'cv' }, [
            h('div', { class: 'head' }, [
              h('span', { class: cls('title', c.glow), 'data-testid': 'channel-title' }, a.caption),
              a.topic ? h('span', { class: 'topic', title: a.topic }, a.topic) : null,
              h('span', { class: 'tools' }, [
                tool(showCfg.value, { title: COPY.settingsTitle, 'aria-label': COPY.settingsLabel(a.caption), 'aria-expanded': String(showCfg.value), 'data-testid': 'channel-cfg-btn', onClick: () => { showCfg.value = !showCfg.value; } }, COPY.settings),
                tool(searching.value, { title: COPY.searchTitle, 'aria-label': COPY.searchLabel(a.caption), 'aria-expanded': String(searching.value), 'data-testid': 'channel-search-btn', onClick: toggleSearch }, COPY.search),
                tool(muted.value, { title: COPY.muteTitle, 'aria-pressed': String(muted.value), 'data-testid': 'channel-mute', onClick: () => configure({ muted: !muted.value }) }, muted.value ? COPY.muted : COPY.mute),
                solo.value ? null : tool(false, { title: COPY.popOutTitle(a.caption), 'aria-label': COPY.popOutTitle(a.caption), 'data-testid': 'channel-popout', onClick: popOut }, COPY.popOut),
              ]),
            ]),
            showCfg.value ? cfgStrip(a.caption) : null,
            searching.value ? searchStrip() : null,
            messages(a),
            replyTo.value ? h('div', { class: 'replybar', 'data-testid': 'channel-replybar' }, [
              h('span', [`${COPY.replyingTo} `, h('b', replyTo.value)]),
              h('button', { type: 'button', class: cls(c.cmd, 'rb-cancel'), 'aria-label': COPY.cancelReply, onClick: cancelReply }, COPY.cancel),
            ]) : null,
            h('form', { class: 'composer', onSubmit: send }, [
              h('span', { class: cls('chev', c.glow), 'aria-hidden': 'true' }, '❯'),
              h('input', {
                ref: composer, value: draft.value, class: cls('in', c.field), autocomplete: 'off', placeholder: COPY.placeholder(a.caption), 'aria-label': COPY.placeholder(a.caption),
                'data-testid': 'channel-input', onInput: (e: Event) => { draft.value = (e.target as HTMLInputElement).value; },
                onKeydown: (e: KeyboardEvent) => { if (e.key === 'Escape' && replyTo.value) { replyTo.value = ''; e.preventDefault(); e.stopPropagation(); } },
              }),
            ]),
          ]));
        }
        return h('section', {
          class: cls('mu-channels', 'chan', !!solo.value && 'solo'), 'aria-label': COPY.title, 'data-testid': 'channels',
          'data-channel': solo.value || undefined, onKeydown: onPanelKey,
        }, kids);
      };
    },
  });
}

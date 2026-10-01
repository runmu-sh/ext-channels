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
import { computed, defineComponent, h, nextTick, ref, shallowRef, watch, type PropType, type VNode } from 'vue';
import { CHANNEL_COLORS, type ChannelColor, type ChannelView, type ChannelsView, type Mu } from '@muclient/sdk';
import { COPY } from './copy.ts';
import {
  activeHitId, activeKeyOf, activeOf, bodyOf, clampHit, countText, hhmm, isFindKey, messagesOf, popOutArgs, railOf,
  readAction, searchKey, searchMessages, soloOf, stepIndex, swatchStyle, tintStyle,
} from './logic.ts';

type Alert = 'all' | 'mentions' | 'none';
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

export function createChannelsPanel(mu: Mu) {
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
      const st = shallowRef<ChannelsView | null>(null);
      // Follow the panel's session: a new sid drops the old subscription and watches the new one (watch calls
      // back with the current view at once, so no separate get).
      watch(() => props.sid, (sid, _old, onCleanup) => {
        st.value = null;
        if (!sid) return;
        onCleanup(mu.channels.watch((v) => { st.value = v; }, sid));
      }, { immediate: true });

      const activeKey = computed(() => activeKeyOf(st.value, solo.value));
      const active = computed(() => activeOf(st.value, solo.value));
      const rail = computed(() => railOf(st.value, solo.value));
      const msgs = computed(() => messagesOf(st.value, solo.value));
      const showCfg = ref(false);
      const draft = ref('');
      const view = ref<HTMLElement | null>(null);

      const muted = computed(() => !!active.value?.muted);
      const alert = computed<Alert>(() => active.value?.alert ?? 'mentions');
      const color = computed<ChannelColor | null>(() => active.value?.color ?? null);
      const configure = (patch: { muted?: boolean; alert?: Alert; color?: ChannelColor | null }) => {
        if (props.sid && active.value) mu.channels.configure(active.value.key, patch, props.sid);
      };

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

      function pick(key: string) { if (props.sid && !solo.value) mu.channels.select(key, props.sid); }
      function cfgFor(key: string) { pick(key); showCfg.value = true; }
      function popOut() {
        const ch = active.value;
        if (!props.sid || !ch) return;
        mu.panels.open(...popOutArgs(ch, props.sid));
      }
      async function send(e: Event) {
        e.preventDefault();
        if (!props.sid || !draft.value.trim()) return;
        const t = draft.value;
        draft.value = '';
        await mu.channels.send(t, activeKey.value, props.sid);
      }
      // Keyed on the last message id, not the count: the host caps a channel's history (500), so the length
      // stops changing once it is full while new messages keep arriving.
      watch([() => msgs.value[msgs.value.length - 1]?.id, activeKey, () => active.value?.unread], async () => {
        // Reading a channel clears its unread count (the popped-out view reads its own channel).
        const r = props.sid ? readAction(st.value, solo.value) : null;
        if (r && props.sid) { if (r.op === 'markRead') mu.channels.markRead(r.key, props.sid); else mu.channels.select(r.key, props.sid); }
        await nextTick();
        if (view.value && activeHit.value < 0) view.value.scrollTop = view.value.scrollHeight;
      }, { immediate: true });

      const chip = (ch: ChannelView): VNode => h('button', {
        key: ch.key, type: 'button', 'data-key': ch.key,
        class: cls('cc', ch.key === activeKey.value && 'on', ch.muted && 'muted', ch.mention && 'mention', !!ch.color && 'tinted'),
        style: tintStyle(ch.color), 'data-color': ch.color || undefined, 'aria-pressed': String(ch.key === activeKey.value),
        onClick: () => pick(ch.key),
        onContextmenu: (e: MouseEvent) => { e.preventDefault(); cfgFor(ch.key); },
      }, [
        h('span', { class: 'name' }, ch.caption),
        ch.mention ? h('span', { class: 'at', 'aria-hidden': 'true' }, '@') : null,
        ch.online !== null ? h('span', { class: 'online', title: COPY.online(ch.online) }, String(ch.online)) : null,
        ch.unread ? h('span', { class: cls('bd', c.count), 'aria-label': COPY.unread(ch.unread) }, String(ch.unread)) : null,
      ]);

      const tool = (on: boolean, extra: Record<string, unknown>, label: string) =>
        h('button', { type: 'button', class: cls(c.cmd, 't', on && 'on'), ...extra }, label);

      const cfgStrip = () => h('div', { class: 'ccfg', 'data-testid': 'channel-cfg' }, [
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
            class: cls('sel', c.field), value: alert.value,
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

      const messages = (tint: unknown) => h('div', {
        ref: view, class: 'msgs', role: 'log', 'data-focus-region': 'channels', tabindex: '-1', 'data-testid': 'channel-msgs', style: tintStyle(tint),
      }, msgs.value.length ? msgs.value.map((m) => h('div', {
        key: m.id, 'data-mid': m.id, role: 'article',
        class: cls('msg', m.mention && 'mention', hitSet.value.has(m.id) && 'hit', m.id === activeHit.value && 'active'),
      }, [
        h('span', { class: 'mts' }, hhmm(m.ts)),
        h('span', { class: 'sender' }, m.sender),
        h('span', { class: 'b text' }, m.text),
        m.reactions ? h('span', { class: 'reacts' }, Object.entries(m.reactions).map(([r, n]) => h('span', { key: r, class: 'react' }, `${r} ${n}`))) : null,
      ])) : [h('p', { class: c.empty }, COPY.noMessages)]);

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
              a.topic ? h('span', { class: 'topic' }, a.topic) : null,
              h('span', { class: 'tools' }, [
                tool(showCfg.value, { title: COPY.settingsTitle, 'aria-expanded': String(showCfg.value), 'data-testid': 'channel-cfg-btn', onClick: () => { showCfg.value = !showCfg.value; } }, COPY.settings),
                tool(searching.value, { title: COPY.searchTitle, 'aria-expanded': String(searching.value), 'data-testid': 'channel-search-btn', onClick: toggleSearch }, COPY.search),
                tool(muted.value, { title: COPY.muteTitle, 'aria-pressed': String(muted.value), 'data-testid': 'channel-mute', onClick: () => configure({ muted: !muted.value }) }, muted.value ? COPY.unmute : COPY.mute),
                solo.value ? null : tool(false, { title: COPY.popOutTitle(a.caption), 'data-testid': 'channel-popout', onClick: popOut }, COPY.popOut),
              ]),
            ]),
            showCfg.value ? cfgStrip() : null,
            searching.value ? searchStrip() : null,
            messages(a.color),
            h('form', { class: 'composer', onSubmit: send }, [
              h('span', { class: cls('chev', c.glow), 'aria-hidden': 'true' }, '❯'),
              h('input', {
                value: draft.value, class: cls('in', c.field), autocomplete: 'off', placeholder: COPY.placeholder(a.caption), 'aria-label': COPY.placeholder(a.caption),
                'data-testid': 'channel-input', onInput: (e: Event) => { draft.value = (e.target as HTMLInputElement).value; },
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

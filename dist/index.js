// src/index.ts
import { defineExtension } from "@muclient/sdk";

// src/copy.ts
var COPY = {
  title: "Channels",
  awaiting: "Waiting for channels",
  none: "No channels",
  noMessages: "No messages yet",
  noChannel: "No channel.",
  placeholder: (ch) => `message ${ch}`,
  settings: "Settings",
  settingsTitle: "channel settings",
  muted: "Muted",
  mute: "Mute",
  unmute: "Unmute",
  muteTitle: "mute channel",
  alerts: "Alerts",
  alertAll: "Every message",
  alertMentions: "Mentions only",
  alertNone: "None",
  online: (n) => `${n} online`,
  unread: (n) => `${n} unread`,
  rail: "Channels",
  color: "Colour",
  colorDefault: "default",
  colors: { accent: "accent", "accent-bright": "bright accent", gold: "gold", alert: "alert", ok: "ok", fg: "text", "fg-dim": "dim text" },
  search: "Search",
  searchTitle: "search this channel",
  searchPlaceholder: "search channel",
  noMatch: "no match",
  badRegex: "not a valid regex",
  prev: "previous",
  next: "next",
  close: "close",
  prevLabel: "Prev",
  nextLabel: "Next",
  closeLabel: "Close",
  popOut: "Pop out",
  popOutTitle: (ch) => `pop out ${ch}`,
  soloTitle: (ch) => `Channel \xB7 ${ch}`,
  gone: (ch) => `channel ${ch} is not open here`
};

// src/style.ts
var CHANNELS_CSS = `
.mu-channels { --u: var(--shell-font-size, 15px); height: 100%; display: flex; flex-direction: column; background: var(--bg-elev); min-height: 0; font-size: var(--u); box-sizing: border-box; }
.mu-channels .awaiting, .mu-channels .rail-empty, .mu-channels .msgs .empty { color: var(--fg-faint); font-style: normal; font-size: calc(var(--u) * .64); letter-spacing: .14em; text-transform: uppercase; }
.mu-channels .awaiting { padding: 10px; margin: 0; }
.mu-channels .rail { display: flex; flex-wrap: wrap; gap: 2px; padding: 4px 6px; border-bottom: 1px solid var(--accent); flex: none; }
.mu-channels .cc { display: inline-flex; gap: .6ch; align-items: center; border: 0; background: none; padding: 2px .8ch; min-height: 24px; font-size: calc(var(--u) * .66); letter-spacing: .14em; text-transform: uppercase; color: var(--fg-dim); transition: color .12s ease, background-color .12s ease; }
.mu-channels .cc:hover { color: var(--fg); background: var(--tint-toggle); }
.mu-channels .cc.on { color: var(--bg-deep); background: var(--accent); }
.mu-channels .cc.tinted:not(.on) .name { color: var(--chan); }
.mu-channels .cc.mention:not(.on) .name { color: var(--gold); }
.mu-channels .cc.muted .name { opacity: .5; text-decoration: line-through; }
.mu-channels .at { color: var(--gold); }
.mu-channels .online { color: var(--ok); font-size: calc(var(--u) * .6); letter-spacing: 0; }
.mu-channels .cc.on .at, .mu-channels .cc.on .online { color: inherit; }
.mu-channels .bd { font-size: calc(var(--u) * .6); }
.mu-channels .cv { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.mu-channels .head { display: flex; align-items: baseline; gap: 1ch; padding: 5px 10px; border-bottom: 1px solid var(--border); flex: none; }
.mu-channels .title { color: var(--accent-bright); text-transform: uppercase; letter-spacing: .16em; font-size: calc(var(--u) * .78); }
.mu-channels .topic { color: var(--fg-dim); font-size: calc(var(--u) * .72); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mu-channels .tools { margin-left: auto; display: flex; gap: 2px; flex-wrap: wrap; justify-content: flex-end; }
.mu-channels .t { font-size: calc(var(--u) * .68); }
.mu-channels .ccfg { display: flex; flex-wrap: wrap; gap: 12px; padding: 6px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.mu-channels .cfg-row { display: flex; align-items: center; gap: 6px; font-size: calc(var(--u) * .72); color: var(--fg-dim); }
.mu-channels .sel { color: var(--fg); background: var(--bg-deep); font-size: calc(var(--u) * .72); min-height: 24px; padding: 2px; }
.mu-channels .swatches { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.mu-channels .sw { width: 24px; height: 24px; border: 1px solid var(--border-bright); background: var(--bg); display: inline-grid; place-items: center; color: var(--fg-faint); font-size: calc(var(--u) * .72); transition: border-color .12s ease; }
.mu-channels .sw:not(.none)::before { content: ''; width: 14px; height: 14px; background: var(--sw); }
.mu-channels .sw:hover { border-color: var(--accent); }
.mu-channels .sw.on { border-color: var(--accent-bright); box-shadow: inset 0 0 0 1px var(--accent-bright); }
.mu-channels .csearch { display: flex; align-items: center; gap: .5ch; padding: 3px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.mu-channels .s-glyph { color: var(--accent); }
.mu-channels .csearch input { flex: 1; min-width: 0; background: transparent; border: 0; color: var(--fg); font-size: calc(var(--u) * .82); padding: 2px 0; }
.mu-channels .csearch input::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.mu-channels .cnt { color: var(--fg-dim); font-size: calc(var(--u) * .72); min-width: 3.5em; text-align: right; }
.mu-channels .cnt.err { color: var(--alert); }
.mu-channels .s-btn { font-size: calc(var(--u) * .68); }
.mu-channels .msgs { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 10px; line-height: 1.5; display: flex; flex-direction: column; }
.mu-channels .msgs > :first-child { margin-top: auto; }
.mu-channels .msgs .empty { margin: 0; }
.mu-channels .msg { padding: 1px 0; font-size: calc(var(--u) * .85); overflow-wrap: anywhere; }
.mu-channels .mts { color: var(--fg-faint); font-size: .72em; margin-right: .6ch; user-select: none; }
.mu-channels .sender { color: var(--chan, var(--gold)); margin-right: .6ch; }
.mu-channels .text { color: var(--fg); white-space: pre-wrap; }
.mu-channels .msg.mention { border-left: 2px solid var(--gold); padding-left: 7px; margin-left: -9px; box-shadow: -4px 0 8px -6px var(--gold); }
.mu-channels .msg.hit { background: var(--tint-hit); }
.mu-channels .msg.hit.active { background: var(--tint-hit-active); outline: 1px solid var(--accent); outline-offset: -1px; }
.mu-channels .reacts { margin-left: .5ch; }
.mu-channels .react { border: 0; border-bottom: 1px solid var(--border-bright); background: none; color: var(--fg-dim); font-size: .72em; padding: 0 4px; margin-left: 3px; }
.mu-channels .composer { display: flex; align-items: center; gap: .6rem; padding: 6px 10px; border-top: 1px solid var(--accent); flex: none; }
.mu-channels .chev { color: var(--accent-bright); }
.mu-channels .in { flex: 1; min-width: 0; min-height: 24px; background: transparent; outline: none; color: var(--fg); caret-color: var(--accent-bright); font-size: calc(var(--u) * .85); padding: 2px; }
.mu-channels .in::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.mu-channels .composer:focus-within { box-shadow: inset 0 0 0 2px var(--accent-bright); }
`;

// src/panel.ts
import { computed, defineComponent, h, nextTick, ref, shallowRef, watch } from "vue";
import { CHANNEL_COLORS as CHANNEL_COLORS2 } from "@muclient/sdk";

// src/logic.ts
import { CHANNEL_COLORS } from "@muclient/sdk";
function makeMatcher(q) {
  const t = q.trim();
  if (!t) return null;
  const m = /^\/(.+)\/([a-z]*)$/s.exec(t);
  if (m) {
    try {
      const re = new RegExp(m[1], m[2].replace(/[gy]/g, ""));
      return { ok: true, test: (s) => re.test(s) };
    } catch {
      return { ok: false, error: "bad" };
    }
  }
  if (t.startsWith("/") && t.length > 1 && !t.endsWith("/")) {
    try {
      const re = new RegExp(t.slice(1), "i");
      return { ok: true, test: (s) => re.test(s) };
    } catch {
      return { ok: false, error: "bad" };
    }
  }
  const needle = t.toLowerCase();
  return { ok: true, test: (s) => s.toLowerCase().includes(needle) };
}
var searchText = (m) => m.sender ? `${m.sender}: ${m.text}` : m.text;
function searchMessages(msgs, q) {
  const m = makeMatcher(q);
  if (!m) return { hits: [], error: false };
  if (!m.ok) return { hits: [], error: true };
  return { hits: msgs.filter((x) => m.test(searchText(x))).map((x) => x.id), error: false };
}
function countText(found, query, hitIdx) {
  if (found.error) return COPY.badRegex;
  if (!query.trim()) return "";
  return found.hits.length ? `${hitIdx + 1}/${found.hits.length}` : COPY.noMatch;
}
function stepIndex(idx, dir, n) {
  if (!n) return idx;
  return (idx + dir + n) % n;
}
function clampHit(idx, n) {
  let i = idx;
  if (i >= n) i = n - 1;
  if (i < 0 && n) i = n - 1;
  return i;
}
var activeHitId = (found, idx) => idx >= 0 ? found.hits[idx] ?? -1 : -1;
function searchKey(e) {
  if (e.key === "Escape") return "close";
  if (e.key === "Enter") return e.shiftKey ? "next" : "prev";
  if (e.key === "ArrowUp") return "prev";
  if (e.key === "ArrowDown") return "next";
  return null;
}
var isFindKey = (e) => !!(e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "f";
var isChannelColor = (v) => typeof v === "string" && CHANNEL_COLORS.includes(v);
var colorVar = (c) => isChannelColor(c) ? `var(--${c})` : null;
var tintStyle = (c) => {
  const v = colorVar(c);
  return v ? { "--chan": v } : {};
};
var swatchStyle = (c) => ({ "--sw": `var(--${c})` });
var soloOf = (params) => typeof params?.channel === "string" ? params.channel : "";
var activeKeyOf = (v, solo) => solo || v?.active || "";
var activeOf = (v, solo) => {
  const k = activeKeyOf(v, solo);
  return v?.channels.find((c) => c.key === k) ?? null;
};
var railOf = (v, solo) => !v ? [] : solo ? v.channels.filter((c) => c.key === solo) : v.channels;
var messagesOf = (v, solo) => {
  const a = activeOf(v, solo);
  return v && a ? v.messages[a.key] ?? [] : [];
};
function bodyOf(v, solo) {
  if (solo && v?.known && !activeOf(v, solo)) return "gone";
  if (!v || !v.known) return "awaiting";
  return activeOf(v, solo) ? "view" : "none";
}
function readAction(v, solo) {
  const a = activeOf(v, solo);
  if (!a || !a.unread) return null;
  return { op: solo ? "markRead" : "select", key: a.key };
}
var popOutArgs = (ch, sid) => ["channel", { channel: ch.key, instance: ch.key }, { sid, title: COPY.soloTitle(ch.caption) }];
var hhmm = (ts) => {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// src/panel.ts
var cls = (...xs) => xs.filter(Boolean).join(" ");
var INPUT = '[data-testid="channel-input"]';
function snapshotDraft(el) {
  const v = el.querySelector(INPUT)?.value;
  return v ? v : void 0;
}
function restoreDraft(el, state) {
  const input = el.querySelector(INPUT);
  if (typeof state !== "string" || !state || !input) return;
  input.value = state;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
function createChannelsPanel(mu) {
  const c = mu.ui.css;
  return defineComponent({
    name: "ChannelsPanel",
    props: {
      sid: { type: String, default: null },
      worldId: { type: String, default: null },
      params: { type: Object, default: () => ({}) }
    },
    setup(props) {
      const solo = computed(() => soloOf(props.params));
      const st = shallowRef(null);
      watch(() => props.sid, (sid, _old, onCleanup) => {
        st.value = null;
        if (!sid) return;
        onCleanup(mu.channels.watch((v) => {
          st.value = v;
        }, sid));
      }, { immediate: true });
      const activeKey = computed(() => activeKeyOf(st.value, solo.value));
      const active = computed(() => activeOf(st.value, solo.value));
      const rail = computed(() => railOf(st.value, solo.value));
      const msgs = computed(() => messagesOf(st.value, solo.value));
      const showCfg = ref(false);
      const draft = ref("");
      const view = ref(null);
      const muted = computed(() => !!active.value?.muted);
      const alert = computed(() => active.value?.alert ?? "mentions");
      const color = computed(() => active.value?.color ?? null);
      const configure = (patch) => {
        if (props.sid && active.value) mu.channels.configure(active.value.key, patch, props.sid);
      };
      const searching = ref(false);
      const query = ref("");
      const searchInput = ref(null);
      const hitIdx = ref(-1);
      const found = computed(() => searchMessages(msgs.value, searching.value ? query.value : ""));
      const hitSet = computed(() => new Set(found.value.hits));
      const activeHit = computed(() => activeHitId(found.value, hitIdx.value));
      const count = computed(() => countText(found.value, query.value, hitIdx.value));
      async function reveal() {
        await nextTick();
        const id = activeHit.value;
        if (id < 0 || !view.value) return;
        view.value.querySelector(`[data-mid="${id}"]`)?.scrollIntoView?.({ block: "nearest" });
      }
      watch(() => [query.value, activeKey.value, searching.value], () => {
        hitIdx.value = found.value.hits.length - 1;
        void reveal();
      });
      watch(() => found.value.hits.length, (n) => {
        hitIdx.value = clampHit(hitIdx.value, n);
      });
      function step(dir) {
        const n = found.value.hits.length;
        if (!n) return;
        hitIdx.value = stepIndex(hitIdx.value, dir, n);
        void reveal();
      }
      function openSearch() {
        searching.value = true;
        void nextTick(() => {
          searchInput.value?.focus();
          searchInput.value?.select();
        });
      }
      function closeSearch() {
        query.value = "";
        searching.value = false;
        view.value?.focus();
      }
      function toggleSearch() {
        if (searching.value) closeSearch();
        else openSearch();
      }
      function onSearchKey(e) {
        const k = searchKey(e);
        if (k === "close") {
          closeSearch();
          e.preventDefault();
          e.stopPropagation();
        } else if (k) {
          step(k === "next" ? 1 : -1);
          e.preventDefault();
        }
      }
      function onPanelKey(e) {
        if (isFindKey(e) && st.value?.known) {
          openSearch();
          e.preventDefault();
          e.stopPropagation();
        }
      }
      function pick(key) {
        if (props.sid && !solo.value) mu.channels.select(key, props.sid);
      }
      function cfgFor(key) {
        pick(key);
        showCfg.value = true;
      }
      function popOut() {
        const ch = active.value;
        if (!props.sid || !ch) return;
        mu.panels.open(...popOutArgs(ch, props.sid));
      }
      async function send(e) {
        e.preventDefault();
        if (!props.sid || !draft.value.trim()) return;
        const t = draft.value;
        draft.value = "";
        await mu.channels.send(t, activeKey.value, props.sid);
      }
      watch([() => msgs.value[msgs.value.length - 1]?.id, activeKey, () => active.value?.unread], async () => {
        const r = props.sid ? readAction(st.value, solo.value) : null;
        if (r && props.sid) {
          if (r.op === "markRead") mu.channels.markRead(r.key, props.sid);
          else mu.channels.select(r.key, props.sid);
        }
        await nextTick();
        if (view.value && activeHit.value < 0) view.value.scrollTop = view.value.scrollHeight;
      }, { immediate: true });
      const chip = (ch) => h("button", {
        key: ch.key,
        type: "button",
        "data-key": ch.key,
        class: cls("cc", ch.key === activeKey.value && "on", ch.muted && "muted", ch.mention && "mention", !!ch.color && "tinted"),
        style: tintStyle(ch.color),
        "data-color": ch.color || void 0,
        "aria-pressed": String(ch.key === activeKey.value),
        onClick: () => pick(ch.key),
        onContextmenu: (e) => {
          e.preventDefault();
          cfgFor(ch.key);
        }
      }, [
        h("span", { class: "name" }, ch.caption),
        ch.mention ? h("span", { class: "at", "aria-hidden": "true" }, "@") : null,
        ch.online !== null ? h("span", { class: "online", title: COPY.online(ch.online) }, String(ch.online)) : null,
        ch.unread ? h("span", { class: cls("bd", c.count), "aria-label": COPY.unread(ch.unread) }, String(ch.unread)) : null
      ]);
      const tool = (on, extra, label) => h("button", { type: "button", class: cls(c.cmd, "t", on && "on"), ...extra }, label);
      const cfgStrip = () => h("div", { class: "ccfg", "data-testid": "channel-cfg" }, [
        h("div", { class: "cfg-row" }, [
          h("span", COPY.color),
          h("span", { class: "swatches", role: "radiogroup", "aria-label": COPY.color, "data-testid": "channel-colors" }, [
            h("button", {
              type: "button",
              class: cls("sw", "none", !color.value && "on"),
              role: "radio",
              "aria-checked": String(!color.value),
              title: COPY.colorDefault,
              "aria-label": COPY.colorDefault,
              "data-color": "",
              onClick: () => configure({ color: null })
            }, "\xD7"),
            ...CHANNEL_COLORS2.map((k) => h("button", {
              key: k,
              type: "button",
              class: cls("sw", color.value === k && "on"),
              role: "radio",
              "aria-checked": String(color.value === k),
              style: swatchStyle(k),
              title: COPY.colors[k],
              "aria-label": COPY.colors[k],
              "data-color": k,
              onClick: () => configure({ color: k })
            }))
          ])
        ]),
        h("label", { class: "cfg-row" }, [
          h("span", COPY.alerts),
          h("select", {
            class: cls("sel", c.field),
            value: alert.value,
            onChange: (e) => configure({ alert: e.target.value })
          }, [
            h("option", { value: "all", selected: alert.value === "all" }, COPY.alertAll),
            h("option", { value: "mentions", selected: alert.value === "mentions" }, COPY.alertMentions),
            h("option", { value: "none", selected: alert.value === "none" }, COPY.alertNone)
          ])
        ])
      ]);
      const searchStrip = () => h("div", { class: "csearch", "data-testid": "channel-search" }, [
        h("span", { class: "s-glyph", "aria-hidden": "true" }, "\u2315"),
        h("input", {
          ref: searchInput,
          value: query.value,
          placeholder: COPY.searchPlaceholder,
          "aria-label": COPY.searchPlaceholder,
          spellcheck: "false",
          "data-testid": "channel-search-input",
          onInput: (e) => {
            query.value = e.target.value;
          },
          onKeydown: onSearchKey
        }),
        h("span", { class: cls("cnt", found.value.error && "err"), "data-testid": "channel-search-count", "aria-live": "polite" }, count.value),
        h("button", { type: "button", class: cls(c.cmd, "s-btn"), "aria-label": COPY.prev, "data-s": "prev", onClick: () => step(-1) }, COPY.prevLabel),
        h("button", { type: "button", class: cls(c.cmd, "s-btn"), "aria-label": COPY.next, "data-s": "next", onClick: () => step(1) }, COPY.nextLabel),
        h("button", { type: "button", class: cls(c.cmd, "s-btn"), "aria-label": COPY.close, "data-s": "close", onClick: closeSearch }, COPY.closeLabel)
      ]);
      const messages = (tint) => h("div", {
        ref: view,
        class: "msgs",
        role: "log",
        "data-focus-region": "channels",
        tabindex: "-1",
        "data-testid": "channel-msgs",
        style: tintStyle(tint)
      }, msgs.value.length ? msgs.value.map((m) => h("div", {
        key: m.id,
        "data-mid": m.id,
        role: "article",
        class: cls("msg", m.mention && "mention", hitSet.value.has(m.id) && "hit", m.id === activeHit.value && "active")
      }, [
        h("span", { class: "mts" }, hhmm(m.ts)),
        h("span", { class: "sender" }, m.sender),
        h("span", { class: "b text" }, m.text),
        m.reactions ? h("span", { class: "reacts" }, Object.entries(m.reactions).map(([r, n]) => h("span", { key: r, class: "react" }, `${r} ${n}`))) : null
      ])) : [h("p", { class: c.empty }, COPY.noMessages)]);
      return () => {
        const body = bodyOf(st.value, solo.value);
        const kids = [];
        if (body === "gone") {
          kids.push(h("p", { class: cls(c.empty, "awaiting"), "data-testid": "channels-gone" }, COPY.gone(solo.value)));
        } else {
          kids.push(h("div", { class: "rail", role: "group", "aria-label": COPY.rail, "data-testid": "channel-rail" }, [
            ...rail.value.map(chip),
            rail.value.length ? null : h("span", { class: "rail-empty" }, COPY.none)
          ]));
          const a = active.value;
          if (body === "awaiting") kids.push(h("p", { class: cls(c.empty, "awaiting"), tabindex: "-1", "data-focus-region": "channels", "data-testid": "channels-empty" }, COPY.awaiting));
          else if (body === "none" || !a) kids.push(h("p", { class: cls(c.empty, "awaiting"), "data-testid": "channels-none" }, COPY.noChannel));
          else kids.push(h("div", { class: "cv" }, [
            h("div", { class: "head" }, [
              h("span", { class: cls("title", c.glow), "data-testid": "channel-title" }, a.caption),
              a.topic ? h("span", { class: "topic" }, a.topic) : null,
              h("span", { class: "tools" }, [
                tool(showCfg.value, { title: COPY.settingsTitle, "aria-expanded": String(showCfg.value), "data-testid": "channel-cfg-btn", onClick: () => {
                  showCfg.value = !showCfg.value;
                } }, COPY.settings),
                tool(searching.value, { title: COPY.searchTitle, "aria-expanded": String(searching.value), "data-testid": "channel-search-btn", onClick: toggleSearch }, COPY.search),
                tool(muted.value, { title: COPY.muteTitle, "aria-pressed": String(muted.value), "data-testid": "channel-mute", onClick: () => configure({ muted: !muted.value }) }, muted.value ? COPY.unmute : COPY.mute),
                solo.value ? null : tool(false, { title: COPY.popOutTitle(a.caption), "data-testid": "channel-popout", onClick: popOut }, COPY.popOut)
              ])
            ]),
            showCfg.value ? cfgStrip() : null,
            searching.value ? searchStrip() : null,
            messages(a.color),
            h("form", { class: "composer", onSubmit: send }, [
              h("span", { class: cls("chev", c.glow), "aria-hidden": "true" }, "\u276F"),
              h("input", {
                value: draft.value,
                class: cls("in", c.field),
                autocomplete: "off",
                placeholder: COPY.placeholder(a.caption),
                "aria-label": COPY.placeholder(a.caption),
                "data-testid": "channel-input",
                onInput: (e) => {
                  draft.value = e.target.value;
                }
              })
            ])
          ]));
        }
        return h("section", {
          class: cls("mu-channels", "chan", !!solo.value && "solo"),
          "aria-label": COPY.title,
          "data-testid": "channels",
          "data-channel": solo.value || void 0,
          onKeydown: onPanelKey
        }, kids);
      };
    }
  });
}

// src/index.ts
function setup(mu) {
  mu.ui.style(CHANNELS_CSS);
  const mount = mu.panels.vue(createChannelsPanel(mu));
  mu.panels.register({ id: "channels", title: COPY.title, singleton: true, defaultPosition: "right-bottom", order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft });
  mu.panels.register({ id: "channel", title: COPY.title, singleton: false, defaultPosition: "right-bottom", inViewsMenu: false, order: 21, mount });
  const added = /* @__PURE__ */ new Set();
  mu.gmcp.on("Comm.Channel", (_d, { sid }) => {
    if (added.has(sid)) return;
    added.add(sid);
    mu.panels.autoAdd("channels", sid);
  });
}
var index_default = defineExtension({
  activate(ctx) {
    setup(ctx.mu);
  }
});
export {
  CHANNELS_CSS,
  COPY,
  index_default as default,
  setup
};

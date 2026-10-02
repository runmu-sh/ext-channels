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
  /** The Mute tool while the channel is muted (a pressed toggle, as Underspire's). */
  muted: "Muted",
  mute: "Mute",
  /** @deprecated since 1.1.0 the pressed tool reads {@link COPY.muted}; kept for callers of the 1.0 export. */
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
  gone: (ch) => `channel ${ch} is not open here`,
  // ── 1.1.0 ──
  /** A chip's accessible name: "vox, 3 unread, mentioned, 4 online, muted". */
  chipLabel: (name, unread, mention, online, muted) => [name, unread ? `${unread} unread` : "", mention ? "mentioned" : "", online !== null ? `${online} online` : "", muted ? "muted" : ""].filter(Boolean).join(", "),
  settingsLabel: (ch) => `${ch} channel settings`,
  searchLabel: (ch) => `search ${ch}`,
  alertsLabel: (ch) => `${ch} alerts`,
  messagesLabel: (ch) => `${ch} messages`,
  /** A message's accessible name: "Orrin, 04:12: the bells". */
  messageLabel: (sender, time, text) => sender ? `${sender}, ${time}: ${text}` : `${time}: ${text}`,
  newDivider: "new",
  newDividerLabel: "new messages",
  /** The jump-to-latest button while scrolled up. */
  latest: (n) => `${n} new message${n === 1 ? "" : "s"}`,
  latestLabel: "jump to the latest message",
  reply: "Reply",
  replyLabel: (sender) => `reply to ${sender}`,
  replyingTo: "Reply to",
  cancel: "Cancel",
  cancelReply: "cancel the reply",
  menuReply: (sender) => `Reply to ${sender}`,
  menuCopy: "Copy message"
};

// src/style.ts
var CHANNELS_CSS = `
.ext-panel[data-ext="channels"] .mu-channels { --u: var(--shell-font-size, 15px); height: 100%; display: flex; flex-direction: column; background: var(--bg-elev); min-height: 0; font-size: var(--u); box-sizing: border-box; }
.ext-panel[data-ext="channels"] .mu-channels .awaiting, .ext-panel[data-ext="channels"] .mu-channels .rail-empty, .ext-panel[data-ext="channels"] .mu-channels .msgs .empty { color: var(--fg-faint); font-style: normal; font-size: calc(var(--u) * .64); letter-spacing: .14em; text-transform: uppercase; }
.ext-panel[data-ext="channels"] .mu-channels .awaiting { padding: 10px; margin: 0; }
.ext-panel[data-ext="channels"] .mu-channels .rail { display: flex; flex-wrap: wrap; gap: 2px; padding: 4px 6px; border-bottom: 1px solid var(--accent); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .cc { display: inline-flex; gap: .6ch; align-items: center; border: 0; background: none; padding: 2px .8ch; min-height: 24px; font-size: calc(var(--u) * .66); letter-spacing: .14em; text-transform: uppercase; color: var(--fg-dim); transition: color .12s ease, background-color .12s ease; }
.ext-panel[data-ext="channels"] .mu-channels .cc:hover { color: var(--fg); background: var(--tint-toggle); }
.ext-panel[data-ext="channels"] .mu-channels .cc.on { color: var(--bg-deep); background: var(--accent); }
.ext-panel[data-ext="channels"] .mu-channels .cc.tinted:not(.on) .name { color: var(--chan); }
.ext-panel[data-ext="channels"] .mu-channels .cc.mention:not(.on) .name { color: var(--gold); }
.ext-panel[data-ext="channels"] .mu-channels .cc.muted .name { opacity: .5; text-decoration: line-through; }
.ext-panel[data-ext="channels"] .mu-channels .at { color: var(--gold); }
.ext-panel[data-ext="channels"] .mu-channels .online { color: var(--ok); font-size: calc(var(--u) * .6); letter-spacing: 0; }
.ext-panel[data-ext="channels"] .mu-channels .cc.on .at, .ext-panel[data-ext="channels"] .mu-channels .cc.on .online { color: inherit; }
.ext-panel[data-ext="channels"] .mu-channels .bd { font-size: calc(var(--u) * .6); }
.ext-panel[data-ext="channels"] .mu-channels .cv { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.ext-panel[data-ext="channels"] .mu-channels .head { display: flex; align-items: baseline; gap: 1ch; padding: 5px 10px; border-bottom: 1px solid var(--border); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .title { color: var(--accent-bright); text-transform: uppercase; letter-spacing: .16em; font-size: calc(var(--u) * .78); }
.ext-panel[data-ext="channels"] .mu-channels .topic { color: var(--fg-dim); font-size: calc(var(--u) * .72); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ext-panel[data-ext="channels"] .mu-channels .tools { margin-left: auto; display: flex; gap: 2px; flex-wrap: wrap; justify-content: flex-end; }
.ext-panel[data-ext="channels"] .mu-channels .t { font-size: calc(var(--u) * .68); }
.ext-panel[data-ext="channels"] .mu-channels .ccfg { display: flex; flex-wrap: wrap; gap: 12px; padding: 6px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .cfg-row { display: flex; align-items: center; gap: 6px; font-size: calc(var(--u) * .72); color: var(--fg-dim); }
.ext-panel[data-ext="channels"] .mu-channels .sel { color: var(--fg); background: var(--bg-deep); font-size: calc(var(--u) * .72); min-height: 24px; padding: 2px; }
.ext-panel[data-ext="channels"] .mu-channels .swatches { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.ext-panel[data-ext="channels"] .mu-channels .sw { width: 24px; height: 24px; border: 1px solid var(--border-bright); background: var(--bg); display: inline-grid; place-items: center; color: var(--fg-faint); font-size: calc(var(--u) * .72); transition: border-color .12s ease; }
.ext-panel[data-ext="channels"] .mu-channels .sw:not(.none)::before { content: ''; width: 14px; height: 14px; background: var(--sw); }
.ext-panel[data-ext="channels"] .mu-channels .sw:hover { border-color: var(--accent); }
.ext-panel[data-ext="channels"] .mu-channels .sw.on { border-color: var(--accent-bright); box-shadow: inset 0 0 0 1px var(--accent-bright); }
.ext-panel[data-ext="channels"] .mu-channels .csearch { display: flex; align-items: center; gap: .5ch; padding: 3px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .s-glyph { color: var(--accent); }
.ext-panel[data-ext="channels"] .mu-channels .csearch input { flex: 1; min-width: 0; background: transparent; border: 0; color: var(--fg); font-size: calc(var(--u) * .82); padding: 2px 0; }
.ext-panel[data-ext="channels"] .mu-channels .csearch input::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.ext-panel[data-ext="channels"] .mu-channels .cnt { color: var(--fg-dim); font-size: calc(var(--u) * .72); min-width: 3.5em; text-align: right; }
.ext-panel[data-ext="channels"] .mu-channels .cnt.err { color: var(--alert); }
.ext-panel[data-ext="channels"] .mu-channels .s-btn { font-size: calc(var(--u) * .68); }
.ext-panel[data-ext="channels"] .mu-channels .msgs { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 10px; line-height: 1.5; display: flex; flex-direction: column; }
.ext-panel[data-ext="channels"] .mu-channels .msgs > :first-child { margin-top: auto; }
.ext-panel[data-ext="channels"] .mu-channels .msgs .empty { margin: 0; }
.ext-panel[data-ext="channels"] .mu-channels .msg { padding: 1px 0; font-size: calc(var(--u) * .85); overflow-wrap: anywhere; }
.ext-panel[data-ext="channels"] .mu-channels .mts { color: var(--fg-faint); font-size: .72em; margin-right: .6ch; user-select: none; }
.ext-panel[data-ext="channels"] .mu-channels .sender { color: var(--chan, var(--gold)); margin-right: .6ch; }
.ext-panel[data-ext="channels"] .mu-channels .text { color: var(--fg); white-space: pre-wrap; }
.ext-panel[data-ext="channels"] .mu-channels .msg.mention { border-left: 2px solid var(--gold); padding-left: 7px; margin-left: -9px; box-shadow: -4px 0 8px -6px var(--gold); }
.ext-panel[data-ext="channels"] .mu-channels .msg.hit { background: var(--tint-hit); }
.ext-panel[data-ext="channels"] .mu-channels .msg.hit.active { background: var(--tint-hit-active); outline: 1px solid var(--accent); outline-offset: -1px; }
.ext-panel[data-ext="channels"] .mu-channels .reacts { margin-left: .5ch; }
.ext-panel[data-ext="channels"] .mu-channels .react { border: 0; border-bottom: 1px solid var(--border-bright); background: none; color: var(--fg-dim); font-size: .72em; padding: 0 4px; margin-left: 3px; }
.ext-panel[data-ext="channels"] .mu-channels .composer { display: flex; align-items: center; gap: .6rem; padding: 6px 10px; border-top: 1px solid var(--accent); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .chev { color: var(--accent-bright); }
.ext-panel[data-ext="channels"] .mu-channels .in { flex: 1; min-width: 0; min-height: 24px; background: transparent; outline: none; color: var(--fg); caret-color: var(--accent-bright); font-size: calc(var(--u) * .85); padding: 2px; }
.ext-panel[data-ext="channels"] .mu-channels .in::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.ext-panel[data-ext="channels"] .mu-channels .composer:focus-within { box-shadow: inset 0 0 0 2px var(--accent-bright); }
.ext-panel[data-ext="channels"] .mu-channels .msgs-wrap { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.ext-panel[data-ext="channels"] .mu-channels .msg { position: relative; }
.ext-panel[data-ext="channels"] .mu-channels .msg.grouped { padding-left: 2.4ch; }
.ext-panel[data-ext="channels"] .mu-channels .msg:focus-visible { outline: 1px solid var(--accent-bright); outline-offset: -1px; }
.ext-panel[data-ext="channels"] .mu-channels .mt { position: absolute; right: 0; top: 0; opacity: 0; transition: opacity .12s ease; background: var(--bg-elev); }
.ext-panel[data-ext="channels"] .mu-channels .msg:hover .mt, .ext-panel[data-ext="channels"] .mu-channels .msg:focus-within .mt, .ext-panel[data-ext="channels"] .mu-channels .msg:focus .mt { opacity: 1; }
.ext-panel[data-ext="channels"] .mu-channels .mt-btn { font-size: .78em; min-height: 20px; }
.ext-panel[data-ext="channels"] .mu-channels .divider { display: flex; align-items: center; gap: 1ch; margin: 4px 0; color: var(--accent-bright); font-size: calc(var(--u) * .6); letter-spacing: .14em; text-transform: uppercase; }
.ext-panel[data-ext="channels"] .mu-channels .divider::before, .ext-panel[data-ext="channels"] .mu-channels .divider::after { content: ''; flex: 1; border-top: 1px solid color-mix(in srgb, var(--accent) 50%, transparent); }
.ext-panel[data-ext="channels"] .mu-channels .latest { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); background: var(--bg-deep); color: var(--accent-bright); border: 1px solid var(--accent); padding: 2px 10px; font-size: calc(var(--u) * .7); letter-spacing: .14em; text-transform: uppercase; min-height: 24px; }
.ext-panel[data-ext="channels"] .mu-channels .latest:hover, .ext-panel[data-ext="channels"] .mu-channels .latest:focus-visible { background: var(--accent); color: var(--bg-deep); }
.ext-panel[data-ext="channels"] .mu-channels .replybar { display: flex; align-items: center; justify-content: space-between; gap: 1ch; padding: 3px 10px; border-top: 1px solid var(--border); color: var(--gold); font-size: calc(var(--u) * .72); flex: none; }
.ext-panel[data-ext="channels"] .mu-channels .replybar b { color: var(--fg); font-weight: normal; }
@media (prefers-reduced-motion: reduce) { .ext-panel[data-ext="channels"] .mu-channels .mt, .ext-panel[data-ext="channels"] .mu-channels .cc, .ext-panel[data-ext="channels"] .mu-channels .sw { transition: none; } }
`;

// src/panel.ts
import { computed, defineComponent, h, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
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
var GROUP_MS = 5 * 6e4;
function groupedIds(msgs) {
  const out = /* @__PURE__ */ new Set();
  for (let i = 1; i < msgs.length; i++) {
    const a = msgs[i - 1], b = msgs[i];
    if (b.sender && a.sender === b.sender && b.ts - a.ts >= 0 && b.ts - a.ts < GROUP_MS) out.add(b.id);
  }
  return out;
}
function firstUnreadId(msgs, unread) {
  if (!unread || !msgs.length) return null;
  return msgs[Math.max(0, msgs.length - unread)].id;
}
function newerThan(msgs, lastSeen) {
  if (lastSeen === null) return 0;
  let n = 0;
  for (let i = msgs.length - 1; i >= 0 && msgs[i].id !== lastSeen; i--) n++;
  return n;
}
var BOTTOM_SLACK = 24;
var atBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
var replyText = (sender, text) => sender ? `@${sender}: ${text}` : text;
function badgeOf(v) {
  const n = (v?.channels ?? []).reduce((s, c) => s + (c.muted ? 0 : c.unread), 0);
  return n > 0 ? { count: n } : null;
}
function moveIndex(key, cur, n) {
  if (!n) return null;
  if (key === "Home") return 0;
  if (key === "End") return n - 1;
  if (key === "ArrowUp") return cur < 0 ? n - 1 : Math.max(0, cur - 1);
  if (key === "ArrowDown") return cur < 0 ? n - 1 : Math.min(n - 1, cur + 1);
  return null;
}

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
function createChannelsPanel(mu, replies = /* @__PURE__ */ new Set()) {
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
      const grouped = computed(() => groupedIds(msgs.value));
      const showCfg = ref(false);
      const draft = ref("");
      const view = ref(null);
      const composer = ref(null);
      const muted = computed(() => !!active.value?.muted);
      const alert = computed(() => active.value?.alert ?? "mentions");
      const color = computed(() => active.value?.color ?? null);
      const configure = (patch) => {
        if (props.sid && active.value) mu.channels.configure(active.value.key, patch, props.sid);
      };
      const dividerAt = ref(null);
      let noted = null;
      let shownKey = "";
      const stuck = ref(true);
      const seenId = ref(null);
      const pending = computed(() => stuck.value ? 0 : newerThan(msgs.value, seenId.value));
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
        stuck.value = true;
        seenId.value = null;
      }
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
      const focusIdx = ref(-1);
      watch(activeKey, () => {
        focusIdx.value = -1;
      });
      function focusRow(i) {
        focusIdx.value = i;
        void nextTick(() => view.value?.querySelectorAll(".msg")[i]?.focus());
      }
      function onListKey(e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const rows = msgs.value.length;
        const cur = e.target === view.value ? -1 : focusIdx.value;
        const to = moveIndex(e.key, cur, rows);
        if (to !== null) {
          focusRow(to);
          e.preventDefault();
          return;
        }
        if (e.key === "Escape" && replyTo.value) {
          cancelReply();
          e.preventDefault();
        }
      }
      const replyTo = ref("");
      function startReply(sender) {
        if (!sender) return;
        replyTo.value = sender;
        void nextTick(() => composer.value?.focus());
      }
      function cancelReply() {
        replyTo.value = "";
        composer.value?.focus();
      }
      const onReply = (sid, key, sender) => {
        if (sid === props.sid && key === activeKey.value) startReply(sender);
      };
      replies.add(onReply);
      onBeforeUnmount(() => {
        replies.delete(onReply);
      });
      const rowTargets = /* @__PURE__ */ new Map();
      function markRow(el, m) {
        if (!(el instanceof HTMLElement) || !props.sid || typeof mu.menus?.target !== "function") return;
        const had = rowTargets.get(m.id);
        if (had?.el === el) return;
        had?.off();
        rowTargets.set(m.id, { el, off: mu.menus.target(el, { kind: "channel-message", sid: props.sid, key: activeKey.value, message: m }) });
      }
      watch(() => msgs.value.map((m) => m.id).join(","), () => {
        const live = new Set(msgs.value.map((m) => m.id));
        for (const [id, r] of rowTargets) if (!live.has(id) || !r.el.isConnected) {
          r.off();
          rowTargets.delete(id);
        }
      }, { flush: "post" });
      onBeforeUnmount(() => {
        for (const r of rowTargets.values()) r.off();
        rowTargets.clear();
      });
      function pick(key) {
        if (!props.sid || solo.value) return;
        const ch = st.value?.channels.find((x) => x.key === key);
        if (key !== activeKey.value) noted = { key, id: ch ? firstUnreadId(st.value?.messages[key] ?? [], ch.unread) : null };
        mu.channels.select(key, props.sid);
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
        const t = replyText(replyTo.value, draft.value);
        draft.value = "";
        replyTo.value = "";
        await mu.channels.send(t, activeKey.value, props.sid);
      }
      watch([() => msgs.value[msgs.value.length - 1]?.id, activeKey, () => active.value?.unread], async () => {
        const a = active.value;
        if (a && a.key !== shownKey) {
          shownKey = a.key;
          dividerAt.value = noted?.key === a.key ? noted.id : firstUnreadId(msgs.value, a.unread);
          noted = null;
          replyTo.value = "";
          stuck.value = true;
          seenId.value = null;
        }
        const r = props.sid ? readAction(st.value, solo.value) : null;
        if (r && props.sid) {
          if (r.op === "markRead") mu.channels.markRead(r.key, props.sid);
          else mu.channels.select(r.key, props.sid);
        }
        await nextTick();
        if (view.value && activeHit.value < 0 && stuck.value) view.value.scrollTop = view.value.scrollHeight;
      }, { immediate: true });
      const chip = (ch) => h("button", {
        key: ch.key,
        type: "button",
        "data-key": ch.key,
        class: cls("cc", ch.key === activeKey.value && "on", ch.muted && "muted", ch.mention && "mention", !!ch.color && "tinted"),
        style: tintStyle(ch.color),
        "data-color": ch.color || void 0,
        "aria-pressed": String(ch.key === activeKey.value),
        "aria-current": ch.key === activeKey.value ? "true" : void 0,
        "aria-label": COPY.chipLabel(ch.caption, ch.unread, ch.mention, ch.online, ch.muted),
        title: ch.caption,
        onClick: () => pick(ch.key),
        onContextmenu: (e) => {
          e.preventDefault();
          cfgFor(ch.key);
        }
      }, [
        h("span", { class: "name" }, ch.caption),
        ch.mention ? h("span", { class: "at", "aria-hidden": "true" }, "@") : null,
        ch.online !== null ? h("span", { class: "online", title: COPY.online(ch.online), "aria-hidden": "true" }, String(ch.online)) : null,
        ch.unread ? h("span", { class: cls("bd", c.count), "aria-hidden": "true" }, String(ch.unread)) : null
      ]);
      const tool = (on, extra, label) => h("button", { type: "button", class: cls(c.cmd, "t", on && "on"), ...extra }, label);
      const cfgStrip = (name) => h("div", { class: "ccfg", "data-testid": "channel-cfg" }, [
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
            "aria-label": COPY.alertsLabel(name),
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
      const row = (m, i) => {
        const g = grouped.value.has(m.id) && !(m.id === dividerAt.value && !searching.value);
        const time = hhmm(m.ts);
        const out = [];
        if (m.id === dividerAt.value && !searching.value) {
          out.push(h("div", { key: `new-${m.id}`, class: "divider", role: "separator", "aria-label": COPY.newDividerLabel, "data-testid": "channel-new" }, [h("span", COPY.newDivider)]));
        }
        out.push(h("div", {
          key: m.id,
          "data-mid": m.id,
          role: "article",
          tabindex: i === focusIdx.value ? "0" : "-1",
          "aria-label": COPY.messageLabel(m.sender, time, m.text),
          class: cls("msg", g && "grouped", m.mention && "mention", hitSet.value.has(m.id) && "hit", m.id === activeHit.value && "active"),
          ref: ((el) => markRow(el, m)),
          onFocus: () => {
            focusIdx.value = i;
          }
        }, [
          g ? null : h("span", { class: "mts" }, time),
          g ? null : h("span", { class: "sender" }, m.sender),
          h("span", { class: "b text" }, m.text),
          m.reactions ? h("span", { class: "reacts" }, Object.entries(m.reactions).map(([r, n]) => h("span", { key: r, class: "react" }, `${r} ${n}`))) : null,
          m.sender ? h("span", { class: "mt" }, [
            h("button", {
              type: "button",
              class: cls(c.cmd, c.sq, "mt-btn"),
              title: COPY.reply,
              "aria-label": COPY.replyLabel(m.sender),
              "data-testid": "channel-reply",
              onClick: (e) => {
                e.stopPropagation();
                startReply(m.sender);
              }
            }, "\u21A9")
          ]) : null
        ]));
        return out;
      };
      const messages = (a) => h("div", { class: "msgs-wrap" }, [
        h("div", {
          ref: view,
          class: "msgs",
          role: "log",
          "data-focus-region": "channels",
          tabindex: "-1",
          "data-testid": "channel-msgs",
          style: tintStyle(a.color),
          "aria-label": COPY.messagesLabel(a.caption),
          onScroll,
          onKeydown: onListKey
        }, msgs.value.length ? msgs.value.flatMap(row) : [h("p", { class: c.empty }, COPY.noMessages)]),
        pending.value > 0 ? h("button", {
          type: "button",
          class: "latest",
          "aria-label": COPY.latestLabel,
          "data-testid": "channel-latest",
          onClick: () => {
            toBottom();
            view.value?.focus();
          }
        }, `\u2193 ${COPY.latest(pending.value)}`) : null
      ]);
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
              a.topic ? h("span", { class: "topic", title: a.topic }, a.topic) : null,
              h("span", { class: "tools" }, [
                tool(showCfg.value, { title: COPY.settingsTitle, "aria-label": COPY.settingsLabel(a.caption), "aria-expanded": String(showCfg.value), "data-testid": "channel-cfg-btn", onClick: () => {
                  showCfg.value = !showCfg.value;
                } }, COPY.settings),
                tool(searching.value, { title: COPY.searchTitle, "aria-label": COPY.searchLabel(a.caption), "aria-expanded": String(searching.value), "data-testid": "channel-search-btn", onClick: toggleSearch }, COPY.search),
                tool(muted.value, { title: COPY.muteTitle, "aria-pressed": String(muted.value), "data-testid": "channel-mute", onClick: () => configure({ muted: !muted.value }) }, muted.value ? COPY.muted : COPY.mute),
                solo.value ? null : tool(false, { title: COPY.popOutTitle(a.caption), "aria-label": COPY.popOutTitle(a.caption), "data-testid": "channel-popout", onClick: popOut }, COPY.popOut)
              ])
            ]),
            showCfg.value ? cfgStrip(a.caption) : null,
            searching.value ? searchStrip() : null,
            messages(a),
            replyTo.value ? h("div", { class: "replybar", "data-testid": "channel-replybar" }, [
              h("span", [`${COPY.replyingTo} `, h("b", replyTo.value)]),
              h("button", { type: "button", class: cls(c.cmd, "rb-cancel"), "aria-label": COPY.cancelReply, onClick: cancelReply }, COPY.cancel)
            ]) : null,
            h("form", { class: "composer", onSubmit: send }, [
              h("span", { class: cls("chev", c.glow), "aria-hidden": "true" }, "\u276F"),
              h("input", {
                ref: composer,
                value: draft.value,
                class: cls("in", c.field),
                autocomplete: "off",
                placeholder: COPY.placeholder(a.caption),
                "aria-label": COPY.placeholder(a.caption),
                "data-testid": "channel-input",
                onInput: (e) => {
                  draft.value = e.target.value;
                },
                onKeydown: (e) => {
                  if (e.key === "Escape" && replyTo.value) {
                    replyTo.value = "";
                    e.preventDefault();
                    e.stopPropagation();
                  }
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
  const offs = [];
  offs.push(mu.ui.style(CHANNELS_CSS));
  const replies = /* @__PURE__ */ new Set();
  const mount = mu.panels.vue(createChannelsPanel(mu, replies));
  offs.push(mu.panels.register({ id: "channels", title: COPY.title, singleton: true, defaultPosition: "right-bottom", order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft }));
  offs.push(mu.panels.register({ id: "channel", title: COPY.title, singleton: false, defaultPosition: "right-bottom", inViewsMenu: false, order: 21, mount }));
  offs.push(mu.sessions.each((s) => {
    let touched = false, last = "";
    return mu.channels.watch((v) => {
      if (v.known && !touched) {
        touched = true;
        mu.panels.touch("channels", s.id);
      }
      const b = badgeOf(v);
      const k = b ? String(b.count) : "";
      if (k !== last) {
        last = k;
        mu.panels.badge("channels", b, s.id);
      }
    }, s.id);
  }));
  const msgOf = (t) => t.kind === "channel-message" ? t : null;
  offs.push(mu.menus.context({
    id: "reply",
    target: "channel-message",
    order: 100,
    title: (t) => COPY.menuReply(msgOf(t)?.message.sender ?? ""),
    when: (t) => !!msgOf(t)?.message.sender,
    run: (t) => {
      const m = msgOf(t);
      if (m) for (const fn of replies) fn(m.sid, m.key, m.message.sender);
    }
  }));
  offs.push(mu.menus.context({
    id: "copy",
    target: "channel-message",
    order: 110,
    title: COPY.menuCopy,
    run: async (t) => {
      const m = msgOf(t);
      if (!m) return;
      const text = m.message.sender ? `${m.message.sender}: ${m.message.text}` : m.message.text;
      await globalThis.navigator?.clipboard?.writeText(text);
    }
  }));
  return () => {
    for (const o of offs.reverse()) o();
  };
}
var index_default = defineExtension({
  activate(ctx) {
    ctx.subscriptions.push(setup(ctx.mu));
  }
});
export {
  CHANNELS_CSS,
  COPY,
  index_default as default,
  setup
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9jb3B5LnRzIiwgInNyYy9zdHlsZS50cyIsICJzcmMvcGFuZWwudHMiLCAic3JjL2xvZ2ljLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENoYW5uZWxzIChAcnVubXUuc2gvZXh0LWNoYW5uZWxzKTogdGhlIENoYW5uZWxzIHBhbmVsIChSLUNIQU4sIFUtQ0hBTi1WSUVXLCBVLUNIQU4tQ0ZHLCBVLUNIQU4tUE9QKSwgbW92ZWQgb3V0XG4gKiBvZiB0aGUgXHUwM0JDQ2xpZW50IGNvcmUgb250byB0aGUgU0RLLiBUaGUgaG9zdCBzdGlsbCB0cmFja3MgZXZlcnkgc2Vzc2lvbidzIGNoYW5uZWxzIChHTUNQIENvbW0uQ2hhbm5lbC5MaXN0IC9cbiAqIFRleHQgLyBQbGF5ZXJzIHRocm91Z2ggaXRzIGJ1bmRsZWQgYWRhcHRlciwgbWVudGlvbnMsIGFsZXJ0cywgdGhlIHBlci13b3JsZCBjaGFubmVsIHNldHRpbmdzIGFuZCByZXBseVxuICogZm9ybWF0KTsgdGhpcyBleHRlbnNpb24gb25seSBkcmF3cyB0aGVtLCB0aHJvdWdoIGBtdS5jaGFubmVscy53YXRjaGAsIGFuZCBhY3RzIG9uIHRoZW0gdGhyb3VnaCBgc2VsZWN0YCxcbiAqIGBtYXJrUmVhZGAsIGBzZW5kYCBhbmQgYGNvbmZpZ3VyZWAuXG4gKlxuICogVHdvIHBhbmVsczogYGNoYW5uZWxzYCAodGhlIHJhaWwgYW5kIHRoZSBzZWxlY3RlZCBjaGFubmVsKSBhbmQgYGNoYW5uZWxgIChvbmUgY2hhbm5lbCBwb3BwZWQgb3V0LFxuICogYHBhcmFtcy5jaGFubmVsYCwgaW5zdGFuY2UgPSBpdHMga2V5KS4gYGNoYW5uZWxzYCBpcyBhbHdheXMgb2ZmZXJlZCAoaXQgaXMgb3BlbmVkIGJlZm9yZVxuICogdGhlIGdhbWUgc2VuZHMgaXRzIGNoYW5uZWxzLCBhbmQgdGhlbiBzYXlzIHNvKTsgaXQgaXMgYXV0by1hZGRlZCBvbmNlIHdoZW4gYSBzZXNzaW9uJ3MgY2hhbm5lbHMgYXJlIGZpcnN0XG4gKiBrbm93biAoYG11LnBhbmVscy50b3VjaGApLCBhbmQgaXRzIGRvY2sgdGFiIGNhcnJpZXMgdGhlIHNlc3Npb24ncyB1bnJlYWQgdG90YWwgKGBtdS5wYW5lbHMuYmFkZ2VgKS5cbiAqL1xuaW1wb3J0IHsgZGVmaW5lRXh0ZW5zaW9uLCB0eXBlIENoYW5uZWxNZXNzYWdlLCB0eXBlIENvbnRleHRUYXJnZXQsIHR5cGUgRGlzcG9zZSwgdHlwZSBNdSB9IGZyb20gJ0BtdWNsaWVudC9zZGsnO1xuaW1wb3J0IHsgQ09QWSB9IGZyb20gJy4vY29weS50cyc7XG5pbXBvcnQgeyBDSEFOTkVMU19DU1MgfSBmcm9tICcuL3N0eWxlLnRzJztcbmltcG9ydCB7IGNyZWF0ZUNoYW5uZWxzUGFuZWwsIHJlc3RvcmVEcmFmdCwgc25hcHNob3REcmFmdCwgdHlwZSBSZXBseUJ1cyB9IGZyb20gJy4vcGFuZWwudHMnO1xuaW1wb3J0IHsgYmFkZ2VPZiB9IGZyb20gJy4vbG9naWMudHMnO1xuXG5leHBvcnQgeyBDT1BZIH0gZnJvbSAnLi9jb3B5LnRzJztcbmV4cG9ydCB7IENIQU5ORUxTX0NTUyB9IGZyb20gJy4vc3R5bGUudHMnO1xuZXhwb3J0IHR5cGUgeyBDb21tQ2hhbm5lbExpc3QsIENvbW1DaGFubmVsVGV4dCwgQ29tbUNoYW5uZWxQbGF5ZXJzIH0gZnJvbSAnLi90eXBlcy50cyc7XG5cbi8qKiBSZWdpc3RlciB0aGUgc3R5bGVzaGVldCwgYm90aCBwYW5lbHMsIHRoZSBwZXItc2Vzc2lvbiBiYWRnZSBhbmQgYXV0by1hZGQsIGFuZCB0aGUgbWVzc2FnZSBtZW51LiBFeHBvcnRlZCBmb3IgdGVzdHMuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAobXU6IE11KTogRGlzcG9zZSB7XG4gIGNvbnN0IG9mZnM6IERpc3Bvc2VbXSA9IFtdO1xuICBvZmZzLnB1c2gobXUudWkuc3R5bGUoQ0hBTk5FTFNfQ1NTKSk7XG4gIC8vIFRoZSBtZXNzYWdlIG1lbnUncyBcIlJlcGx5IHRvIFhcIiByZWFjaGVzIHRoZSBwYW5lbCBzaG93aW5nIHRoYXQgY2hhbm5lbC5cbiAgY29uc3QgcmVwbGllczogUmVwbHlCdXMgPSBuZXcgU2V0KCk7XG4gIGNvbnN0IG1vdW50ID0gbXUucGFuZWxzLnZ1ZShjcmVhdGVDaGFubmVsc1BhbmVsKG11LCByZXBsaWVzKSk7XG4gIG9mZnMucHVzaChtdS5wYW5lbHMucmVnaXN0ZXIoeyBpZDogJ2NoYW5uZWxzJywgdGl0bGU6IENPUFkudGl0bGUsIHNpbmdsZXRvbjogdHJ1ZSwgZGVmYXVsdFBvc2l0aW9uOiAncmlnaHQtYm90dG9tJywgb3JkZXI6IDIwLCBtb3VudCwgc25hcHNob3Q6IHNuYXBzaG90RHJhZnQsIHJlc3RvcmU6IHJlc3RvcmVEcmFmdCB9KSk7XG4gIC8vIFUtQ0hBTi1QT1A6IG9uZSBjaGFubmVsIGFzIGl0cyBvd24gcGFuZWw7IGBwYXJhbXMuY2hhbm5lbGAgbmFtZXMgaXQsIGBjaGFubmVsOjxrZXk+YCBpcyB0aGUgaW5zdGFuY2UgaWQuXG4gIG9mZnMucHVzaChtdS5wYW5lbHMucmVnaXN0ZXIoeyBpZDogJ2NoYW5uZWwnLCB0aXRsZTogQ09QWS50aXRsZSwgc2luZ2xldG9uOiBmYWxzZSwgZGVmYXVsdFBvc2l0aW9uOiAncmlnaHQtYm90dG9tJywgaW5WaWV3c01lbnU6IGZhbHNlLCBvcmRlcjogMjEsIG1vdW50IH0pKTtcblxuICAvLyBQZXIgc2Vzc2lvbjogdGhlIGZpcnN0IGtub3duIGNoYW5uZWwgbGlzdCBvZmZlcnMgKGFuZCBhdXRvLWFkZHMpIHRoZSBwYW5lbDsgdGhlIHVucmVhZCB0b3RhbCBpcyB0aGUgdGFiIGJhZGdlLlxuICBvZmZzLnB1c2gobXUuc2Vzc2lvbnMuZWFjaCgocykgPT4ge1xuICAgIGxldCB0b3VjaGVkID0gZmFsc2UsIGxhc3QgPSAnJztcbiAgICByZXR1cm4gbXUuY2hhbm5lbHMud2F0Y2goKHYpID0+IHtcbiAgICAgIGlmICh2Lmtub3duICYmICF0b3VjaGVkKSB7IHRvdWNoZWQgPSB0cnVlOyBtdS5wYW5lbHMudG91Y2goJ2NoYW5uZWxzJywgcy5pZCk7IH1cbiAgICAgIGNvbnN0IGIgPSBiYWRnZU9mKHYpO1xuICAgICAgY29uc3QgayA9IGIgPyBTdHJpbmcoYi5jb3VudCkgOiAnJztcbiAgICAgIGlmIChrICE9PSBsYXN0KSB7IGxhc3QgPSBrOyBtdS5wYW5lbHMuYmFkZ2UoJ2NoYW5uZWxzJywgYiwgcy5pZCk7IH1cbiAgICB9LCBzLmlkKTtcbiAgfSkpO1xuXG4gIC8vIFJpZ2h0LWNsaWNrIChvciBsb25nLXByZXNzKSBvbiBhIG1lc3NhZ2U6IHJlcGx5IHRvIGl0cyBzZW5kZXIsIGNvcHkgaXQuXG4gIGNvbnN0IG1zZ09mID0gKHQ6IENvbnRleHRUYXJnZXQpOiB7IHNpZDogc3RyaW5nOyBrZXk6IHN0cmluZzsgbWVzc2FnZTogQ2hhbm5lbE1lc3NhZ2UgfSB8IG51bGwgPT4gKHQua2luZCA9PT0gJ2NoYW5uZWwtbWVzc2FnZScgPyB0IDogbnVsbCk7XG4gIG9mZnMucHVzaChtdS5tZW51cy5jb250ZXh0KHtcbiAgICBpZDogJ3JlcGx5JywgdGFyZ2V0OiAnY2hhbm5lbC1tZXNzYWdlJywgb3JkZXI6IDEwMCxcbiAgICB0aXRsZTogKHQpID0+IENPUFkubWVudVJlcGx5KG1zZ09mKHQpPy5tZXNzYWdlLnNlbmRlciA/PyAnJyksXG4gICAgd2hlbjogKHQpID0+ICEhbXNnT2YodCk/Lm1lc3NhZ2Uuc2VuZGVyLFxuICAgIHJ1bjogKHQpID0+IHsgY29uc3QgbSA9IG1zZ09mKHQpOyBpZiAobSkgZm9yIChjb25zdCBmbiBvZiByZXBsaWVzKSBmbihtLnNpZCwgbS5rZXksIG0ubWVzc2FnZS5zZW5kZXIpOyB9LFxuICB9KSk7XG4gIG9mZnMucHVzaChtdS5tZW51cy5jb250ZXh0KHtcbiAgICBpZDogJ2NvcHknLCB0YXJnZXQ6ICdjaGFubmVsLW1lc3NhZ2UnLCBvcmRlcjogMTEwLCB0aXRsZTogQ09QWS5tZW51Q29weSxcbiAgICBydW46IGFzeW5jICh0KSA9PiB7XG4gICAgICBjb25zdCBtID0gbXNnT2YodCk7XG4gICAgICBpZiAoIW0pIHJldHVybjtcbiAgICAgIGNvbnN0IHRleHQgPSBtLm1lc3NhZ2Uuc2VuZGVyID8gYCR7bS5tZXNzYWdlLnNlbmRlcn06ICR7bS5tZXNzYWdlLnRleHR9YCA6IG0ubWVzc2FnZS50ZXh0O1xuICAgICAgYXdhaXQgZ2xvYmFsVGhpcy5uYXZpZ2F0b3I/LmNsaXBib2FyZD8ud3JpdGVUZXh0KHRleHQpO1xuICAgIH0sXG4gIH0pKTtcbiAgcmV0dXJuICgpID0+IHsgZm9yIChjb25zdCBvIG9mIG9mZnMucmV2ZXJzZSgpKSBvKCk7IH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUV4dGVuc2lvbih7XG4gIGFjdGl2YXRlKGN0eCkgeyBjdHguc3Vic2NyaXB0aW9ucy5wdXNoKHNldHVwKGN0eC5tdSkpOyB9LFxufSk7XG4iLCAiLyoqIEV2ZXJ5IHZpc2libGUgc3RyaW5nIG9mIHRoZSBDaGFubmVscyBwYW5lbCwgYXMgXHUwM0JDQ2xpZW50J3Mgd29ybGQtcGFuZWxzL2NvcHkudHMgYGNoYW5uZWxzYCBoYWQgdGhlbS4gU2VudGVuY2UgY2FzZTsgQ1NTIHVwcGVyY2FzZXMuICovXG5leHBvcnQgY29uc3QgQ09QWSA9IHtcbiAgdGl0bGU6ICdDaGFubmVscycsXG4gIGF3YWl0aW5nOiAnV2FpdGluZyBmb3IgY2hhbm5lbHMnLFxuICBub25lOiAnTm8gY2hhbm5lbHMnLFxuICBub01lc3NhZ2VzOiAnTm8gbWVzc2FnZXMgeWV0JyxcbiAgbm9DaGFubmVsOiAnTm8gY2hhbm5lbC4nLFxuICBwbGFjZWhvbGRlcjogKGNoOiBzdHJpbmcpID0+IGBtZXNzYWdlICR7Y2h9YCxcbiAgc2V0dGluZ3M6ICdTZXR0aW5ncycsXG4gIHNldHRpbmdzVGl0bGU6ICdjaGFubmVsIHNldHRpbmdzJyxcbiAgLyoqIFRoZSBNdXRlIHRvb2wgd2hpbGUgdGhlIGNoYW5uZWwgaXMgbXV0ZWQgKGEgcHJlc3NlZCB0b2dnbGUsIGFzIFVuZGVyc3BpcmUncykuICovXG4gIG11dGVkOiAnTXV0ZWQnLFxuICBtdXRlOiAnTXV0ZScsXG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSAxLjEuMCB0aGUgcHJlc3NlZCB0b29sIHJlYWRzIHtAbGluayBDT1BZLm11dGVkfTsga2VwdCBmb3IgY2FsbGVycyBvZiB0aGUgMS4wIGV4cG9ydC4gKi9cbiAgdW5tdXRlOiAnVW5tdXRlJyxcbiAgbXV0ZVRpdGxlOiAnbXV0ZSBjaGFubmVsJyxcbiAgYWxlcnRzOiAnQWxlcnRzJyxcbiAgYWxlcnRBbGw6ICdFdmVyeSBtZXNzYWdlJyxcbiAgYWxlcnRNZW50aW9uczogJ01lbnRpb25zIG9ubHknLFxuICBhbGVydE5vbmU6ICdOb25lJyxcbiAgb25saW5lOiAobjogbnVtYmVyKSA9PiBgJHtufSBvbmxpbmVgLFxuICB1bnJlYWQ6IChuOiBudW1iZXIpID0+IGAke259IHVucmVhZGAsXG4gIHJhaWw6ICdDaGFubmVscycsXG4gIGNvbG9yOiAnQ29sb3VyJyxcbiAgY29sb3JEZWZhdWx0OiAnZGVmYXVsdCcsXG4gIGNvbG9yczogeyBhY2NlbnQ6ICdhY2NlbnQnLCAnYWNjZW50LWJyaWdodCc6ICdicmlnaHQgYWNjZW50JywgZ29sZDogJ2dvbGQnLCBhbGVydDogJ2FsZXJ0Jywgb2s6ICdvaycsIGZnOiAndGV4dCcsICdmZy1kaW0nOiAnZGltIHRleHQnIH0gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPixcbiAgc2VhcmNoOiAnU2VhcmNoJyxcbiAgc2VhcmNoVGl0bGU6ICdzZWFyY2ggdGhpcyBjaGFubmVsJyxcbiAgc2VhcmNoUGxhY2Vob2xkZXI6ICdzZWFyY2ggY2hhbm5lbCcsXG4gIG5vTWF0Y2g6ICdubyBtYXRjaCcsXG4gIGJhZFJlZ2V4OiAnbm90IGEgdmFsaWQgcmVnZXgnLFxuICBwcmV2OiAncHJldmlvdXMnLCBuZXh0OiAnbmV4dCcsIGNsb3NlOiAnY2xvc2UnLFxuICBwcmV2TGFiZWw6ICdQcmV2JywgbmV4dExhYmVsOiAnTmV4dCcsIGNsb3NlTGFiZWw6ICdDbG9zZScsXG4gIHBvcE91dDogJ1BvcCBvdXQnLFxuICBwb3BPdXRUaXRsZTogKGNoOiBzdHJpbmcpID0+IGBwb3Agb3V0ICR7Y2h9YCxcbiAgc29sb1RpdGxlOiAoY2g6IHN0cmluZykgPT4gYENoYW5uZWwgXHUwMEI3ICR7Y2h9YCxcbiAgZ29uZTogKGNoOiBzdHJpbmcpID0+IGBjaGFubmVsICR7Y2h9IGlzIG5vdCBvcGVuIGhlcmVgLFxuICAvLyBcdTI1MDBcdTI1MDAgMS4xLjAgXHUyNTAwXHUyNTAwXG4gIC8qKiBBIGNoaXAncyBhY2Nlc3NpYmxlIG5hbWU6IFwidm94LCAzIHVucmVhZCwgbWVudGlvbmVkLCA0IG9ubGluZSwgbXV0ZWRcIi4gKi9cbiAgY2hpcExhYmVsOiAobmFtZTogc3RyaW5nLCB1bnJlYWQ6IG51bWJlciwgbWVudGlvbjogYm9vbGVhbiwgb25saW5lOiBudW1iZXIgfCBudWxsLCBtdXRlZDogYm9vbGVhbikgPT5cbiAgICBbbmFtZSwgdW5yZWFkID8gYCR7dW5yZWFkfSB1bnJlYWRgIDogJycsIG1lbnRpb24gPyAnbWVudGlvbmVkJyA6ICcnLCBvbmxpbmUgIT09IG51bGwgPyBgJHtvbmxpbmV9IG9ubGluZWAgOiAnJywgbXV0ZWQgPyAnbXV0ZWQnIDogJyddLmZpbHRlcihCb29sZWFuKS5qb2luKCcsICcpLFxuICBzZXR0aW5nc0xhYmVsOiAoY2g6IHN0cmluZykgPT4gYCR7Y2h9IGNoYW5uZWwgc2V0dGluZ3NgLFxuICBzZWFyY2hMYWJlbDogKGNoOiBzdHJpbmcpID0+IGBzZWFyY2ggJHtjaH1gLFxuICBhbGVydHNMYWJlbDogKGNoOiBzdHJpbmcpID0+IGAke2NofSBhbGVydHNgLFxuICBtZXNzYWdlc0xhYmVsOiAoY2g6IHN0cmluZykgPT4gYCR7Y2h9IG1lc3NhZ2VzYCxcbiAgLyoqIEEgbWVzc2FnZSdzIGFjY2Vzc2libGUgbmFtZTogXCJPcnJpbiwgMDQ6MTI6IHRoZSBiZWxsc1wiLiAqL1xuICBtZXNzYWdlTGFiZWw6IChzZW5kZXI6IHN0cmluZywgdGltZTogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IChzZW5kZXIgPyBgJHtzZW5kZXJ9LCAke3RpbWV9OiAke3RleHR9YCA6IGAke3RpbWV9OiAke3RleHR9YCksXG4gIG5ld0RpdmlkZXI6ICduZXcnLFxuICBuZXdEaXZpZGVyTGFiZWw6ICduZXcgbWVzc2FnZXMnLFxuICAvKiogVGhlIGp1bXAtdG8tbGF0ZXN0IGJ1dHRvbiB3aGlsZSBzY3JvbGxlZCB1cC4gKi9cbiAgbGF0ZXN0OiAobjogbnVtYmVyKSA9PiBgJHtufSBuZXcgbWVzc2FnZSR7biA9PT0gMSA/ICcnIDogJ3MnfWAsXG4gIGxhdGVzdExhYmVsOiAnanVtcCB0byB0aGUgbGF0ZXN0IG1lc3NhZ2UnLFxuICByZXBseTogJ1JlcGx5JyxcbiAgcmVwbHlMYWJlbDogKHNlbmRlcjogc3RyaW5nKSA9PiBgcmVwbHkgdG8gJHtzZW5kZXJ9YCxcbiAgcmVwbHlpbmdUbzogJ1JlcGx5IHRvJyxcbiAgY2FuY2VsOiAnQ2FuY2VsJyxcbiAgY2FuY2VsUmVwbHk6ICdjYW5jZWwgdGhlIHJlcGx5JyxcbiAgbWVudVJlcGx5OiAoc2VuZGVyOiBzdHJpbmcpID0+IGBSZXBseSB0byAke3NlbmRlcn1gLFxuICBtZW51Q29weTogJ0NvcHkgbWVzc2FnZScsXG59O1xuIiwgIi8qKlxuICogVGhlIHNjb3BlZCBzdHlsZSBibG9jayBvZiBcdTAzQkNDbGllbnQncyBDaGFubmVsc1BhbmVsLnZ1ZS4gRXZlcnkgcnVsZSBpcyB1bmRlciB0aGUgaG9zdCdzIHBhbmVsIGJveCBmb3IgdGhpc1xuICogZXh0ZW5zaW9uLCBgLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdYCwgdGhlbiBgLm11LWNoYW5uZWxzYCAodGhlIHBhbmVsIHJvb3QsIHdoaWNoIGFsc28gY2FycmllcyB0aGUgb2xkIGAuY2hhbmApLiBUb2tlbnMgb25seSAoUi1BUkNILTcpLiBTaXplcyBzY2FsZSB3aXRoIHRoZSBkb2NrJ3MgcGVyLXBhbmVsXG4gKiAtLXNoZWxsLWZvbnQtc2l6ZSAoUi1QQU5FTC1QUkVGUyk6IC0tdSBpcyAxcmVtIGF0IHRoZSBkZWZhdWx0LiBIb3N0IGdsb2JhbHMgdGhlIG9yaWdpbmFsIHVzZWQgKHNoLWNtZCwgc2gtZmllbGQsXG4gKiBzaC1jb3VudCwgZ2xvdy10ZXh0LCBlbXB0eSkgY29tZSBmcm9tIG11LnVpLmNzcyBhbmQga2VlcCB0aGVpciBob3N0IHN0eWxpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBDSEFOTkVMU19DU1MgPSBgXG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIHsgLS11OiB2YXIoLS1zaGVsbC1mb250LXNpemUsIDE1cHgpOyBoZWlnaHQ6IDEwMCU7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IGJhY2tncm91bmQ6IHZhcigtLWJnLWVsZXYpOyBtaW4taGVpZ2h0OiAwOyBmb250LXNpemU6IHZhcigtLXUpOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5hd2FpdGluZywgLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAucmFpbC1lbXB0eSwgLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNncyAuZW1wdHkgeyBjb2xvcjogdmFyKC0tZmctZmFpbnQpOyBmb250LXN0eWxlOiBub3JtYWw7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC42NCk7IGxldHRlci1zcGFjaW5nOiAuMTRlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuYXdhaXRpbmcgeyBwYWRkaW5nOiAxMHB4OyBtYXJnaW46IDA7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLnJhaWwgeyBkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMnB4OyBwYWRkaW5nOiA0cHggNnB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYWNjZW50KTsgZmxleDogbm9uZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY2MgeyBkaXNwbGF5OiBpbmxpbmUtZmxleDsgZ2FwOiAuNmNoOyBhbGlnbi1pdGVtczogY2VudGVyOyBib3JkZXI6IDA7IGJhY2tncm91bmQ6IG5vbmU7IHBhZGRpbmc6IDJweCAuOGNoOyBtaW4taGVpZ2h0OiAyNHB4OyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNjYpOyBsZXR0ZXItc3BhY2luZzogLjE0ZW07IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGNvbG9yOiB2YXIoLS1mZy1kaW0pOyB0cmFuc2l0aW9uOiBjb2xvciAuMTJzIGVhc2UsIGJhY2tncm91bmQtY29sb3IgLjEycyBlYXNlOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jYzpob3ZlciB7IGNvbG9yOiB2YXIoLS1mZyk7IGJhY2tncm91bmQ6IHZhcigtLXRpbnQtdG9nZ2xlKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY2Mub24geyBjb2xvcjogdmFyKC0tYmctZGVlcCk7IGJhY2tncm91bmQ6IHZhcigtLWFjY2VudCk7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNjLnRpbnRlZDpub3QoLm9uKSAubmFtZSB7IGNvbG9yOiB2YXIoLS1jaGFuKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY2MubWVudGlvbjpub3QoLm9uKSAubmFtZSB7IGNvbG9yOiB2YXIoLS1nb2xkKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY2MubXV0ZWQgLm5hbWUgeyBvcGFjaXR5OiAuNTsgdGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmF0IHsgY29sb3I6IHZhcigtLWdvbGQpOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5vbmxpbmUgeyBjb2xvcjogdmFyKC0tb2spOyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNik7IGxldHRlci1zcGFjaW5nOiAwOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jYy5vbiAuYXQsIC5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNjLm9uIC5vbmxpbmUgeyBjb2xvcjogaW5oZXJpdDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuYmQgeyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNik7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmN2IHsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgbWluLWhlaWdodDogMDsgZmxleDogMTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuaGVhZCB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBiYXNlbGluZTsgZ2FwOiAxY2g7IHBhZGRpbmc6IDVweCAxMHB4OyBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyKTsgZmxleDogbm9uZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAudGl0bGUgeyBjb2xvcjogdmFyKC0tYWNjZW50LWJyaWdodCk7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGxldHRlci1zcGFjaW5nOiAuMTZlbTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjc4KTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAudG9waWMgeyBjb2xvcjogdmFyKC0tZmctZGltKTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjcyKTsgZm9udC1zdHlsZTogaXRhbGljOyBvdmVyZmxvdzogaGlkZGVuOyB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAudG9vbHMgeyBtYXJnaW4tbGVmdDogYXV0bzsgZGlzcGxheTogZmxleDsgZ2FwOiAycHg7IGZsZXgtd3JhcDogd3JhcDsganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAudCB7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC42OCk7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNjZmcgeyBkaXNwbGF5OiBmbGV4OyBmbGV4LXdyYXA6IHdyYXA7IGdhcDogMTJweDsgcGFkZGluZzogNnB4IDEwcHg7IGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1hY2NlbnQpOyBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1kZWVwKTsgZmxleDogbm9uZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY2ZnLXJvdyB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4OyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNzIpOyBjb2xvcjogdmFyKC0tZmctZGltKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc2VsIHsgY29sb3I6IHZhcigtLWZnKTsgYmFja2dyb3VuZDogdmFyKC0tYmctZGVlcCk7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC43Mik7IG1pbi1oZWlnaHQ6IDI0cHg7IHBhZGRpbmc6IDJweDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc3dhdGNoZXMgeyBkaXNwbGF5OiBpbmxpbmUtZmxleDsgZ2FwOiA0cHg7IGZsZXgtd3JhcDogd3JhcDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc3cgeyB3aWR0aDogMjRweDsgaGVpZ2h0OiAyNHB4OyBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItYnJpZ2h0KTsgYmFja2dyb3VuZDogdmFyKC0tYmcpOyBkaXNwbGF5OiBpbmxpbmUtZ3JpZDsgcGxhY2UtaXRlbXM6IGNlbnRlcjsgY29sb3I6IHZhcigtLWZnLWZhaW50KTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjcyKTsgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIC4xMnMgZWFzZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc3c6bm90KC5ub25lKTo6YmVmb3JlIHsgY29udGVudDogJyc7IHdpZHRoOiAxNHB4OyBoZWlnaHQ6IDE0cHg7IGJhY2tncm91bmQ6IHZhcigtLXN3KTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc3c6aG92ZXIgeyBib3JkZXItY29sb3I6IHZhcigtLWFjY2VudCk7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLnN3Lm9uIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1hY2NlbnQtYnJpZ2h0KTsgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMXB4IHZhcigtLWFjY2VudC1icmlnaHQpOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jc2VhcmNoIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAuNWNoOyBwYWRkaW5nOiAzcHggMTBweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWFjY2VudCk7IGJhY2tncm91bmQ6IHZhcigtLWJnLWRlZXApOyBmbGV4OiBub25lOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5zLWdseXBoIHsgY29sb3I6IHZhcigtLWFjY2VudCk7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNzZWFyY2ggaW5wdXQgeyBmbGV4OiAxOyBtaW4td2lkdGg6IDA7IGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IDA7IGNvbG9yOiB2YXIoLS1mZyk7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC44Mik7IHBhZGRpbmc6IDJweCAwOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jc2VhcmNoIGlucHV0OjpwbGFjZWhvbGRlciB7IGNvbG9yOiB2YXIoLS1mZy1mYWludCk7IGZvbnQtc3R5bGU6IG5vcm1hbDsgbGV0dGVyLXNwYWNpbmc6IC4xNGVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNjYpOyBvcGFjaXR5OiAxOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jbnQgeyBjb2xvcjogdmFyKC0tZmctZGltKTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjcyKTsgbWluLXdpZHRoOiAzLjVlbTsgdGV4dC1hbGlnbjogcmlnaHQ7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNudC5lcnIgeyBjb2xvcjogdmFyKC0tYWxlcnQpOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5zLWJ0biB7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC42OCk7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm1zZ3MgeyBmbGV4OiAxOyBtaW4taGVpZ2h0OiAwOyBvdmVyZmxvdy15OiBhdXRvOyBwYWRkaW5nOiA2cHggMTBweDsgbGluZS1oZWlnaHQ6IDEuNTsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNncyA+IDpmaXJzdC1jaGlsZCB7IG1hcmdpbi10b3A6IGF1dG87IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm1zZ3MgLmVtcHR5IHsgbWFyZ2luOiAwOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5tc2cgeyBwYWRkaW5nOiAxcHggMDsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjg1KTsgb3ZlcmZsb3ctd3JhcDogYW55d2hlcmU7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm10cyB7IGNvbG9yOiB2YXIoLS1mZy1mYWludCk7IGZvbnQtc2l6ZTogLjcyZW07IG1hcmdpbi1yaWdodDogLjZjaDsgdXNlci1zZWxlY3Q6IG5vbmU7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLnNlbmRlciB7IGNvbG9yOiB2YXIoLS1jaGFuLCB2YXIoLS1nb2xkKSk7IG1hcmdpbi1yaWdodDogLjZjaDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAudGV4dCB7IGNvbG9yOiB2YXIoLS1mZyk7IHdoaXRlLXNwYWNlOiBwcmUtd3JhcDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNnLm1lbnRpb24geyBib3JkZXItbGVmdDogMnB4IHNvbGlkIHZhcigtLWdvbGQpOyBwYWRkaW5nLWxlZnQ6IDdweDsgbWFyZ2luLWxlZnQ6IC05cHg7IGJveC1zaGFkb3c6IC00cHggMCA4cHggLTZweCB2YXIoLS1nb2xkKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNnLmhpdCB7IGJhY2tncm91bmQ6IHZhcigtLXRpbnQtaGl0KTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNnLmhpdC5hY3RpdmUgeyBiYWNrZ3JvdW5kOiB2YXIoLS10aW50LWhpdC1hY3RpdmUpOyBvdXRsaW5lOiAxcHggc29saWQgdmFyKC0tYWNjZW50KTsgb3V0bGluZS1vZmZzZXQ6IC0xcHg7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLnJlYWN0cyB7IG1hcmdpbi1sZWZ0OiAuNWNoOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5yZWFjdCB7IGJvcmRlcjogMDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1icmlnaHQpOyBiYWNrZ3JvdW5kOiBub25lOyBjb2xvcjogdmFyKC0tZmctZGltKTsgZm9udC1zaXplOiAuNzJlbTsgcGFkZGluZzogMCA0cHg7IG1hcmdpbi1sZWZ0OiAzcHg7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmNvbXBvc2VyIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAuNnJlbTsgcGFkZGluZzogNnB4IDEwcHg7IGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS1hY2NlbnQpOyBmbGV4OiBub25lOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jaGV2IHsgY29sb3I6IHZhcigtLWFjY2VudC1icmlnaHQpOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5pbiB7IGZsZXg6IDE7IG1pbi13aWR0aDogMDsgbWluLWhlaWdodDogMjRweDsgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7IG91dGxpbmU6IG5vbmU7IGNvbG9yOiB2YXIoLS1mZyk7IGNhcmV0LWNvbG9yOiB2YXIoLS1hY2NlbnQtYnJpZ2h0KTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjg1KTsgcGFkZGluZzogMnB4OyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5pbjo6cGxhY2Vob2xkZXIgeyBjb2xvcjogdmFyKC0tZmctZmFpbnQpOyBmb250LXN0eWxlOiBub3JtYWw7IGxldHRlci1zcGFjaW5nOiAuMTRlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjY2KTsgb3BhY2l0eTogMTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuY29tcG9zZXI6Zm9jdXMtd2l0aGluIHsgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMnB4IHZhcigtLWFjY2VudC1icmlnaHQpOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5tc2dzLXdyYXAgeyBwb3NpdGlvbjogcmVsYXRpdmU7IGZsZXg6IDE7IG1pbi1oZWlnaHQ6IDA7IGRpc3BsYXk6IGZsZXg7IGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm1zZyB7IHBvc2l0aW9uOiByZWxhdGl2ZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXNnLmdyb3VwZWQgeyBwYWRkaW5nLWxlZnQ6IDIuNGNoOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5tc2c6Zm9jdXMtdmlzaWJsZSB7IG91dGxpbmU6IDFweCBzb2xpZCB2YXIoLS1hY2NlbnQtYnJpZ2h0KTsgb3V0bGluZS1vZmZzZXQ6IC0xcHg7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm10IHsgcG9zaXRpb246IGFic29sdXRlOyByaWdodDogMDsgdG9wOiAwOyBvcGFjaXR5OiAwOyB0cmFuc2l0aW9uOiBvcGFjaXR5IC4xMnMgZWFzZTsgYmFja2dyb3VuZDogdmFyKC0tYmctZWxldik7IH1cbi5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm1zZzpob3ZlciAubXQsIC5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm1zZzpmb2N1cy13aXRoaW4gLm10LCAuZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5tc2c6Zm9jdXMgLm10IHsgb3BhY2l0eTogMTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubXQtYnRuIHsgZm9udC1zaXplOiAuNzhlbTsgbWluLWhlaWdodDogMjBweDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuZGl2aWRlciB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMWNoOyBtYXJnaW46IDRweCAwOyBjb2xvcjogdmFyKC0tYWNjZW50LWJyaWdodCk7IGZvbnQtc2l6ZTogY2FsYyh2YXIoLS11KSAqIC42KTsgbGV0dGVyLXNwYWNpbmc6IC4xNGVtOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyB9XG4uZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5kaXZpZGVyOjpiZWZvcmUsIC5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLmRpdmlkZXI6OmFmdGVyIHsgY29udGVudDogJyc7IGZsZXg6IDE7IGJvcmRlci10b3A6IDFweCBzb2xpZCBjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tYWNjZW50KSA1MCUsIHRyYW5zcGFyZW50KTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubGF0ZXN0IHsgcG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiA1MCU7IGJvdHRvbTogNnB4OyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7IGJhY2tncm91bmQ6IHZhcigtLWJnLWRlZXApOyBjb2xvcjogdmFyKC0tYWNjZW50LWJyaWdodCk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWFjY2VudCk7IHBhZGRpbmc6IDJweCAxMHB4OyBmb250LXNpemU6IGNhbGModmFyKC0tdSkgKiAuNyk7IGxldHRlci1zcGFjaW5nOiAuMTRlbTsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgbWluLWhlaWdodDogMjRweDsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAubGF0ZXN0OmhvdmVyLCAuZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5sYXRlc3Q6Zm9jdXMtdmlzaWJsZSB7IGJhY2tncm91bmQ6IHZhcigtLWFjY2VudCk7IGNvbG9yOiB2YXIoLS1iZy1kZWVwKTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAucmVwbHliYXIgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47IGdhcDogMWNoOyBwYWRkaW5nOiAzcHggMTBweDsgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLWJvcmRlcik7IGNvbG9yOiB2YXIoLS1nb2xkKTsgZm9udC1zaXplOiBjYWxjKHZhcigtLXUpICogLjcyKTsgZmxleDogbm9uZTsgfVxuLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAucmVwbHliYXIgYiB7IGNvbG9yOiB2YXIoLS1mZyk7IGZvbnQtd2VpZ2h0OiBub3JtYWw7IH1cbkBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjogcmVkdWNlKSB7IC5leHQtcGFuZWxbZGF0YS1leHQ9XCJjaGFubmVsc1wiXSAubXUtY2hhbm5lbHMgLm10LCAuZXh0LXBhbmVsW2RhdGEtZXh0PVwiY2hhbm5lbHNcIl0gLm11LWNoYW5uZWxzIC5jYywgLmV4dC1wYW5lbFtkYXRhLWV4dD1cImNoYW5uZWxzXCJdIC5tdS1jaGFubmVscyAuc3cgeyB0cmFuc2l0aW9uOiBub25lOyB9IH1cbmA7XG4iLCAiLyoqXG4gKiBUaGUgQ2hhbm5lbHMgcGFuZWwgYXMgYSBWdWUgY29tcG9uZW50IChyZW5kZXIgZnVuY3Rpb25zLCBubyBTRkMgY29tcGlsZXI7IGB2dWVgIGlzIHRoZSBob3N0J3Mgb3duIHRocm91Z2hcbiAqIHRoZSBpbXBvcnQgbWFwKSwgcG9ydGVkIGZyb20gXHUwM0JDQ2xpZW50J3MgZmVhdHVyZXMvd29ybGQtcGFuZWxzL0NoYW5uZWxzUGFuZWwudnVlIG9udG8gdGhlIFNESy5cbiAqXG4gKiBDb21wb3NlZCBhcyBVbmRlcnNwaXJlJ3MgY2hhdDogdGhlIHJhaWwgb2YgY2hhbm5lbCBjaGlwcyAoYWNjZW50IGJvdHRvbSBydWxlKSwgdGhlbiB0aGUgdmlldzogaGVhZCAodGl0bGUsXG4gKiBpdGFsaWMgdG9waWMsIHRvb2xzIFNldHRpbmdzIFx1MDBCNyBTZWFyY2ggXHUwMEI3IE11dGUgXHUwMEI3IFBvcCBvdXQpLCB0aGUgY29uZmlnIHN0cmlwIChjb2xvdXIsIGFsZXJ0cyksIHRoZSBzZWFyY2ggc3RyaXAsXG4gKiBzaW5nbGUtbGluZSBtZXNzYWdlcyAodGltZSwgc2VuZGVyLCB0ZXh0LCByZWFjdGlvbnMpIGFuZCB0aGUgXHUyNzZGIGNvbXBvc2VyIG92ZXIgYW4gYWNjZW50IHJ1bGUuIFdpdGhcbiAqIGBwYXJhbXMuY2hhbm5lbGAgaXQgaXMgYSBwb3BwZWQtb3V0IHZpZXcgb2YgdGhhdCBvbmUgY2hhbm5lbDogbm8gc3dpdGNoaW5nLCBpdHMgb3duIGNvbXBvc2VyLCBpdCBtYXJrcyBpdHNcbiAqIGNoYW5uZWwgcmVhZCwgYW5kIGl0IHN1cnZpdmVzIGEgbGF5b3V0IHJlbG9hZC5cbiAqL1xuaW1wb3J0IHsgY29tcHV0ZWQsIGRlZmluZUNvbXBvbmVudCwgaCwgbmV4dFRpY2ssIG9uQmVmb3JlVW5tb3VudCwgcmVmLCBzaGFsbG93UmVmLCB3YXRjaCwgdHlwZSBQcm9wVHlwZSwgdHlwZSBWTm9kZSB9IGZyb20gJ3Z1ZSc7XG5pbXBvcnQgeyBDSEFOTkVMX0NPTE9SUywgdHlwZSBDaGFubmVsQ29sb3IsIHR5cGUgQ2hhbm5lbE1lc3NhZ2UsIHR5cGUgQ2hhbm5lbFZpZXcsIHR5cGUgQ2hhbm5lbHNWaWV3LCB0eXBlIERpc3Bvc2UsIHR5cGUgTXUgfSBmcm9tICdAbXVjbGllbnQvc2RrJztcbmltcG9ydCB7IENPUFkgfSBmcm9tICcuL2NvcHkudHMnO1xuaW1wb3J0IHtcbiAgYWN0aXZlSGl0SWQsIGFjdGl2ZUtleU9mLCBhY3RpdmVPZiwgYXRCb3R0b20sIGJvZHlPZiwgY2xhbXBIaXQsIGNvdW50VGV4dCwgZmlyc3RVbnJlYWRJZCwgZ3JvdXBlZElkcywgaGhtbSwgaXNGaW5kS2V5LCBtZXNzYWdlc09mLFxuICBtb3ZlSW5kZXgsIG5ld2VyVGhhbiwgcG9wT3V0QXJncywgcmFpbE9mLCByZWFkQWN0aW9uLCByZXBseVRleHQsIHNlYXJjaEtleSwgc2VhcmNoTWVzc2FnZXMsIHNvbG9PZiwgc3RlcEluZGV4LCBzd2F0Y2hTdHlsZSwgdGludFN0eWxlLFxufSBmcm9tICcuL2xvZ2ljLnRzJztcblxuLyoqIFwiUmVwbHkgdG8gWFwiIGZyb20gdGhlIG1lc3NhZ2UgbWVudSAoaW5kZXgudHMpIHJlYWNoZXMgZXZlcnkgbW91bnRlZCB2aWV3OiAoc2lkLCBjaGFubmVsIGtleSwgc2VuZGVyKS4gKi9cbmV4cG9ydCB0eXBlIFJlcGx5QnVzID0gU2V0PChzaWQ6IHN0cmluZywga2V5OiBzdHJpbmcsIHNlbmRlcjogc3RyaW5nKSA9PiB2b2lkPjtcblxudHlwZSBBbGVydCA9ICdhbGwnIHwgJ21lbnRpb25zJyB8ICdub25lJztcbmNvbnN0IGNscyA9ICguLi54czogQXJyYXk8c3RyaW5nIHwgZmFsc2UgfCBudWxsIHwgdW5kZWZpbmVkPikgPT4geHMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKTtcblxuY29uc3QgSU5QVVQgPSAnW2RhdGEtdGVzdGlkPVwiY2hhbm5lbC1pbnB1dFwiXSc7XG5cbi8qKiBIb3QgcmVsb2FkOiB0aGUgY29tcG9zZXIncyB1bnNlbnQgdGV4dCwgb3IgdW5kZWZpbmVkIHdoZW4gdGhlcmUgaXMgbm9uZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbmFwc2hvdERyYWZ0KGVsOiBIVE1MRWxlbWVudCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHYgPSBlbC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KElOUFVUKT8udmFsdWU7XG4gIHJldHVybiB2ID8gdiA6IHVuZGVmaW5lZDtcbn1cblxuLyoqIEhvdCByZWxvYWQ6IHB1dCB0aGUgdW5zZW50IHRleHQgYmFjayBpbnRvIHRoZSBuZXcgYnVpbGQncyBjb21wb3NlciAoYW4gaW5wdXQgZXZlbnQsIHNvIHRoZSBkcmFmdCBmb2xsb3dzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlRHJhZnQoZWw6IEhUTUxFbGVtZW50LCBzdGF0ZTogdW5rbm93bik6IHZvaWQge1xuICBjb25zdCBpbnB1dCA9IGVsLnF1ZXJ5U2VsZWN0b3I8SFRNTElucHV0RWxlbWVudD4oSU5QVVQpO1xuICBpZiAodHlwZW9mIHN0YXRlICE9PSAnc3RyaW5nJyB8fCAhc3RhdGUgfHwgIWlucHV0KSByZXR1cm47XG4gIGlucHV0LnZhbHVlID0gc3RhdGU7XG4gIGlucHV0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGFubmVsc1BhbmVsKG11OiBNdSwgcmVwbGllczogUmVwbHlCdXMgPSBuZXcgU2V0KCkpIHtcbiAgY29uc3QgYyA9IG11LnVpLmNzcztcbiAgcmV0dXJuIGRlZmluZUNvbXBvbmVudCh7XG4gICAgbmFtZTogJ0NoYW5uZWxzUGFuZWwnLFxuICAgIHByb3BzOiB7XG4gICAgICBzaWQ6IHsgdHlwZTogU3RyaW5nIGFzIFByb3BUeXBlPHN0cmluZyB8IG51bGw+LCBkZWZhdWx0OiBudWxsIH0sXG4gICAgICB3b3JsZElkOiB7IHR5cGU6IFN0cmluZyBhcyBQcm9wVHlwZTxzdHJpbmcgfCBudWxsPiwgZGVmYXVsdDogbnVsbCB9LFxuICAgICAgcGFyYW1zOiB7IHR5cGU6IE9iamVjdCBhcyBQcm9wVHlwZTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sIGRlZmF1bHQ6ICgpID0+ICh7fSkgfSxcbiAgICB9LFxuICAgIHNldHVwKHByb3BzKSB7XG4gICAgICBjb25zdCBzb2xvID0gY29tcHV0ZWQoKCkgPT4gc29sb09mKHByb3BzLnBhcmFtcykpO1xuICAgICAgY29uc3Qgc3QgPSBzaGFsbG93UmVmPENoYW5uZWxzVmlldyB8IG51bGw+KG51bGwpO1xuICAgICAgLy8gRm9sbG93IHRoZSBwYW5lbCdzIHNlc3Npb246IGEgbmV3IHNpZCBkcm9wcyB0aGUgb2xkIHN1YnNjcmlwdGlvbiBhbmQgd2F0Y2hlcyB0aGUgbmV3IG9uZSAod2F0Y2ggY2FsbHNcbiAgICAgIC8vIGJhY2sgd2l0aCB0aGUgY3VycmVudCB2aWV3IGF0IG9uY2UsIHNvIG5vIHNlcGFyYXRlIGdldCkuXG4gICAgICB3YXRjaCgoKSA9PiBwcm9wcy5zaWQsIChzaWQsIF9vbGQsIG9uQ2xlYW51cCkgPT4ge1xuICAgICAgICBzdC52YWx1ZSA9IG51bGw7XG4gICAgICAgIGlmICghc2lkKSByZXR1cm47XG4gICAgICAgIG9uQ2xlYW51cChtdS5jaGFubmVscy53YXRjaCgodikgPT4geyBzdC52YWx1ZSA9IHY7IH0sIHNpZCkpO1xuICAgICAgfSwgeyBpbW1lZGlhdGU6IHRydWUgfSk7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZUtleSA9IGNvbXB1dGVkKCgpID0+IGFjdGl2ZUtleU9mKHN0LnZhbHVlLCBzb2xvLnZhbHVlKSk7XG4gICAgICBjb25zdCBhY3RpdmUgPSBjb21wdXRlZCgoKSA9PiBhY3RpdmVPZihzdC52YWx1ZSwgc29sby52YWx1ZSkpO1xuICAgICAgY29uc3QgcmFpbCA9IGNvbXB1dGVkKCgpID0+IHJhaWxPZihzdC52YWx1ZSwgc29sby52YWx1ZSkpO1xuICAgICAgY29uc3QgbXNncyA9IGNvbXB1dGVkKCgpID0+IG1lc3NhZ2VzT2Yoc3QudmFsdWUsIHNvbG8udmFsdWUpKTtcbiAgICAgIGNvbnN0IGdyb3VwZWQgPSBjb21wdXRlZCgoKSA9PiBncm91cGVkSWRzKG1zZ3MudmFsdWUpKTtcbiAgICAgIGNvbnN0IHNob3dDZmcgPSByZWYoZmFsc2UpO1xuICAgICAgY29uc3QgZHJhZnQgPSByZWYoJycpO1xuICAgICAgY29uc3QgdmlldyA9IHJlZjxIVE1MRWxlbWVudCB8IG51bGw+KG51bGwpO1xuICAgICAgY29uc3QgY29tcG9zZXIgPSByZWY8SFRNTElucHV0RWxlbWVudCB8IG51bGw+KG51bGwpO1xuXG4gICAgICBjb25zdCBtdXRlZCA9IGNvbXB1dGVkKCgpID0+ICEhYWN0aXZlLnZhbHVlPy5tdXRlZCk7XG4gICAgICBjb25zdCBhbGVydCA9IGNvbXB1dGVkPEFsZXJ0PigoKSA9PiBhY3RpdmUudmFsdWU/LmFsZXJ0ID8/ICdtZW50aW9ucycpO1xuICAgICAgY29uc3QgY29sb3IgPSBjb21wdXRlZDxDaGFubmVsQ29sb3IgfCBudWxsPigoKSA9PiBhY3RpdmUudmFsdWU/LmNvbG9yID8/IG51bGwpO1xuICAgICAgY29uc3QgY29uZmlndXJlID0gKHBhdGNoOiB7IG11dGVkPzogYm9vbGVhbjsgYWxlcnQ/OiBBbGVydDsgY29sb3I/OiBDaGFubmVsQ29sb3IgfCBudWxsIH0pID0+IHtcbiAgICAgICAgaWYgKHByb3BzLnNpZCAmJiBhY3RpdmUudmFsdWUpIG11LmNoYW5uZWxzLmNvbmZpZ3VyZShhY3RpdmUudmFsdWUua2V5LCBwYXRjaCwgcHJvcHMuc2lkKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFx1MjUwMFx1MjUwMCB0aGUgXCJuZXdcIiBkaXZpZGVyOiBiZWZvcmUgdGhlIGZpcnN0IG1lc3NhZ2UgdGhhdCB3YXMgdW5yZWFkIHdoZW4gdGhlIGNoYW5uZWwgd2FzIG9wZW5lZCBcdTI1MDBcdTI1MDBcbiAgICAgIC8vIENhcHR1cmVkIGZyb20gdGhlIGNoYW5uZWwncyB1bnJlYWQgY291bnQgYXMgaXQgaXMgc2hvd24gKGJlZm9yZSByZWFkaW5nIGNsZWFycyBpdCk7IGRyb3BwZWQgb24gYSBzd2l0Y2guXG4gICAgICBjb25zdCBkaXZpZGVyQXQgPSByZWY8bnVtYmVyIHwgbnVsbD4obnVsbCk7XG4gICAgICAvKiogQSBjaGlwIGNsaWNrIHNlbGVjdHMgKHdoaWNoIGNsZWFycyB0aGUgdW5yZWFkKTogd2hhdCB3YXMgdW5yZWFkIGlzIG5vdGVkIGZpcnN0LiAqL1xuICAgICAgbGV0IG5vdGVkOiB7IGtleTogc3RyaW5nOyBpZDogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbCA9IG51bGw7XG4gICAgICBsZXQgc2hvd25LZXkgPSAnJztcblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIHNjcm9sbDogZm9sbG93IHRoZSBib3R0b207IHNjcm9sbGVkIHVwLCBjb3VudCB3aGF0IGFycml2ZXMgYW5kIG9mZmVyIHRoZSBsYXRlc3QgXHUyNTAwXHUyNTAwXG4gICAgICBjb25zdCBzdHVjayA9IHJlZih0cnVlKTtcbiAgICAgIGNvbnN0IHNlZW5JZCA9IHJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcbiAgICAgIGNvbnN0IHBlbmRpbmcgPSBjb21wdXRlZCgoKSA9PiAoc3R1Y2sudmFsdWUgPyAwIDogbmV3ZXJUaGFuKG1zZ3MudmFsdWUsIHNlZW5JZC52YWx1ZSkpKTtcbiAgICAgIGZ1bmN0aW9uIG9uU2Nyb2xsKCkge1xuICAgICAgICBjb25zdCBlbCA9IHZpZXcudmFsdWU7XG4gICAgICAgIGlmICghZWwpIHJldHVybjtcbiAgICAgICAgY29uc3Qgd2FzID0gc3R1Y2sudmFsdWU7XG4gICAgICAgIHN0dWNrLnZhbHVlID0gYXRCb3R0b20oZWwpO1xuICAgICAgICBpZiAoc3R1Y2sudmFsdWUpIHNlZW5JZC52YWx1ZSA9IG51bGw7XG4gICAgICAgIGVsc2UgaWYgKHdhcykgc2VlbklkLnZhbHVlID0gbXNncy52YWx1ZVttc2dzLnZhbHVlLmxlbmd0aCAtIDFdPy5pZCA/PyBudWxsO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gdG9Cb3R0b20oKSB7XG4gICAgICAgIGNvbnN0IGVsID0gdmlldy52YWx1ZTtcbiAgICAgICAgaWYgKGVsKSBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIHN0dWNrLnZhbHVlID0gdHJ1ZTsgc2VlbklkLnZhbHVlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIHNlYXJjaCAodGhlIHRlcm1pbmFsJ3MgcnVsZXMgYW5kIGxvb2s6IGhpdCByb3dzIHRpbnRlZCwgdGhlIGFjdGl2ZSBvbmUgb3V0bGluZWQsIG4vTiwgXHUyMTkxIFx1MjE5MywgRXNjKSBcdTI1MDBcdTI1MDBcbiAgICAgIGNvbnN0IHNlYXJjaGluZyA9IHJlZihmYWxzZSk7XG4gICAgICBjb25zdCBxdWVyeSA9IHJlZignJyk7XG4gICAgICBjb25zdCBzZWFyY2hJbnB1dCA9IHJlZjxIVE1MSW5wdXRFbGVtZW50IHwgbnVsbD4obnVsbCk7XG4gICAgICBjb25zdCBoaXRJZHggPSByZWYoLTEpO1xuICAgICAgY29uc3QgZm91bmQgPSBjb21wdXRlZCgoKSA9PiBzZWFyY2hNZXNzYWdlcyhtc2dzLnZhbHVlLCBzZWFyY2hpbmcudmFsdWUgPyBxdWVyeS52YWx1ZSA6ICcnKSk7XG4gICAgICBjb25zdCBoaXRTZXQgPSBjb21wdXRlZCgoKSA9PiBuZXcgU2V0KGZvdW5kLnZhbHVlLmhpdHMpKTtcbiAgICAgIGNvbnN0IGFjdGl2ZUhpdCA9IGNvbXB1dGVkKCgpID0+IGFjdGl2ZUhpdElkKGZvdW5kLnZhbHVlLCBoaXRJZHgudmFsdWUpKTtcbiAgICAgIGNvbnN0IGNvdW50ID0gY29tcHV0ZWQoKCkgPT4gY291bnRUZXh0KGZvdW5kLnZhbHVlLCBxdWVyeS52YWx1ZSwgaGl0SWR4LnZhbHVlKSk7XG4gICAgICBhc3luYyBmdW5jdGlvbiByZXZlYWwoKSB7XG4gICAgICAgIGF3YWl0IG5leHRUaWNrKCk7XG4gICAgICAgIGNvbnN0IGlkID0gYWN0aXZlSGl0LnZhbHVlO1xuICAgICAgICBpZiAoaWQgPCAwIHx8ICF2aWV3LnZhbHVlKSByZXR1cm47XG4gICAgICAgIHZpZXcudmFsdWUucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oYFtkYXRhLW1pZD1cIiR7aWR9XCJdYCk/LnNjcm9sbEludG9WaWV3Py4oeyBibG9jazogJ25lYXJlc3QnIH0pO1xuICAgICAgfVxuICAgICAgd2F0Y2goKCkgPT4gW3F1ZXJ5LnZhbHVlLCBhY3RpdmVLZXkudmFsdWUsIHNlYXJjaGluZy52YWx1ZV0sICgpID0+IHsgaGl0SWR4LnZhbHVlID0gZm91bmQudmFsdWUuaGl0cy5sZW5ndGggLSAxOyB2b2lkIHJldmVhbCgpOyB9KTtcbiAgICAgIHdhdGNoKCgpID0+IGZvdW5kLnZhbHVlLmhpdHMubGVuZ3RoLCAobikgPT4geyBoaXRJZHgudmFsdWUgPSBjbGFtcEhpdChoaXRJZHgudmFsdWUsIG4pOyB9KTtcbiAgICAgIGZ1bmN0aW9uIHN0ZXAoZGlyOiAxIHwgLTEpIHtcbiAgICAgICAgY29uc3QgbiA9IGZvdW5kLnZhbHVlLmhpdHMubGVuZ3RoO1xuICAgICAgICBpZiAoIW4pIHJldHVybjtcbiAgICAgICAgaGl0SWR4LnZhbHVlID0gc3RlcEluZGV4KGhpdElkeC52YWx1ZSwgZGlyLCBuKTtcbiAgICAgICAgdm9pZCByZXZlYWwoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9wZW5TZWFyY2goKSB7IHNlYXJjaGluZy52YWx1ZSA9IHRydWU7IHZvaWQgbmV4dFRpY2soKCkgPT4geyBzZWFyY2hJbnB1dC52YWx1ZT8uZm9jdXMoKTsgc2VhcmNoSW5wdXQudmFsdWU/LnNlbGVjdCgpOyB9KTsgfVxuICAgICAgZnVuY3Rpb24gY2xvc2VTZWFyY2goKSB7IHF1ZXJ5LnZhbHVlID0gJyc7IHNlYXJjaGluZy52YWx1ZSA9IGZhbHNlOyB2aWV3LnZhbHVlPy5mb2N1cygpOyB9XG4gICAgICBmdW5jdGlvbiB0b2dnbGVTZWFyY2goKSB7IGlmIChzZWFyY2hpbmcudmFsdWUpIGNsb3NlU2VhcmNoKCk7IGVsc2Ugb3BlblNlYXJjaCgpOyB9XG4gICAgICBmdW5jdGlvbiBvblNlYXJjaEtleShlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGsgPSBzZWFyY2hLZXkoZSk7XG4gICAgICAgIGlmIChrID09PSAnY2xvc2UnKSB7IGNsb3NlU2VhcmNoKCk7IGUucHJldmVudERlZmF1bHQoKTsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfVxuICAgICAgICBlbHNlIGlmIChrKSB7IHN0ZXAoayA9PT0gJ25leHQnID8gMSA6IC0xKTsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBvblBhbmVsS2V5KGU6IEtleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgaWYgKGlzRmluZEtleShlKSAmJiBzdC52YWx1ZT8ua25vd24pIHsgb3BlblNlYXJjaCgpOyBlLnByZXZlbnREZWZhdWx0KCk7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IH1cbiAgICAgIH1cblxuICAgICAgLy8gXHUyNTAwXHUyNTAwIGtleWJvYXJkIGluIHRoZSBsaXN0OiBcdTIxOTEgXHUyMTkzIEhvbWUgRW5kIG1vdmUgYmV0d2VlbiBtZXNzYWdlcyAob25lIHRhYiBzdG9wOiB0aGUgZm9jdXNlZCByb3cpIFx1MjUwMFx1MjUwMFxuICAgICAgY29uc3QgZm9jdXNJZHggPSByZWYoLTEpO1xuICAgICAgd2F0Y2goYWN0aXZlS2V5LCAoKSA9PiB7IGZvY3VzSWR4LnZhbHVlID0gLTE7IH0pO1xuICAgICAgZnVuY3Rpb24gZm9jdXNSb3coaTogbnVtYmVyKSB7XG4gICAgICAgIGZvY3VzSWR4LnZhbHVlID0gaTtcbiAgICAgICAgdm9pZCBuZXh0VGljaygoKSA9PiB2aWV3LnZhbHVlPy5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PignLm1zZycpW2ldPy5mb2N1cygpKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIG9uTGlzdEtleShlOiBLZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIGlmIChlLmFsdEtleSB8fCBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJvd3MgPSBtc2dzLnZhbHVlLmxlbmd0aDtcbiAgICAgICAgY29uc3QgY3VyID0gZS50YXJnZXQgPT09IHZpZXcudmFsdWUgPyAtMSA6IGZvY3VzSWR4LnZhbHVlO1xuICAgICAgICBjb25zdCB0byA9IG1vdmVJbmRleChlLmtleSwgY3VyLCByb3dzKTtcbiAgICAgICAgaWYgKHRvICE9PSBudWxsKSB7IGZvY3VzUm93KHRvKTsgZS5wcmV2ZW50RGVmYXVsdCgpOyByZXR1cm47IH1cbiAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJyAmJiByZXBseVRvLnZhbHVlKSB7IGNhbmNlbFJlcGx5KCk7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgICAgfVxuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgcmVwbHk6IFwiUmVwbHkgdG8gWFwiLCB0aGUgdGV4dCBnb2VzIG91dCBhcyBgQFg6IHRleHRgIFx1MjUwMFx1MjUwMFxuICAgICAgY29uc3QgcmVwbHlUbyA9IHJlZignJyk7XG4gICAgICBmdW5jdGlvbiBzdGFydFJlcGx5KHNlbmRlcjogc3RyaW5nKSB7XG4gICAgICAgIGlmICghc2VuZGVyKSByZXR1cm47XG4gICAgICAgIHJlcGx5VG8udmFsdWUgPSBzZW5kZXI7XG4gICAgICAgIHZvaWQgbmV4dFRpY2soKCkgPT4gY29tcG9zZXIudmFsdWU/LmZvY3VzKCkpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gY2FuY2VsUmVwbHkoKSB7IHJlcGx5VG8udmFsdWUgPSAnJzsgY29tcG9zZXIudmFsdWU/LmZvY3VzKCk7IH1cbiAgICAgIGNvbnN0IG9uUmVwbHkgPSAoc2lkOiBzdHJpbmcsIGtleTogc3RyaW5nLCBzZW5kZXI6IHN0cmluZykgPT4geyBpZiAoc2lkID09PSBwcm9wcy5zaWQgJiYga2V5ID09PSBhY3RpdmVLZXkudmFsdWUpIHN0YXJ0UmVwbHkoc2VuZGVyKTsgfTtcbiAgICAgIHJlcGxpZXMuYWRkKG9uUmVwbHkpO1xuICAgICAgb25CZWZvcmVVbm1vdW50KCgpID0+IHsgcmVwbGllcy5kZWxldGUob25SZXBseSk7IH0pO1xuXG4gICAgICAvLyBcdTI1MDBcdTI1MDAgdGhlIG1lc3NhZ2UgY29udGV4dCBtZW51OiBlYWNoIHJvdyBpcyBhIGBjaGFubmVsLW1lc3NhZ2VgIHRhcmdldCAoY29yZSBhbmQgZXh0ZW5zaW9uIGVudHJpZXMpIFx1MjUwMFx1MjUwMFxuICAgICAgY29uc3Qgcm93VGFyZ2V0cyA9IG5ldyBNYXA8bnVtYmVyLCB7IGVsOiBIVE1MRWxlbWVudDsgb2ZmOiBEaXNwb3NlIH0+KCk7XG4gICAgICBmdW5jdGlvbiBtYXJrUm93KGVsOiBFbGVtZW50IHwgbnVsbCwgbTogQ2hhbm5lbE1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgfHwgIXByb3BzLnNpZCB8fCB0eXBlb2YgbXUubWVudXM/LnRhcmdldCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYWQgPSByb3dUYXJnZXRzLmdldChtLmlkKTtcbiAgICAgICAgaWYgKGhhZD8uZWwgPT09IGVsKSByZXR1cm47XG4gICAgICAgIGhhZD8ub2ZmKCk7XG4gICAgICAgIHJvd1RhcmdldHMuc2V0KG0uaWQsIHsgZWwsIG9mZjogbXUubWVudXMudGFyZ2V0KGVsLCB7IGtpbmQ6ICdjaGFubmVsLW1lc3NhZ2UnLCBzaWQ6IHByb3BzLnNpZCwga2V5OiBhY3RpdmVLZXkudmFsdWUsIG1lc3NhZ2U6IG0gfSkgfSk7XG4gICAgICB9XG4gICAgICB3YXRjaCgoKSA9PiBtc2dzLnZhbHVlLm1hcCgobSkgPT4gbS5pZCkuam9pbignLCcpLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpdmUgPSBuZXcgU2V0KG1zZ3MudmFsdWUubWFwKChtKSA9PiBtLmlkKSk7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCByXSBvZiByb3dUYXJnZXRzKSBpZiAoIWxpdmUuaGFzKGlkKSB8fCAhci5lbC5pc0Nvbm5lY3RlZCkgeyByLm9mZigpOyByb3dUYXJnZXRzLmRlbGV0ZShpZCk7IH1cbiAgICAgIH0sIHsgZmx1c2g6ICdwb3N0JyB9KTtcbiAgICAgIG9uQmVmb3JlVW5tb3VudCgoKSA9PiB7IGZvciAoY29uc3QgciBvZiByb3dUYXJnZXRzLnZhbHVlcygpKSByLm9mZigpOyByb3dUYXJnZXRzLmNsZWFyKCk7IH0pO1xuXG4gICAgICBmdW5jdGlvbiBwaWNrKGtleTogc3RyaW5nKSB7XG4gICAgICAgIGlmICghcHJvcHMuc2lkIHx8IHNvbG8udmFsdWUpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2ggPSBzdC52YWx1ZT8uY2hhbm5lbHMuZmluZCgoeCkgPT4geC5rZXkgPT09IGtleSk7XG4gICAgICAgIGlmIChrZXkgIT09IGFjdGl2ZUtleS52YWx1ZSkgbm90ZWQgPSB7IGtleSwgaWQ6IGNoID8gZmlyc3RVbnJlYWRJZChzdC52YWx1ZT8ubWVzc2FnZXNba2V5XSA/PyBbXSwgY2gudW5yZWFkKSA6IG51bGwgfTtcbiAgICAgICAgbXUuY2hhbm5lbHMuc2VsZWN0KGtleSwgcHJvcHMuc2lkKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGNmZ0ZvcihrZXk6IHN0cmluZykgeyBwaWNrKGtleSk7IHNob3dDZmcudmFsdWUgPSB0cnVlOyB9XG4gICAgICBmdW5jdGlvbiBwb3BPdXQoKSB7XG4gICAgICAgIGNvbnN0IGNoID0gYWN0aXZlLnZhbHVlO1xuICAgICAgICBpZiAoIXByb3BzLnNpZCB8fCAhY2gpIHJldHVybjtcbiAgICAgICAgbXUucGFuZWxzLm9wZW4oLi4ucG9wT3V0QXJncyhjaCwgcHJvcHMuc2lkKSk7XG4gICAgICB9XG4gICAgICBhc3luYyBmdW5jdGlvbiBzZW5kKGU6IEV2ZW50KSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCFwcm9wcy5zaWQgfHwgIWRyYWZ0LnZhbHVlLnRyaW0oKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gcmVwbHlUZXh0KHJlcGx5VG8udmFsdWUsIGRyYWZ0LnZhbHVlKTtcbiAgICAgICAgZHJhZnQudmFsdWUgPSAnJztcbiAgICAgICAgcmVwbHlUby52YWx1ZSA9ICcnO1xuICAgICAgICBhd2FpdCBtdS5jaGFubmVscy5zZW5kKHQsIGFjdGl2ZUtleS52YWx1ZSwgcHJvcHMuc2lkKTtcbiAgICAgIH1cbiAgICAgIC8vIEtleWVkIG9uIHRoZSBsYXN0IG1lc3NhZ2UgaWQsIG5vdCB0aGUgY291bnQ6IHRoZSBob3N0IGNhcHMgYSBjaGFubmVsJ3MgaGlzdG9yeSAoNTAwKSwgc28gdGhlIGxlbmd0aFxuICAgICAgLy8gc3RvcHMgY2hhbmdpbmcgb25jZSBpdCBpcyBmdWxsIHdoaWxlIG5ldyBtZXNzYWdlcyBrZWVwIGFycml2aW5nLlxuICAgICAgd2F0Y2goWygpID0+IG1zZ3MudmFsdWVbbXNncy52YWx1ZS5sZW5ndGggLSAxXT8uaWQsIGFjdGl2ZUtleSwgKCkgPT4gYWN0aXZlLnZhbHVlPy51bnJlYWRdLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIEEgY2hhbm5lbCBjb21pbmcgdXA6IHRoZSBkaXZpZGVyIGdvZXMgYmVmb3JlIHdoYXQgd2FzIHVucmVhZCB0aGVuIChpdCBzdGF5cyB3aGlsZSB0aGUgY2hhbm5lbCBpcyBzaG93bjtcbiAgICAgICAgLy8gd2hhdCBhcnJpdmVzIHdoaWxlIGl0IGlzIHNob3duIGlzIHJlYWQgYXQgb25jZSkuIFRoZSByZXBseSBhbmQgdGhlIHNjcm9sbCBzdGF0ZSBzdGFydCBvdmVyLlxuICAgICAgICBjb25zdCBhID0gYWN0aXZlLnZhbHVlO1xuICAgICAgICBpZiAoYSAmJiBhLmtleSAhPT0gc2hvd25LZXkpIHtcbiAgICAgICAgICBzaG93bktleSA9IGEua2V5O1xuICAgICAgICAgIGRpdmlkZXJBdC52YWx1ZSA9IG5vdGVkPy5rZXkgPT09IGEua2V5ID8gbm90ZWQuaWQgOiBmaXJzdFVucmVhZElkKG1zZ3MudmFsdWUsIGEudW5yZWFkKTtcbiAgICAgICAgICBub3RlZCA9IG51bGw7XG4gICAgICAgICAgcmVwbHlUby52YWx1ZSA9ICcnOyBzdHVjay52YWx1ZSA9IHRydWU7IHNlZW5JZC52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVhZGluZyBhIGNoYW5uZWwgY2xlYXJzIGl0cyB1bnJlYWQgY291bnQgKHRoZSBwb3BwZWQtb3V0IHZpZXcgcmVhZHMgaXRzIG93biBjaGFubmVsKS5cbiAgICAgICAgY29uc3QgciA9IHByb3BzLnNpZCA/IHJlYWRBY3Rpb24oc3QudmFsdWUsIHNvbG8udmFsdWUpIDogbnVsbDtcbiAgICAgICAgaWYgKHIgJiYgcHJvcHMuc2lkKSB7IGlmIChyLm9wID09PSAnbWFya1JlYWQnKSBtdS5jaGFubmVscy5tYXJrUmVhZChyLmtleSwgcHJvcHMuc2lkKTsgZWxzZSBtdS5jaGFubmVscy5zZWxlY3Qoci5rZXksIHByb3BzLnNpZCk7IH1cbiAgICAgICAgYXdhaXQgbmV4dFRpY2soKTtcbiAgICAgICAgaWYgKHZpZXcudmFsdWUgJiYgYWN0aXZlSGl0LnZhbHVlIDwgMCAmJiBzdHVjay52YWx1ZSkgdmlldy52YWx1ZS5zY3JvbGxUb3AgPSB2aWV3LnZhbHVlLnNjcm9sbEhlaWdodDtcbiAgICAgIH0sIHsgaW1tZWRpYXRlOiB0cnVlIH0pO1xuXG4gICAgICBjb25zdCBjaGlwID0gKGNoOiBDaGFubmVsVmlldyk6IFZOb2RlID0+IGgoJ2J1dHRvbicsIHtcbiAgICAgICAga2V5OiBjaC5rZXksIHR5cGU6ICdidXR0b24nLCAnZGF0YS1rZXknOiBjaC5rZXksXG4gICAgICAgIGNsYXNzOiBjbHMoJ2NjJywgY2gua2V5ID09PSBhY3RpdmVLZXkudmFsdWUgJiYgJ29uJywgY2gubXV0ZWQgJiYgJ211dGVkJywgY2gubWVudGlvbiAmJiAnbWVudGlvbicsICEhY2guY29sb3IgJiYgJ3RpbnRlZCcpLFxuICAgICAgICBzdHlsZTogdGludFN0eWxlKGNoLmNvbG9yKSwgJ2RhdGEtY29sb3InOiBjaC5jb2xvciB8fCB1bmRlZmluZWQsICdhcmlhLXByZXNzZWQnOiBTdHJpbmcoY2gua2V5ID09PSBhY3RpdmVLZXkudmFsdWUpLFxuICAgICAgICAnYXJpYS1jdXJyZW50JzogY2gua2V5ID09PSBhY3RpdmVLZXkudmFsdWUgPyAndHJ1ZScgOiB1bmRlZmluZWQsXG4gICAgICAgICdhcmlhLWxhYmVsJzogQ09QWS5jaGlwTGFiZWwoY2guY2FwdGlvbiwgY2gudW5yZWFkLCBjaC5tZW50aW9uLCBjaC5vbmxpbmUsIGNoLm11dGVkKSwgdGl0bGU6IGNoLmNhcHRpb24sXG4gICAgICAgIG9uQ2xpY2s6ICgpID0+IHBpY2soY2gua2V5KSxcbiAgICAgICAgb25Db250ZXh0bWVudTogKGU6IE1vdXNlRXZlbnQpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBjZmdGb3IoY2gua2V5KTsgfSxcbiAgICAgIH0sIFtcbiAgICAgICAgaCgnc3BhbicsIHsgY2xhc3M6ICduYW1lJyB9LCBjaC5jYXB0aW9uKSxcbiAgICAgICAgY2gubWVudGlvbiA/IGgoJ3NwYW4nLCB7IGNsYXNzOiAnYXQnLCAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSwgJ0AnKSA6IG51bGwsXG4gICAgICAgIGNoLm9ubGluZSAhPT0gbnVsbCA/IGgoJ3NwYW4nLCB7IGNsYXNzOiAnb25saW5lJywgdGl0bGU6IENPUFkub25saW5lKGNoLm9ubGluZSksICdhcmlhLWhpZGRlbic6ICd0cnVlJyB9LCBTdHJpbmcoY2gub25saW5lKSkgOiBudWxsLFxuICAgICAgICBjaC51bnJlYWQgPyBoKCdzcGFuJywgeyBjbGFzczogY2xzKCdiZCcsIGMuY291bnQpLCAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSwgU3RyaW5nKGNoLnVucmVhZCkpIDogbnVsbCxcbiAgICAgIF0pO1xuXG4gICAgICBjb25zdCB0b29sID0gKG9uOiBib29sZWFuLCBleHRyYTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGxhYmVsOiBzdHJpbmcpID0+XG4gICAgICAgIGgoJ2J1dHRvbicsIHsgdHlwZTogJ2J1dHRvbicsIGNsYXNzOiBjbHMoYy5jbWQsICd0Jywgb24gJiYgJ29uJyksIC4uLmV4dHJhIH0sIGxhYmVsKTtcblxuICAgICAgY29uc3QgY2ZnU3RyaXAgPSAobmFtZTogc3RyaW5nKSA9PiBoKCdkaXYnLCB7IGNsYXNzOiAnY2NmZycsICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLWNmZycgfSwgW1xuICAgICAgICBoKCdkaXYnLCB7IGNsYXNzOiAnY2ZnLXJvdycgfSwgW1xuICAgICAgICAgIGgoJ3NwYW4nLCBDT1BZLmNvbG9yKSxcbiAgICAgICAgICBoKCdzcGFuJywgeyBjbGFzczogJ3N3YXRjaGVzJywgcm9sZTogJ3JhZGlvZ3JvdXAnLCAnYXJpYS1sYWJlbCc6IENPUFkuY29sb3IsICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLWNvbG9ycycgfSwgW1xuICAgICAgICAgICAgaCgnYnV0dG9uJywge1xuICAgICAgICAgICAgICB0eXBlOiAnYnV0dG9uJywgY2xhc3M6IGNscygnc3cnLCAnbm9uZScsICFjb2xvci52YWx1ZSAmJiAnb24nKSwgcm9sZTogJ3JhZGlvJywgJ2FyaWEtY2hlY2tlZCc6IFN0cmluZyghY29sb3IudmFsdWUpLFxuICAgICAgICAgICAgICB0aXRsZTogQ09QWS5jb2xvckRlZmF1bHQsICdhcmlhLWxhYmVsJzogQ09QWS5jb2xvckRlZmF1bHQsICdkYXRhLWNvbG9yJzogJycsIG9uQ2xpY2s6ICgpID0+IGNvbmZpZ3VyZSh7IGNvbG9yOiBudWxsIH0pLFxuICAgICAgICAgICAgfSwgJ1x1MDBENycpLFxuICAgICAgICAgICAgLi4uQ0hBTk5FTF9DT0xPUlMubWFwKChrKSA9PiBoKCdidXR0b24nLCB7XG4gICAgICAgICAgICAgIGtleTogaywgdHlwZTogJ2J1dHRvbicsIGNsYXNzOiBjbHMoJ3N3JywgY29sb3IudmFsdWUgPT09IGsgJiYgJ29uJyksIHJvbGU6ICdyYWRpbycsICdhcmlhLWNoZWNrZWQnOiBTdHJpbmcoY29sb3IudmFsdWUgPT09IGspLFxuICAgICAgICAgICAgICBzdHlsZTogc3dhdGNoU3R5bGUoayksIHRpdGxlOiBDT1BZLmNvbG9yc1trXSwgJ2FyaWEtbGFiZWwnOiBDT1BZLmNvbG9yc1trXSwgJ2RhdGEtY29sb3InOiBrLCBvbkNsaWNrOiAoKSA9PiBjb25maWd1cmUoeyBjb2xvcjogayB9KSxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgICAgIGgoJ2xhYmVsJywgeyBjbGFzczogJ2NmZy1yb3cnIH0sIFtcbiAgICAgICAgICBoKCdzcGFuJywgQ09QWS5hbGVydHMpLFxuICAgICAgICAgIGgoJ3NlbGVjdCcsIHtcbiAgICAgICAgICAgIGNsYXNzOiBjbHMoJ3NlbCcsIGMuZmllbGQpLCB2YWx1ZTogYWxlcnQudmFsdWUsICdhcmlhLWxhYmVsJzogQ09QWS5hbGVydHNMYWJlbChuYW1lKSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAoZTogRXZlbnQpID0+IGNvbmZpZ3VyZSh7IGFsZXJ0OiAoZS50YXJnZXQgYXMgSFRNTFNlbGVjdEVsZW1lbnQpLnZhbHVlIGFzIEFsZXJ0IH0pLFxuICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgIGgoJ29wdGlvbicsIHsgdmFsdWU6ICdhbGwnLCBzZWxlY3RlZDogYWxlcnQudmFsdWUgPT09ICdhbGwnIH0sIENPUFkuYWxlcnRBbGwpLFxuICAgICAgICAgICAgaCgnb3B0aW9uJywgeyB2YWx1ZTogJ21lbnRpb25zJywgc2VsZWN0ZWQ6IGFsZXJ0LnZhbHVlID09PSAnbWVudGlvbnMnIH0sIENPUFkuYWxlcnRNZW50aW9ucyksXG4gICAgICAgICAgICBoKCdvcHRpb24nLCB7IHZhbHVlOiAnbm9uZScsIHNlbGVjdGVkOiBhbGVydC52YWx1ZSA9PT0gJ25vbmUnIH0sIENPUFkuYWxlcnROb25lKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgICBdKTtcblxuICAgICAgY29uc3Qgc2VhcmNoU3RyaXAgPSAoKSA9PiBoKCdkaXYnLCB7IGNsYXNzOiAnY3NlYXJjaCcsICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLXNlYXJjaCcgfSwgW1xuICAgICAgICBoKCdzcGFuJywgeyBjbGFzczogJ3MtZ2x5cGgnLCAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSwgJ1x1MjMxNScpLFxuICAgICAgICBoKCdpbnB1dCcsIHtcbiAgICAgICAgICByZWY6IHNlYXJjaElucHV0LCB2YWx1ZTogcXVlcnkudmFsdWUsIHBsYWNlaG9sZGVyOiBDT1BZLnNlYXJjaFBsYWNlaG9sZGVyLCAnYXJpYS1sYWJlbCc6IENPUFkuc2VhcmNoUGxhY2Vob2xkZXIsIHNwZWxsY2hlY2s6ICdmYWxzZScsXG4gICAgICAgICAgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWwtc2VhcmNoLWlucHV0JyxcbiAgICAgICAgICBvbklucHV0OiAoZTogRXZlbnQpID0+IHsgcXVlcnkudmFsdWUgPSAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWU7IH0sXG4gICAgICAgICAgb25LZXlkb3duOiBvblNlYXJjaEtleSxcbiAgICAgICAgfSksXG4gICAgICAgIGgoJ3NwYW4nLCB7IGNsYXNzOiBjbHMoJ2NudCcsIGZvdW5kLnZhbHVlLmVycm9yICYmICdlcnInKSwgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWwtc2VhcmNoLWNvdW50JywgJ2FyaWEtbGl2ZSc6ICdwb2xpdGUnIH0sIGNvdW50LnZhbHVlKSxcbiAgICAgICAgaCgnYnV0dG9uJywgeyB0eXBlOiAnYnV0dG9uJywgY2xhc3M6IGNscyhjLmNtZCwgJ3MtYnRuJyksICdhcmlhLWxhYmVsJzogQ09QWS5wcmV2LCAnZGF0YS1zJzogJ3ByZXYnLCBvbkNsaWNrOiAoKSA9PiBzdGVwKC0xKSB9LCBDT1BZLnByZXZMYWJlbCksXG4gICAgICAgIGgoJ2J1dHRvbicsIHsgdHlwZTogJ2J1dHRvbicsIGNsYXNzOiBjbHMoYy5jbWQsICdzLWJ0bicpLCAnYXJpYS1sYWJlbCc6IENPUFkubmV4dCwgJ2RhdGEtcyc6ICduZXh0Jywgb25DbGljazogKCkgPT4gc3RlcCgxKSB9LCBDT1BZLm5leHRMYWJlbCksXG4gICAgICAgIGgoJ2J1dHRvbicsIHsgdHlwZTogJ2J1dHRvbicsIGNsYXNzOiBjbHMoYy5jbWQsICdzLWJ0bicpLCAnYXJpYS1sYWJlbCc6IENPUFkuY2xvc2UsICdkYXRhLXMnOiAnY2xvc2UnLCBvbkNsaWNrOiBjbG9zZVNlYXJjaCB9LCBDT1BZLmNsb3NlTGFiZWwpLFxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IHJvdyA9IChtOiBDaGFubmVsTWVzc2FnZSwgaTogbnVtYmVyKTogVk5vZGVbXSA9PiB7XG4gICAgICAgIC8vIEFmdGVyIHRoZSBkaXZpZGVyIGEgbWVzc2FnZSBzdGFydHMgYSBuZXcgZ3JvdXAuXG4gICAgICAgIGNvbnN0IGcgPSBncm91cGVkLnZhbHVlLmhhcyhtLmlkKSAmJiAhKG0uaWQgPT09IGRpdmlkZXJBdC52YWx1ZSAmJiAhc2VhcmNoaW5nLnZhbHVlKTtcbiAgICAgICAgY29uc3QgdGltZSA9IGhobW0obS50cyk7XG4gICAgICAgIGNvbnN0IG91dDogVk5vZGVbXSA9IFtdO1xuICAgICAgICBpZiAobS5pZCA9PT0gZGl2aWRlckF0LnZhbHVlICYmICFzZWFyY2hpbmcudmFsdWUpIHtcbiAgICAgICAgICBvdXQucHVzaChoKCdkaXYnLCB7IGtleTogYG5ldy0ke20uaWR9YCwgY2xhc3M6ICdkaXZpZGVyJywgcm9sZTogJ3NlcGFyYXRvcicsICdhcmlhLWxhYmVsJzogQ09QWS5uZXdEaXZpZGVyTGFiZWwsICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLW5ldycgfSwgW2goJ3NwYW4nLCBDT1BZLm5ld0RpdmlkZXIpXSkpO1xuICAgICAgICB9XG4gICAgICAgIG91dC5wdXNoKGgoJ2RpdicsIHtcbiAgICAgICAgICBrZXk6IG0uaWQsICdkYXRhLW1pZCc6IG0uaWQsIHJvbGU6ICdhcnRpY2xlJywgdGFiaW5kZXg6IGkgPT09IGZvY3VzSWR4LnZhbHVlID8gJzAnIDogJy0xJyxcbiAgICAgICAgICAnYXJpYS1sYWJlbCc6IENPUFkubWVzc2FnZUxhYmVsKG0uc2VuZGVyLCB0aW1lLCBtLnRleHQpLFxuICAgICAgICAgIGNsYXNzOiBjbHMoJ21zZycsIGcgJiYgJ2dyb3VwZWQnLCBtLm1lbnRpb24gJiYgJ21lbnRpb24nLCBoaXRTZXQudmFsdWUuaGFzKG0uaWQpICYmICdoaXQnLCBtLmlkID09PSBhY3RpdmVIaXQudmFsdWUgJiYgJ2FjdGl2ZScpLFxuICAgICAgICAgIHJlZjogKChlbDogdW5rbm93bikgPT4gbWFya1JvdyhlbCBhcyBFbGVtZW50IHwgbnVsbCwgbSkpIGFzIG5ldmVyLFxuICAgICAgICAgIG9uRm9jdXM6ICgpID0+IHsgZm9jdXNJZHgudmFsdWUgPSBpOyB9LFxuICAgICAgICB9LCBbXG4gICAgICAgICAgZyA/IG51bGwgOiBoKCdzcGFuJywgeyBjbGFzczogJ210cycgfSwgdGltZSksXG4gICAgICAgICAgZyA/IG51bGwgOiBoKCdzcGFuJywgeyBjbGFzczogJ3NlbmRlcicgfSwgbS5zZW5kZXIpLFxuICAgICAgICAgIGgoJ3NwYW4nLCB7IGNsYXNzOiAnYiB0ZXh0JyB9LCBtLnRleHQpLFxuICAgICAgICAgIG0ucmVhY3Rpb25zID8gaCgnc3BhbicsIHsgY2xhc3M6ICdyZWFjdHMnIH0sIE9iamVjdC5lbnRyaWVzKG0ucmVhY3Rpb25zKS5tYXAoKFtyLCBuXSkgPT4gaCgnc3BhbicsIHsga2V5OiByLCBjbGFzczogJ3JlYWN0JyB9LCBgJHtyfSAke259YCkpKSA6IG51bGwsXG4gICAgICAgICAgbS5zZW5kZXIgPyBoKCdzcGFuJywgeyBjbGFzczogJ210JyB9LCBbXG4gICAgICAgICAgICBoKCdidXR0b24nLCB7XG4gICAgICAgICAgICAgIHR5cGU6ICdidXR0b24nLCBjbGFzczogY2xzKGMuY21kLCBjLnNxLCAnbXQtYnRuJyksIHRpdGxlOiBDT1BZLnJlcGx5LCAnYXJpYS1sYWJlbCc6IENPUFkucmVwbHlMYWJlbChtLnNlbmRlciksICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLXJlcGx5JyxcbiAgICAgICAgICAgICAgb25DbGljazogKGU6IE1vdXNlRXZlbnQpID0+IHsgZS5zdG9wUHJvcGFnYXRpb24oKTsgc3RhcnRSZXBseShtLnNlbmRlcik7IH0sXG4gICAgICAgICAgICB9LCAnXHUyMUE5JyksXG4gICAgICAgICAgXSkgOiBudWxsLFxuICAgICAgICBdKSk7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBtZXNzYWdlcyA9IChhOiBDaGFubmVsVmlldykgPT4gaCgnZGl2JywgeyBjbGFzczogJ21zZ3Mtd3JhcCcgfSwgW1xuICAgICAgICBoKCdkaXYnLCB7XG4gICAgICAgICAgcmVmOiB2aWV3LCBjbGFzczogJ21zZ3MnLCByb2xlOiAnbG9nJywgJ2RhdGEtZm9jdXMtcmVnaW9uJzogJ2NoYW5uZWxzJywgdGFiaW5kZXg6ICctMScsICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLW1zZ3MnLCBzdHlsZTogdGludFN0eWxlKGEuY29sb3IpLFxuICAgICAgICAgICdhcmlhLWxhYmVsJzogQ09QWS5tZXNzYWdlc0xhYmVsKGEuY2FwdGlvbiksIG9uU2Nyb2xsLCBvbktleWRvd246IG9uTGlzdEtleSxcbiAgICAgICAgfSwgbXNncy52YWx1ZS5sZW5ndGggPyBtc2dzLnZhbHVlLmZsYXRNYXAocm93KSA6IFtoKCdwJywgeyBjbGFzczogYy5lbXB0eSB9LCBDT1BZLm5vTWVzc2FnZXMpXSksXG4gICAgICAgIHBlbmRpbmcudmFsdWUgPiAwID8gaCgnYnV0dG9uJywge1xuICAgICAgICAgIHR5cGU6ICdidXR0b24nLCBjbGFzczogJ2xhdGVzdCcsICdhcmlhLWxhYmVsJzogQ09QWS5sYXRlc3RMYWJlbCwgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWwtbGF0ZXN0Jywgb25DbGljazogKCkgPT4geyB0b0JvdHRvbSgpOyB2aWV3LnZhbHVlPy5mb2N1cygpOyB9LFxuICAgICAgICB9LCBgXHUyMTkzICR7Q09QWS5sYXRlc3QocGVuZGluZy52YWx1ZSl9YCkgOiBudWxsLFxuICAgICAgXSk7XG5cbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBib2R5T2Yoc3QudmFsdWUsIHNvbG8udmFsdWUpO1xuICAgICAgICBjb25zdCBraWRzOiBBcnJheTxWTm9kZSB8IG51bGw+ID0gW107XG4gICAgICAgIGlmIChib2R5ID09PSAnZ29uZScpIHtcbiAgICAgICAgICBraWRzLnB1c2goaCgncCcsIHsgY2xhc3M6IGNscyhjLmVtcHR5LCAnYXdhaXRpbmcnKSwgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWxzLWdvbmUnIH0sIENPUFkuZ29uZShzb2xvLnZhbHVlKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtpZHMucHVzaChoKCdkaXYnLCB7IGNsYXNzOiAncmFpbCcsIHJvbGU6ICdncm91cCcsICdhcmlhLWxhYmVsJzogQ09QWS5yYWlsLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1yYWlsJyB9LCBbXG4gICAgICAgICAgICAuLi5yYWlsLnZhbHVlLm1hcChjaGlwKSxcbiAgICAgICAgICAgIHJhaWwudmFsdWUubGVuZ3RoID8gbnVsbCA6IGgoJ3NwYW4nLCB7IGNsYXNzOiAncmFpbC1lbXB0eScgfSwgQ09QWS5ub25lKSxcbiAgICAgICAgICBdKSk7XG4gICAgICAgICAgY29uc3QgYSA9IGFjdGl2ZS52YWx1ZTtcbiAgICAgICAgICBpZiAoYm9keSA9PT0gJ2F3YWl0aW5nJykga2lkcy5wdXNoKGgoJ3AnLCB7IGNsYXNzOiBjbHMoYy5lbXB0eSwgJ2F3YWl0aW5nJyksIHRhYmluZGV4OiAnLTEnLCAnZGF0YS1mb2N1cy1yZWdpb24nOiAnY2hhbm5lbHMnLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbHMtZW1wdHknIH0sIENPUFkuYXdhaXRpbmcpKTtcbiAgICAgICAgICBlbHNlIGlmIChib2R5ID09PSAnbm9uZScgfHwgIWEpIGtpZHMucHVzaChoKCdwJywgeyBjbGFzczogY2xzKGMuZW1wdHksICdhd2FpdGluZycpLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbHMtbm9uZScgfSwgQ09QWS5ub0NoYW5uZWwpKTtcbiAgICAgICAgICBlbHNlIGtpZHMucHVzaChoKCdkaXYnLCB7IGNsYXNzOiAnY3YnIH0sIFtcbiAgICAgICAgICAgIGgoJ2RpdicsIHsgY2xhc3M6ICdoZWFkJyB9LCBbXG4gICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IGNsYXNzOiBjbHMoJ3RpdGxlJywgYy5nbG93KSwgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWwtdGl0bGUnIH0sIGEuY2FwdGlvbiksXG4gICAgICAgICAgICAgIGEudG9waWMgPyBoKCdzcGFuJywgeyBjbGFzczogJ3RvcGljJywgdGl0bGU6IGEudG9waWMgfSwgYS50b3BpYykgOiBudWxsLFxuICAgICAgICAgICAgICBoKCdzcGFuJywgeyBjbGFzczogJ3Rvb2xzJyB9LCBbXG4gICAgICAgICAgICAgICAgdG9vbChzaG93Q2ZnLnZhbHVlLCB7IHRpdGxlOiBDT1BZLnNldHRpbmdzVGl0bGUsICdhcmlhLWxhYmVsJzogQ09QWS5zZXR0aW5nc0xhYmVsKGEuY2FwdGlvbiksICdhcmlhLWV4cGFuZGVkJzogU3RyaW5nKHNob3dDZmcudmFsdWUpLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1jZmctYnRuJywgb25DbGljazogKCkgPT4geyBzaG93Q2ZnLnZhbHVlID0gIXNob3dDZmcudmFsdWU7IH0gfSwgQ09QWS5zZXR0aW5ncyksXG4gICAgICAgICAgICAgICAgdG9vbChzZWFyY2hpbmcudmFsdWUsIHsgdGl0bGU6IENPUFkuc2VhcmNoVGl0bGUsICdhcmlhLWxhYmVsJzogQ09QWS5zZWFyY2hMYWJlbChhLmNhcHRpb24pLCAnYXJpYS1leHBhbmRlZCc6IFN0cmluZyhzZWFyY2hpbmcudmFsdWUpLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1zZWFyY2gtYnRuJywgb25DbGljazogdG9nZ2xlU2VhcmNoIH0sIENPUFkuc2VhcmNoKSxcbiAgICAgICAgICAgICAgICB0b29sKG11dGVkLnZhbHVlLCB7IHRpdGxlOiBDT1BZLm11dGVUaXRsZSwgJ2FyaWEtcHJlc3NlZCc6IFN0cmluZyhtdXRlZC52YWx1ZSksICdkYXRhLXRlc3RpZCc6ICdjaGFubmVsLW11dGUnLCBvbkNsaWNrOiAoKSA9PiBjb25maWd1cmUoeyBtdXRlZDogIW11dGVkLnZhbHVlIH0pIH0sIG11dGVkLnZhbHVlID8gQ09QWS5tdXRlZCA6IENPUFkubXV0ZSksXG4gICAgICAgICAgICAgICAgc29sby52YWx1ZSA/IG51bGwgOiB0b29sKGZhbHNlLCB7IHRpdGxlOiBDT1BZLnBvcE91dFRpdGxlKGEuY2FwdGlvbiksICdhcmlhLWxhYmVsJzogQ09QWS5wb3BPdXRUaXRsZShhLmNhcHRpb24pLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1wb3BvdXQnLCBvbkNsaWNrOiBwb3BPdXQgfSwgQ09QWS5wb3BPdXQpLFxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgc2hvd0NmZy52YWx1ZSA/IGNmZ1N0cmlwKGEuY2FwdGlvbikgOiBudWxsLFxuICAgICAgICAgICAgc2VhcmNoaW5nLnZhbHVlID8gc2VhcmNoU3RyaXAoKSA6IG51bGwsXG4gICAgICAgICAgICBtZXNzYWdlcyhhKSxcbiAgICAgICAgICAgIHJlcGx5VG8udmFsdWUgPyBoKCdkaXYnLCB7IGNsYXNzOiAncmVwbHliYXInLCAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1yZXBseWJhcicgfSwgW1xuICAgICAgICAgICAgICBoKCdzcGFuJywgW2Ake0NPUFkucmVwbHlpbmdUb30gYCwgaCgnYicsIHJlcGx5VG8udmFsdWUpXSksXG4gICAgICAgICAgICAgIGgoJ2J1dHRvbicsIHsgdHlwZTogJ2J1dHRvbicsIGNsYXNzOiBjbHMoYy5jbWQsICdyYi1jYW5jZWwnKSwgJ2FyaWEtbGFiZWwnOiBDT1BZLmNhbmNlbFJlcGx5LCBvbkNsaWNrOiBjYW5jZWxSZXBseSB9LCBDT1BZLmNhbmNlbCksXG4gICAgICAgICAgICBdKSA6IG51bGwsXG4gICAgICAgICAgICBoKCdmb3JtJywgeyBjbGFzczogJ2NvbXBvc2VyJywgb25TdWJtaXQ6IHNlbmQgfSwgW1xuICAgICAgICAgICAgICBoKCdzcGFuJywgeyBjbGFzczogY2xzKCdjaGV2JywgYy5nbG93KSwgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0sICdcdTI3NkYnKSxcbiAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XG4gICAgICAgICAgICAgICAgcmVmOiBjb21wb3NlciwgdmFsdWU6IGRyYWZ0LnZhbHVlLCBjbGFzczogY2xzKCdpbicsIGMuZmllbGQpLCBhdXRvY29tcGxldGU6ICdvZmYnLCBwbGFjZWhvbGRlcjogQ09QWS5wbGFjZWhvbGRlcihhLmNhcHRpb24pLCAnYXJpYS1sYWJlbCc6IENPUFkucGxhY2Vob2xkZXIoYS5jYXB0aW9uKSxcbiAgICAgICAgICAgICAgICAnZGF0YS10ZXN0aWQnOiAnY2hhbm5lbC1pbnB1dCcsIG9uSW5wdXQ6IChlOiBFdmVudCkgPT4geyBkcmFmdC52YWx1ZSA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZTsgfSxcbiAgICAgICAgICAgICAgICBvbktleWRvd246IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7IGlmIChlLmtleSA9PT0gJ0VzY2FwZScgJiYgcmVwbHlUby52YWx1ZSkgeyByZXBseVRvLnZhbHVlID0gJyc7IGUucHJldmVudERlZmF1bHQoKTsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSB9LFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgIF0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaCgnc2VjdGlvbicsIHtcbiAgICAgICAgICBjbGFzczogY2xzKCdtdS1jaGFubmVscycsICdjaGFuJywgISFzb2xvLnZhbHVlICYmICdzb2xvJyksICdhcmlhLWxhYmVsJzogQ09QWS50aXRsZSwgJ2RhdGEtdGVzdGlkJzogJ2NoYW5uZWxzJyxcbiAgICAgICAgICAnZGF0YS1jaGFubmVsJzogc29sby52YWx1ZSB8fCB1bmRlZmluZWQsIG9uS2V5ZG93bjogb25QYW5lbEtleSxcbiAgICAgICAgfSwga2lkcyk7XG4gICAgICB9O1xuICAgIH0sXG4gIH0pO1xufVxuIiwgIi8qKlxuICogVGhlIHB1cmUgcGFydHMgb2YgdGhlIENoYW5uZWxzIHBhbmVsLCBleHBvcnRlZCBmb3IgdGVzdHM6IHRoZSBzZWFyY2ggbWF0Y2hlciAodGhlIHRlcm1pbmFsJ3MgcnVsZXMpLCB0aGVcbiAqIGNvbG91ciBhbmQgdGludCBoZWxwZXJzLCB0aGUgcmFpbCBzZWxlY3Rpb24gYW5kIHRoZSB1bnJlYWQgY2xlYXJpbmcuIE5vdGhpbmcgaGVyZSB0b3VjaGVzIHRoZSBET00gb3IgVnVlLlxuICovXG5pbXBvcnQgeyBDSEFOTkVMX0NPTE9SUywgdHlwZSBDaGFubmVsQ29sb3IsIHR5cGUgQ2hhbm5lbE1lc3NhZ2UsIHR5cGUgQ2hhbm5lbFZpZXcsIHR5cGUgQ2hhbm5lbHNWaWV3IH0gZnJvbSAnQG11Y2xpZW50L3Nkayc7XG5pbXBvcnQgeyBDT1BZIH0gZnJvbSAnLi9jb3B5LnRzJztcblxuLy8gXHUyNTAwXHUyNTAwIHNlYXJjaDogXHUwM0JDQ2xpZW50J3MgZmVhdHVyZXMvdGVybWluYWwvc2VhcmNoLnRzIG1ha2VNYXRjaGVyLCB2ZXJiYXRpbSBcdTI1MDBcdTI1MDBcblxuZXhwb3J0IHR5cGUgTWF0Y2hlciA9IHsgb2s6IHRydWU7IHRlc3Q6IChzOiBzdHJpbmcpID0+IGJvb2xlYW4gfSB8IHsgb2s6IGZhbHNlOyBlcnJvcjogc3RyaW5nIH0gfCBudWxsO1xuXG4vKiogUGxhaW4gdGV4dCAoY2FzZS1pbnNlbnNpdGl2ZSkgb3IgYC9yZWdleC9mbGFnc2A7IGAvYWJjYCB3aGlsZSB0eXBpbmcgaXMgYSByZWdleCBpbiBwcm9ncmVzcyB3aGVuIGl0IGNvbXBpbGVzLiBOdWxsIGZvciBhbiBlbXB0eSBxdWVyeS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlTWF0Y2hlcihxOiBzdHJpbmcpOiBNYXRjaGVyIHtcbiAgY29uc3QgdCA9IHEudHJpbSgpO1xuICBpZiAoIXQpIHJldHVybiBudWxsO1xuICBjb25zdCBtID0gL15cXC8oLispXFwvKFthLXpdKikkL3MuZXhlYyh0KTtcbiAgaWYgKG0pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKG1bMV0sIG1bMl0ucmVwbGFjZSgvW2d5XS9nLCAnJykpO1xuICAgICAgcmV0dXJuIHsgb2s6IHRydWUsIHRlc3Q6IChzKSA9PiByZS50ZXN0KHMpIH07XG4gICAgfSBjYXRjaCB7IHJldHVybiB7IG9rOiBmYWxzZSwgZXJyb3I6ICdiYWQnIH07IH1cbiAgfVxuICBpZiAodC5zdGFydHNXaXRoKCcvJykgJiYgdC5sZW5ndGggPiAxICYmICF0LmVuZHNXaXRoKCcvJykpIHtcbiAgICB0cnkgeyBjb25zdCByZSA9IG5ldyBSZWdFeHAodC5zbGljZSgxKSwgJ2knKTsgcmV0dXJuIHsgb2s6IHRydWUsIHRlc3Q6IChzKSA9PiByZS50ZXN0KHMpIH07IH0gY2F0Y2ggeyByZXR1cm4geyBvazogZmFsc2UsIGVycm9yOiAnYmFkJyB9OyB9XG4gIH1cbiAgY29uc3QgbmVlZGxlID0gdC50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4geyBvazogdHJ1ZSwgdGVzdDogKHMpID0+IHMudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhuZWVkbGUpIH07XG59XG5cbi8qKiBUaGUgdGV4dCBhIGNoYW5uZWwgc2VhcmNoIG1hdGNoZXMgYWdhaW5zdDogXCJzZW5kZXI6IHRleHRcIi4gKi9cbmV4cG9ydCBjb25zdCBzZWFyY2hUZXh0ID0gKG06IFBpY2s8Q2hhbm5lbE1lc3NhZ2UsICdzZW5kZXInIHwgJ3RleHQnPikgPT4gKG0uc2VuZGVyID8gYCR7bS5zZW5kZXJ9OiAke20udGV4dH1gIDogbS50ZXh0KTtcblxuZXhwb3J0IGludGVyZmFjZSBGb3VuZCB7IGhpdHM6IG51bWJlcltdOyBlcnJvcjogYm9vbGVhbiB9XG4vKiogVGhlIGlkcyBvZiB0aGUgbWVzc2FnZXMgbWF0Y2hpbmcgYHFgLCBpbiBvcmRlcjsgYGVycm9yYCB3aGVuIHRoZSByZWdleCBkb2VzIG5vdCBjb21waWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaE1lc3NhZ2VzKG1zZ3M6IHJlYWRvbmx5IENoYW5uZWxNZXNzYWdlW10sIHE6IHN0cmluZyk6IEZvdW5kIHtcbiAgY29uc3QgbSA9IG1ha2VNYXRjaGVyKHEpO1xuICBpZiAoIW0pIHJldHVybiB7IGhpdHM6IFtdLCBlcnJvcjogZmFsc2UgfTtcbiAgaWYgKCFtLm9rKSByZXR1cm4geyBoaXRzOiBbXSwgZXJyb3I6IHRydWUgfTtcbiAgcmV0dXJuIHsgaGl0czogbXNncy5maWx0ZXIoKHgpID0+IG0udGVzdChzZWFyY2hUZXh0KHgpKSkubWFwKCh4KSA9PiB4LmlkKSwgZXJyb3I6IGZhbHNlIH07XG59XG5cbi8qKiBUaGUgY291bnQgaW4gdGhlIHNlYXJjaCBzdHJpcDogYG4vTmAsIFwibm8gbWF0Y2hcIiwgXCJub3QgYSB2YWxpZCByZWdleFwiLCBvciAnJyBmb3IgYW4gZW1wdHkgcXVlcnkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRUZXh0KGZvdW5kOiBGb3VuZCwgcXVlcnk6IHN0cmluZywgaGl0SWR4OiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAoZm91bmQuZXJyb3IpIHJldHVybiBDT1BZLmJhZFJlZ2V4O1xuICBpZiAoIXF1ZXJ5LnRyaW0oKSkgcmV0dXJuICcnO1xuICByZXR1cm4gZm91bmQuaGl0cy5sZW5ndGggPyBgJHtoaXRJZHggKyAxfS8ke2ZvdW5kLmhpdHMubGVuZ3RofWAgOiBDT1BZLm5vTWF0Y2g7XG59XG5cbi8qKiBNb3ZlIHRoZSBhY3RpdmUgaGl0IGJ5IGBkaXJgLCB3cmFwcGluZzsgdW5jaGFuZ2VkIHdpdGggbm8gaGl0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGVwSW5kZXgoaWR4OiBudW1iZXIsIGRpcjogMSB8IC0xLCBuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoIW4pIHJldHVybiBpZHg7XG4gIHJldHVybiAoaWR4ICsgZGlyICsgbikgJSBuO1xufVxuXG4vKiogVGhlIGFjdGl2ZSBoaXQgaW5kZXggYWZ0ZXIgdGhlIGhpdCBjb3VudCBjaGFuZ2VkIHRvIGBuYCAodGhlIG9yaWdpbmFsJ3Mgc2Vjb25kIHdhdGNoKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcEhpdChpZHg6IG51bWJlciwgbjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBpZHg7XG4gIGlmIChpID49IG4pIGkgPSBuIC0gMTtcbiAgaWYgKGkgPCAwICYmIG4pIGkgPSBuIC0gMTtcbiAgcmV0dXJuIGk7XG59XG5cbi8qKiBUaGUgbWVzc2FnZSBpZCBvZiB0aGUgYWN0aXZlIGhpdCwgb3IgLTEuICovXG5leHBvcnQgY29uc3QgYWN0aXZlSGl0SWQgPSAoZm91bmQ6IEZvdW5kLCBpZHg6IG51bWJlcikgPT4gKGlkeCA+PSAwID8gZm91bmQuaGl0c1tpZHhdID8/IC0xIDogLTEpO1xuXG5leHBvcnQgdHlwZSBTZWFyY2hLZXkgPSAnY2xvc2UnIHwgJ3ByZXYnIHwgJ25leHQnIHwgbnVsbDtcbi8qKiBXaGF0IGEga2V5IGluIHRoZSBzZWFyY2ggaW5wdXQgZG9lczogRXNjIGNsb3NlcywgRW50ZXIgc3RlcHMgYmFjayAob2xkZXIpLCBTaGlmdCtFbnRlciBmb3J3YXJkLCBcdTIxOTEgYmFjaywgXHUyMTkzIGZvcndhcmQuICovXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoS2V5KGU6IHsga2V5OiBzdHJpbmc7IHNoaWZ0S2V5PzogYm9vbGVhbiB9KTogU2VhcmNoS2V5IHtcbiAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgcmV0dXJuICdjbG9zZSc7XG4gIGlmIChlLmtleSA9PT0gJ0VudGVyJykgcmV0dXJuIGUuc2hpZnRLZXkgPyAnbmV4dCcgOiAncHJldic7XG4gIGlmIChlLmtleSA9PT0gJ0Fycm93VXAnKSByZXR1cm4gJ3ByZXYnO1xuICBpZiAoZS5rZXkgPT09ICdBcnJvd0Rvd24nKSByZXR1cm4gJ25leHQnO1xuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqIEN0cmwrRiAoXHUyMzE4RiBvbiBhIE1hYykgd2l0aG91dCBBbHQgb3BlbnMgdGhlIHNlYXJjaCwgb25jZSB0aGUgY2hhbm5lbHMgYXJlIGtub3duLiAqL1xuZXhwb3J0IGNvbnN0IGlzRmluZEtleSA9IChlOiB7IGtleTogc3RyaW5nOyBjdHJsS2V5PzogYm9vbGVhbjsgbWV0YUtleT86IGJvb2xlYW47IGFsdEtleT86IGJvb2xlYW4gfSkgPT5cbiAgISEoZS5jdHJsS2V5IHx8IGUubWV0YUtleSkgJiYgIWUuYWx0S2V5ICYmIGUua2V5LnRvTG93ZXJDYXNlKCkgPT09ICdmJztcblxuLy8gXHUyNTAwXHUyNTAwIGNvbG91cnMgYW5kIHRpbnQgXHUyNTAwXHUyNTAwXG5cbmV4cG9ydCBjb25zdCBpc0NoYW5uZWxDb2xvciA9ICh2OiB1bmtub3duKTogdiBpcyBDaGFubmVsQ29sb3IgPT4gdHlwZW9mIHYgPT09ICdzdHJpbmcnICYmIChDSEFOTkVMX0NPTE9SUyBhcyByZWFkb25seSBzdHJpbmdbXSkuaW5jbHVkZXModik7XG4vKiogVGhlIENTUyB2YWx1ZSBmb3IgYSBjaGFubmVsIGNvbG91ciAoYSB0b2tlbiwgbmV2ZXIgYSBmcmVlIGNvbG91ciksIG9yIG51bGwgZm9yIHRoZSBkZWZhdWx0LiAqL1xuZXhwb3J0IGNvbnN0IGNvbG9yVmFyID0gKGM6IHVua25vd24pOiBzdHJpbmcgfCBudWxsID0+IChpc0NoYW5uZWxDb2xvcihjKSA/IGB2YXIoLS0ke2N9KWAgOiBudWxsKTtcbi8qKiBUaGUgaW5saW5lIHN0eWxlIHRoYXQgdGludHMgYSBjaGlwIG9yIGEgbWVzc2FnZSBsaXN0OiBgLS1jaGFuYCwgb3Igbm90aGluZy4gKi9cbmV4cG9ydCBjb25zdCB0aW50U3R5bGUgPSAoYzogdW5rbm93bik6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPT4geyBjb25zdCB2ID0gY29sb3JWYXIoYyk7IHJldHVybiB2ID8geyAnLS1jaGFuJzogdiB9IDoge307IH07XG4vKiogQSBzd2F0Y2gncyBpbmxpbmUgc3R5bGUuICovXG5leHBvcnQgY29uc3Qgc3dhdGNoU3R5bGUgPSAoYzogQ2hhbm5lbENvbG9yKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9PiAoeyAnLS1zdyc6IGB2YXIoLS0ke2N9KWAgfSk7XG5cbi8vIFx1MjUwMFx1MjUwMCByYWlsIGFuZCBzZWxlY3Rpb24gXHUyNTAwXHUyNTAwXG5cbi8qKiBUaGUgY2hhbm5lbCBhIHBvcHBlZC1vdXQgdmlldyBuYW1lcyAoYHBhcmFtcy5jaGFubmVsYCksIG9yICcnIGZvciB0aGUgZnVsbCBwYW5lbC4gKi9cbmV4cG9ydCBjb25zdCBzb2xvT2YgPSAocGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCB8IG51bGwpOiBzdHJpbmcgPT4gKHR5cGVvZiBwYXJhbXM/LmNoYW5uZWwgPT09ICdzdHJpbmcnID8gcGFyYW1zLmNoYW5uZWwgOiAnJyk7XG5leHBvcnQgY29uc3QgYWN0aXZlS2V5T2YgPSAodjogQ2hhbm5lbHNWaWV3IHwgbnVsbCwgc29sbzogc3RyaW5nKSA9PiBzb2xvIHx8IHY/LmFjdGl2ZSB8fCAnJztcbmV4cG9ydCBjb25zdCBhY3RpdmVPZiA9ICh2OiBDaGFubmVsc1ZpZXcgfCBudWxsLCBzb2xvOiBzdHJpbmcpOiBDaGFubmVsVmlldyB8IG51bGwgPT4ge1xuICBjb25zdCBrID0gYWN0aXZlS2V5T2Yodiwgc29sbyk7XG4gIHJldHVybiB2Py5jaGFubmVscy5maW5kKChjKSA9PiBjLmtleSA9PT0gaykgPz8gbnVsbDtcbn07XG4vKiogVGhlIGNoaXBzOiBldmVyeSBjaGFubmVsLCBvciBpbiBhIHBvcHBlZC1vdXQgdmlldyBvbmx5IGl0cyBvd24uICovXG5leHBvcnQgY29uc3QgcmFpbE9mID0gKHY6IENoYW5uZWxzVmlldyB8IG51bGwsIHNvbG86IHN0cmluZyk6IENoYW5uZWxWaWV3W10gPT4gKCF2ID8gW10gOiBzb2xvID8gdi5jaGFubmVscy5maWx0ZXIoKGMpID0+IGMua2V5ID09PSBzb2xvKSA6IHYuY2hhbm5lbHMpO1xuZXhwb3J0IGNvbnN0IG1lc3NhZ2VzT2YgPSAodjogQ2hhbm5lbHNWaWV3IHwgbnVsbCwgc29sbzogc3RyaW5nKTogQ2hhbm5lbE1lc3NhZ2VbXSA9PiB7XG4gIGNvbnN0IGEgPSBhY3RpdmVPZih2LCBzb2xvKTtcbiAgcmV0dXJuIHYgJiYgYSA/IHYubWVzc2FnZXNbYS5rZXldID8/IFtdIDogW107XG59O1xuXG4vKiogV2hpY2ggYm9keSB0aGUgcGFuZWwgc2hvd3MuICovXG5leHBvcnQgdHlwZSBCb2R5ID0gJ2dvbmUnIHwgJ2F3YWl0aW5nJyB8ICdub25lJyB8ICd2aWV3JztcbmV4cG9ydCBmdW5jdGlvbiBib2R5T2YodjogQ2hhbm5lbHNWaWV3IHwgbnVsbCwgc29sbzogc3RyaW5nKTogQm9keSB7XG4gIGlmIChzb2xvICYmIHY/Lmtub3duICYmICFhY3RpdmVPZih2LCBzb2xvKSkgcmV0dXJuICdnb25lJztcbiAgaWYgKCF2IHx8ICF2Lmtub3duKSByZXR1cm4gJ2F3YWl0aW5nJztcbiAgcmV0dXJuIGFjdGl2ZU9mKHYsIHNvbG8pID8gJ3ZpZXcnIDogJ25vbmUnO1xufVxuXG4vKipcbiAqIFJlYWRpbmcgYSBjaGFubmVsIGNsZWFycyBpdHMgdW5yZWFkIGNvdW50OiB0aGUgcG9wcGVkLW91dCB2aWV3IG1hcmtzIGl0cyBvd24gY2hhbm5lbCByZWFkICh3aXRob3V0XG4gKiBzZWxlY3RpbmcgaXQpLCB0aGUgZnVsbCBwYW5lbCBzZWxlY3RzIHRoZSBhY3RpdmUgb25lLiBOdWxsIHdoZW4gbm90aGluZyBpcyB1bnJlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkQWN0aW9uKHY6IENoYW5uZWxzVmlldyB8IG51bGwsIHNvbG86IHN0cmluZyk6IHsgb3A6ICdtYXJrUmVhZCcgfCAnc2VsZWN0Jzsga2V5OiBzdHJpbmcgfSB8IG51bGwge1xuICBjb25zdCBhID0gYWN0aXZlT2Yodiwgc29sbyk7XG4gIGlmICghYSB8fCAhYS51bnJlYWQpIHJldHVybiBudWxsO1xuICByZXR1cm4geyBvcDogc29sbyA/ICdtYXJrUmVhZCcgOiAnc2VsZWN0Jywga2V5OiBhLmtleSB9O1xufVxuXG4vKiogVGhlIG9wdGlvbnMgYG11LnBhbmVscy5vcGVuYCBnZXRzIHRvIHBvcCBhIGNoYW5uZWwgb3V0LiAqL1xuZXhwb3J0IGNvbnN0IHBvcE91dEFyZ3MgPSAoY2g6IFBpY2s8Q2hhbm5lbFZpZXcsICdrZXknIHwgJ2NhcHRpb24nPiwgc2lkOiBzdHJpbmcpID0+XG4gIFsnY2hhbm5lbCcsIHsgY2hhbm5lbDogY2gua2V5LCBpbnN0YW5jZTogY2gua2V5IH0sIHsgc2lkLCB0aXRsZTogQ09QWS5zb2xvVGl0bGUoY2guY2FwdGlvbikgfV0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBoaG1tID0gKHRzOiBudW1iZXIpID0+IHsgY29uc3QgZCA9IG5ldyBEYXRlKHRzKTsgcmV0dXJuIGAke1N0cmluZyhkLmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsICcwJyl9OiR7U3RyaW5nKGQuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCAnMCcpfWA7IH07XG5cbi8vIFx1MjUwMFx1MjUwMCAxLjEuMDogZ3JvdXBpbmcsIHRoZSBuZXctbWVzc2FnZXMgZGl2aWRlciwgdGhlIGxhdGVzdCBidXR0b24sIHJlcGxpZXMsIHRoZSBiYWRnZSBcdTI1MDBcdTI1MDBcblxuLyoqIE1lc3NhZ2VzIGZyb20gdGhlIHNhbWUgc2VuZGVyIHdpdGhpbiB0aGlzIG1hbnkgbXMgb2YgdGhlIHByZXZpb3VzIG9uZSBhcmUgZ3JvdXBlZCAobm8gdGltZSwgbm8gc2VuZGVyKS4gKi9cbmV4cG9ydCBjb25zdCBHUk9VUF9NUyA9IDUgKiA2MF8wMDA7XG4vKiogVGhlIGlkcyBvZiB0aGUgbWVzc2FnZXMgdGhhdCBjb250aW51ZSB0aGUgcHJldmlvdXMgb25lJ3MgZ3JvdXA6IHNhbWUgc2VuZGVyLCB3aXRoaW4ge0BsaW5rIEdST1VQX01TfS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cGVkSWRzKG1zZ3M6IHJlYWRvbmx5IENoYW5uZWxNZXNzYWdlW10pOiBTZXQ8bnVtYmVyPiB7XG4gIGNvbnN0IG91dCA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IG1zZ3MubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBhID0gbXNnc1tpIC0gMV0sIGIgPSBtc2dzW2ldO1xuICAgIGlmIChiLnNlbmRlciAmJiBhLnNlbmRlciA9PT0gYi5zZW5kZXIgJiYgYi50cyAtIGEudHMgPj0gMCAmJiBiLnRzIC0gYS50cyA8IEdST1VQX01TKSBvdXQuYWRkKGIuaWQpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVGhlIGZpcnN0IHVucmVhZCBtZXNzYWdlIG9mIGEgY2hhbm5lbCB0aGUgcGxheWVyIGlzIHN3aXRjaGluZyB0bzogd2l0aCBgdW5yZWFkYCB1bnJlYWQgbWVzc2FnZXMgYXQgdGhlIGVuZCBvZlxuICogYG1zZ3NgLCB0aGUgaWQgb2YgdGhlIG9sZGVzdCBvZiB0aGVtLCBvciBudWxsIHdoZW4gbm90aGluZyBpcyB1bnJlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXJzdFVucmVhZElkKG1zZ3M6IHJlYWRvbmx5IENoYW5uZWxNZXNzYWdlW10sIHVucmVhZDogbnVtYmVyKTogbnVtYmVyIHwgbnVsbCB7XG4gIGlmICghdW5yZWFkIHx8ICFtc2dzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBtc2dzW01hdGgubWF4KDAsIG1zZ3MubGVuZ3RoIC0gdW5yZWFkKV0uaWQ7XG59XG5cbi8qKiBIb3cgbWFueSBtZXNzYWdlcyBhcmUgbmV3ZXIgdGhhbiBgbGFzdFNlZW5gIChhbiBpZCk7IGFsbCBvZiB0aGVtIHdoZW4gYGxhc3RTZWVuYCBpcyBub3QgaW4gdGhlIGxpc3QuICovXG5leHBvcnQgZnVuY3Rpb24gbmV3ZXJUaGFuKG1zZ3M6IHJlYWRvbmx5IENoYW5uZWxNZXNzYWdlW10sIGxhc3RTZWVuOiBudW1iZXIgfCBudWxsKTogbnVtYmVyIHtcbiAgaWYgKGxhc3RTZWVuID09PSBudWxsKSByZXR1cm4gMDtcbiAgbGV0IG4gPSAwO1xuICBmb3IgKGxldCBpID0gbXNncy5sZW5ndGggLSAxOyBpID49IDAgJiYgbXNnc1tpXS5pZCAhPT0gbGFzdFNlZW47IGktLSkgbisrO1xuICByZXR1cm4gbjtcbn1cblxuLyoqIFdpdGhpbiB0aGlzIG1hbnkgcHggb2YgdGhlIGJvdHRvbSB0aGUgbGlzdCBjb3VudHMgYXMgYXQgdGhlIGJvdHRvbSAoaXQgdGhlbiBmb2xsb3dzIG5ldyBtZXNzYWdlcykuICovXG5leHBvcnQgY29uc3QgQk9UVE9NX1NMQUNLID0gMjQ7XG5leHBvcnQgY29uc3QgYXRCb3R0b20gPSAoZWw6IHsgc2Nyb2xsVG9wOiBudW1iZXI7IHNjcm9sbEhlaWdodDogbnVtYmVyOyBjbGllbnRIZWlnaHQ6IG51bWJlciB9KSA9PiBlbC5zY3JvbGxIZWlnaHQgLSBlbC5zY3JvbGxUb3AgLSBlbC5jbGllbnRIZWlnaHQgPD0gQk9UVE9NX1NMQUNLO1xuXG4vKiogV2hhdCB0aGUgY29tcG9zZXIgc2VuZHMgd2hpbGUgcmVwbHlpbmcgdG8gYHNlbmRlcmA6IGBAc2VuZGVyOiB0ZXh0YCAoVW5kZXJzcGlyZSdzIHJlcGx5IGZvcm0pLiAqL1xuZXhwb3J0IGNvbnN0IHJlcGx5VGV4dCA9IChzZW5kZXI6IHN0cmluZywgdGV4dDogc3RyaW5nKSA9PiAoc2VuZGVyID8gYEAke3NlbmRlcn06ICR7dGV4dH1gIDogdGV4dCk7XG5cbi8qKiBUaGUgQ2hhbm5lbHMgdGFiIGJhZGdlIGZvciBhIHNlc3Npb246IHRoZSB1bnJlYWQgdG90YWwgb2YgaXRzIGNoYW5uZWxzLCBvciBudWxsIHdoZW4gbm90aGluZyBpcyB1bnJlYWQuICovXG5leHBvcnQgZnVuY3Rpb24gYmFkZ2VPZih2OiBDaGFubmVsc1ZpZXcgfCBudWxsKTogeyBjb3VudDogbnVtYmVyIH0gfCBudWxsIHtcbiAgY29uc3QgbiA9ICh2Py5jaGFubmVscyA/PyBbXSkucmVkdWNlKChzLCBjKSA9PiBzICsgKGMubXV0ZWQgPyAwIDogYy51bnJlYWQpLCAwKTtcbiAgcmV0dXJuIG4gPiAwID8geyBjb3VudDogbiB9IDogbnVsbDtcbn1cblxuLyoqIEtleWJvYXJkIG1vdmVtZW50IGluIHRoZSBtZXNzYWdlIGxpc3Q6IFx1MjE5MSBcdTIxOTMgSG9tZSBFbmQgXHUyMTkyIHRoZSBpbmRleCB0byBmb2N1cywgb3IgbnVsbC4gYGN1cmAgLTE6IHRoZSBsaXN0IGl0c2VsZi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlSW5kZXgoa2V5OiBzdHJpbmcsIGN1cjogbnVtYmVyLCBuOiBudW1iZXIpOiBudW1iZXIgfCBudWxsIHtcbiAgaWYgKCFuKSByZXR1cm4gbnVsbDtcbiAgaWYgKGtleSA9PT0gJ0hvbWUnKSByZXR1cm4gMDtcbiAgaWYgKGtleSA9PT0gJ0VuZCcpIHJldHVybiBuIC0gMTtcbiAgaWYgKGtleSA9PT0gJ0Fycm93VXAnKSByZXR1cm4gY3VyIDwgMCA/IG4gLSAxIDogTWF0aC5tYXgoMCwgY3VyIC0gMSk7XG4gIGlmIChrZXkgPT09ICdBcnJvd0Rvd24nKSByZXR1cm4gY3VyIDwgMCA/IG4gLSAxIDogTWF0aC5taW4obiAtIDEsIGN1ciArIDEpO1xuICByZXR1cm4gbnVsbDtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFZQSxTQUFTLHVCQUF1Rjs7O0FDWHpGLElBQU0sT0FBTztBQUFBLEVBQ2xCLE9BQU87QUFBQSxFQUNQLFVBQVU7QUFBQSxFQUNWLE1BQU07QUFBQSxFQUNOLFlBQVk7QUFBQSxFQUNaLFdBQVc7QUFBQSxFQUNYLGFBQWEsQ0FBQyxPQUFlLFdBQVcsRUFBRTtBQUFBLEVBQzFDLFVBQVU7QUFBQSxFQUNWLGVBQWU7QUFBQTtBQUFBLEVBRWYsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBO0FBQUEsRUFFTixRQUFRO0FBQUEsRUFDUixXQUFXO0FBQUEsRUFDWCxRQUFRO0FBQUEsRUFDUixVQUFVO0FBQUEsRUFDVixlQUFlO0FBQUEsRUFDZixXQUFXO0FBQUEsRUFDWCxRQUFRLENBQUMsTUFBYyxHQUFHLENBQUM7QUFBQSxFQUMzQixRQUFRLENBQUMsTUFBYyxHQUFHLENBQUM7QUFBQSxFQUMzQixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxjQUFjO0FBQUEsRUFDZCxRQUFRLEVBQUUsUUFBUSxVQUFVLGlCQUFpQixpQkFBaUIsTUFBTSxRQUFRLE9BQU8sU0FBUyxJQUFJLE1BQU0sSUFBSSxRQUFRLFVBQVUsV0FBVztBQUFBLEVBQ3ZJLFFBQVE7QUFBQSxFQUNSLGFBQWE7QUFBQSxFQUNiLG1CQUFtQjtBQUFBLEVBQ25CLFNBQVM7QUFBQSxFQUNULFVBQVU7QUFBQSxFQUNWLE1BQU07QUFBQSxFQUFZLE1BQU07QUFBQSxFQUFRLE9BQU87QUFBQSxFQUN2QyxXQUFXO0FBQUEsRUFBUSxXQUFXO0FBQUEsRUFBUSxZQUFZO0FBQUEsRUFDbEQsUUFBUTtBQUFBLEVBQ1IsYUFBYSxDQUFDLE9BQWUsV0FBVyxFQUFFO0FBQUEsRUFDMUMsV0FBVyxDQUFDLE9BQWUs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QUUsRUFBRTtBQUFBLE1BQUc7QUFDOUUsWUFBTSxJQUFJLFFBQVEsQ0FBQztBQUNuQixZQUFNLElBQUksSUFBSSxPQUFPLEVBQUUsS0FBSyxJQUFJO0FBQ2hDLFVBQUksTUFBTSxNQUFNO0FBQUUsZUFBTztBQUFHLFdBQUcsT0FBTyxNQUFNLFlBQVksR0FBRyxFQUFFLEVBQUU7QUFBQSxNQUFHO0FBQUEsSUFDcEUsR0FBRyxFQUFFLEVBQUU7QUFBQSxFQUNULENBQUMsQ0FBQztBQUdGLFFBQU0sUUFBUSxDQUFDLE1BQW9GLEVBQUUsU0FBUyxvQkFBb0IsSUFBSTtBQUN0SSxPQUFLLEtBQUssR0FBRyxNQUFNLFFBQVE7QUFBQSxJQUN6QixJQUFJO0FBQUEsSUFBUyxRQUFRO0FBQUEsSUFBbUIsT0FBTztBQUFBLElBQy9DLE9BQU8sQ0FBQyxNQUFNLEtBQUssVUFBVSxNQUFNLENBQUMsR0FBRyxRQUFRLFVBQVUsRUFBRTtBQUFBLElBQzNELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRO0FBQUEsSUFDakMsS0FBSyxDQUFDLE1BQU07QUFBRSxZQUFNLElBQUksTUFBTSxDQUFDO0FBQUcsVUFBSSxFQUFHLFlBQVcsTUFBTSxRQUFTLElBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsTUFBTTtBQUFBLElBQUc7QUFBQSxFQUN6RyxDQUFDLENBQUM7QUFDRixPQUFLLEtBQUssR0FBRyxNQUFNLFFBQVE7QUFBQSxJQUN6QixJQUFJO0FBQUEsSUFBUSxRQUFRO0FBQUEsSUFBbUIsT0FBTztBQUFBLElBQUssT0FBTyxLQUFLO0FBQUEsSUFDL0QsS0FBSyxPQUFPLE1BQU07QUFDaEIsWUFBTSxJQUFJLE1BQU0sQ0FBQztBQUNqQixVQUFJLENBQUMsRUFBRztBQUNSLFlBQU0sT0FBTyxFQUFFLFFBQVEsU0FBUyxHQUFHLEVBQUUsUUFBUSxNQUFNLEtBQUssRUFBRSxRQUFRLElBQUksS0FBSyxFQUFFLFFBQVE7QUFDckYsWUFBTSxXQUFXLFdBQVcsV0FBVyxVQUFVLElBQUk7QUFBQSxJQUN2RDtBQUFBLEVBQ0YsQ0FBQyxDQUFDO0FBQ0YsU0FBTyxNQUFNO0FBQUUsZUFBVyxLQUFLLEtBQUssUUFBUSxFQUFHLEdBQUU7QUFBQSxFQUFHO0FBQ3REO0FBRUEsSUFBTyxnQkFBUSxnQkFBZ0I7QUFBQSxFQUM3QixTQUFTLEtBQUs7QUFBRSxRQUFJLGNBQWMsS0FBSyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQUEsRUFBRztBQUN6RCxDQUFDOyIsCiAgIm5hbWVzIjogWyJDSEFOTkVMX0NPTE9SUyIsICJDSEFOTkVMX0NPTE9SUyJdCn0K

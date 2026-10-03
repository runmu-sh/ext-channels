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
  menuCopy: "Copy message",
  // ── 1.2.0: settings, context kinds, the focus command ──
  cfgLabel: "Channel settings",
  cfgHint: "Mute, alerts and colour per channel, for this world. Set them from the panel.",
  replyFormat: "Reply format",
  replyFormatHint: "{channel} and {text} are replaced",
  alertsSetting: "Channel alerts",
  alertsSettingHint: "A channel message that alerts (by its channel setting) raises a mention: badge, toast, sound and desktop notification per Settings \u2192 Alerts.",
  kindMessage: "Channel message",
  kindChannel: "Channel",
  focusCommand: "Go to channels"
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
var ALERTS = ["all", "mentions", "none"];
function normConfig(raw) {
  const out = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    if (!v || typeof v !== "object") continue;
    const c = v;
    const e = {};
    if (c.muted === true) e.muted = true;
    if (ALERTS.includes(c.alert)) e.alert = c.alert;
    if (isChannelColor(c.color)) e.color = c.color;
    if (Object.keys(e).length) out[k] = e;
  }
  return out;
}
function patchConfig(config, key, patch) {
  const all = { ...normConfig(config) };
  const next = { ...all[key] };
  if (patch.muted !== void 0) {
    if (patch.muted) next.muted = true;
    else delete next.muted;
  }
  if (patch.alert !== void 0 && ALERTS.includes(patch.alert)) next.alert = patch.alert;
  if (patch.color !== void 0) {
    if (isChannelColor(patch.color)) next.color = patch.color;
    else if (patch.color === null) delete next.color;
  }
  if (Object.keys(next).length) all[key] = next;
  else delete all[key];
  return all;
}
function withConfig(v, config) {
  if (!v) return null;
  return {
    known: v.known,
    active: v.active,
    messages: v.messages,
    channels: v.channels.map((c) => {
      const cfg = config[c.key] ?? {};
      const muted = !!cfg.muted;
      return {
        key: c.key,
        name: c.name,
        caption: c.caption,
        command: c.command,
        online: c.online,
        ...c.topic !== void 0 ? { topic: c.topic } : {},
        unread: muted ? 0 : c.unread,
        mention: muted ? false : c.mention,
        hostUnread: c.unread,
        muted,
        alert: cfg.alert ?? "mentions",
        color: cfg.color ?? null
      };
    })
  };
}
function alertFor(e, config, alertsOn) {
  if (!alertsOn || e.read) return false;
  const cfg = config[e.channel] ?? {};
  if (cfg.muted) return false;
  const a = cfg.alert ?? "mentions";
  return a === "all" || a === "mentions" && !!e.message.mention;
}
function mentionOf(e) {
  return { sid: e.sid, title: `${e.message.sender} \xB7 ${e.caption}`, body: e.message.text, ...e.seq ? { key: `channel:${e.channel}:${e.seq}` } : {} };
}
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
  if (!a || !a.hostUnread) return null;
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

// src/settings.ts
var SETTING = { config: "config", replyFormat: "replyFormat", alerts: "alerts" };
var DEFAULT_REPLY_FORMAT = "{channel} {text}";
var SETTINGS = {
  title: COPY.title,
  items: [
    { key: SETTING.config, label: COPY.cfgLabel, kind: "json", default: {}, scope: "world", hint: COPY.cfgHint, migrateFrom: "channels.config" },
    { key: SETTING.replyFormat, label: COPY.replyFormat, kind: "text", default: DEFAULT_REPLY_FORMAT, scope: "both", hint: COPY.replyFormatHint, migrateFrom: "channels.replyFormat" },
    { key: SETTING.alerts, label: COPY.alertsSetting, kind: "toggle", default: true, scope: "both", hint: COPY.alertsSettingHint, migrateFrom: "alerts.channels" }
  ],
  sections: [{ page: "alerts", title: COPY.title, keys: [SETTING.alerts] }]
};
var KIND_MESSAGE = "channels.message";
var KIND_CHANNEL = "channels.channel";
var MESSAGE_SCHEMA = {
  type: "object",
  required: ["id", "ts", "sender", "text", "mention"],
  properties: { id: { type: "number" }, ts: { type: "number" }, sender: { type: "string" }, text: { type: "string" }, mention: { type: "boolean" }, reactions: { type: "object" } }
};
var KINDS = [
  { id: KIND_MESSAGE, title: COPY.kindMessage, schema: { type: "object", required: ["key", "message"], properties: { key: { type: "string" }, message: MESSAGE_SCHEMA } } },
  { id: KIND_CHANNEL, title: COPY.kindChannel, schema: { type: "object", required: ["key"], properties: { key: { type: "string" } } } }
];

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
      const hostView = shallowRef(null);
      const config = shallowRef({});
      watch(() => props.sid, (sid, _old, onCleanup) => {
        hostView.value = null;
        config.value = {};
        if (!sid) return;
        const offs = [
          mu.channels.watch((v) => {
            hostView.value = v;
          }, sid),
          mu.settings.watch(SETTING.config, (v) => {
            config.value = normConfig(v);
          }, { sid })
        ];
        onCleanup(() => {
          for (const o of offs) o();
        });
      }, { immediate: true });
      const st = computed(() => withConfig(hostView.value, config.value));
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
        const a = active.value, sid = props.sid;
        if (!sid || !a) return;
        const worldId = props.worldId || mu.sessions.list().find((x) => x.id === sid)?.worldId;
        if (!worldId) return;
        mu.settings.set(SETTING.config, patchConfig(config.value, a.key, patch), worldId);
        if (patch.muted === false && a.hostUnread) mu.channels.markRead(a.key, sid);
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
        rowTargets.set(m.id, { el, off: mu.menus.target(el, { kind: KIND_MESSAGE, sid: props.sid, data: { key: activeKey.value, message: m } }) });
      }
      const chipTargets = /* @__PURE__ */ new Map();
      function markChip(el, key) {
        if (!(el instanceof HTMLElement) || !props.sid) return;
        const had = chipTargets.get(key);
        if (had?.el === el) return;
        had?.off();
        const offs = [];
        if (typeof mu.menus?.target === "function") offs.push(mu.menus.target(el, { kind: KIND_CHANNEL, sid: props.sid, data: { key } }));
        const onCtx = (e) => {
          if (e.defaultPrevented) return;
          e.preventDefault();
          cfgFor(key);
        };
        el.addEventListener("contextmenu", onCtx);
        offs.push(() => el.removeEventListener("contextmenu", onCtx));
        chipTargets.set(key, { el, off: () => {
          for (const o of offs) o();
        } });
      }
      watch(() => rail.value.map((c2) => c2.key).join(","), () => {
        const live = new Set(rail.value.map((c2) => c2.key));
        for (const [k, r] of chipTargets) if (!live.has(k) || !r.el.isConnected) {
          r.off();
          chipTargets.delete(k);
        }
      }, { flush: "post" });
      onBeforeUnmount(() => {
        for (const r of chipTargets.values()) r.off();
        chipTargets.clear();
      });
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
        const format = mu.settings.get(SETTING.replyFormat, { sid: props.sid });
        await mu.channels.send(t, activeKey.value, props.sid, typeof format === "string" && format.trim() ? { format } : void 0);
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
        ref: ((el) => markChip(el, ch.key))
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
var FOCUS_COMMAND = "focus.channels";
function setup(mu) {
  const offs = [];
  offs.push(mu.settings.define(SETTINGS));
  for (const k of KINDS) offs.push(mu.menus.kind(k));
  offs.push(mu.ui.style(CHANNELS_CSS));
  const replies = /* @__PURE__ */ new Set();
  const mount = mu.panels.vue(createChannelsPanel(mu, replies));
  offs.push(mu.panels.register({ id: "channels", title: COPY.title, singleton: true, defaultPosition: "right-bottom", order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft }));
  offs.push(mu.panels.register({ id: "channel", title: COPY.title, singleton: false, defaultPosition: "right-bottom", inViewsMenu: false, order: 21, mount }));
  offs.push(mu.sessions.each((s) => {
    let touched = false, last = "";
    let host = null, config = {};
    const update = () => {
      if (!host) return;
      if (host.known && !touched) {
        touched = true;
        mu.panels.touch("channels", s.id);
      }
      const b2 = badgeOf(withConfig(host, config));
      const k = b2 ? String(b2.count) : "";
      if (k !== last) {
        last = k;
        mu.panels.badge("channels", b2, s.id);
      }
    };
    const a = mu.settings.watch(SETTING.config, (v) => {
      config = normConfig(v);
      update();
    }, { sid: s.id });
    const b = mu.channels.watch((v) => {
      host = v;
      update();
    }, s.id);
    return () => {
      a();
      b();
    };
  }));
  offs.push(mu.channels.onMessage((e) => {
    const config = normConfig(mu.settings.get(SETTING.config, { sid: e.sid }));
    const on = mu.settings.get(SETTING.alerts, { sid: e.sid }) !== false;
    if (alertFor(e, config, on)) void mu.notify.mention(mentionOf(e));
  }, { ownsSettings: true }));
  offs.push(mu.menus.context({
    id: "reply",
    target: KIND_MESSAGE,
    order: 100,
    title: (t) => COPY.menuReply(t.data.message.sender),
    when: (t) => !!t.data?.message?.sender,
    run: (t) => {
      if (t.sid) for (const fn of replies) fn(t.sid, t.data.key, t.data.message.sender);
    }
  }));
  offs.push(mu.menus.context({
    id: "copy",
    target: KIND_MESSAGE,
    order: 110,
    title: COPY.menuCopy,
    run: async (t) => {
      const m = t.data.message;
      await globalThis.navigator?.clipboard?.writeText(m.sender ? `${m.sender}: ${m.text}` : m.text);
    }
  }));
  offs.push(mu.commands.register({
    id: FOCUS_COMMAND,
    title: COPY.focusCommand,
    keys: ["Alt+C"],
    group: "Focus",
    when: "session",
    run: () => {
      if (!mu.panels.focus("channels")) mu.panels.focus("channel");
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
  DEFAULT_REPLY_FORMAT,
  FOCUS_COMMAND,
  KINDS,
  KIND_CHANNEL,
  KIND_MESSAGE,
  SETTING,
  SETTINGS,
  index_default as default,
  setup
};

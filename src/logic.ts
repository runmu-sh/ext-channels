/**
 * The pure parts of the Channels panel, exported for tests: the search matcher (the terminal's rules), the
 * colour and tint helpers, the per-channel settings, the rail selection and the unread clearing. Nothing here
 * touches the DOM or Vue.
 */
import { CHANNEL_COLORS, type ChannelColor, type ChannelMessage, type ChannelMessageEvent, type ChannelsView } from '@muclient/sdk';
import { COPY } from './copy.ts';

// ── 1.2.0: the per-channel settings are this extension's own `config` setting ──

export type Alert = 'all' | 'mentions' | 'none';
export const ALERTS: readonly Alert[] = ['all', 'mentions', 'none'];
/** One channel's settings, as the `config` setting stores them (the shape of the core pref `channels.config` it migrates from). */
export interface ChanCfg { muted?: boolean; alert?: Alert; color?: ChannelColor }
/** Channel key → its settings, for one world. */
export type ChanConfig = Record<string, ChanCfg>;

/** A channel as the panel shows it: the host's channel with mute, alert and colour from the extension's `config`. */
export interface ChannelRow {
  key: string; name: string; caption: string; command: string; online: number | null; unread: number; mention: boolean; topic?: string;
  muted: boolean; alert: Alert; color: ChannelColor | null;
  /** The host's unread count, muted or not: reading the channel clears it. */
  hostUnread: number;
}
/** A session's channels with {@link ChannelRow}s. */
export interface ShownView { known: boolean; active: string; channels: ChannelRow[]; messages: ChannelsView['messages'] }

/** The stored `config` value, cleaned: unknown keys, alerts and colours are dropped. */
export function normConfig(raw: unknown): ChanConfig {
  const out: ChanConfig = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const c = v as Record<string, unknown>;
    const e: ChanCfg = {};
    if (c.muted === true) e.muted = true;
    if ((ALERTS as readonly unknown[]).includes(c.alert)) e.alert = c.alert as Alert;
    if (isChannelColor(c.color)) e.color = c.color;
    if (Object.keys(e).length) out[k] = e;
  }
  return out;
}

/** `config` with `patch` applied to channel `key`. `color: null` and `muted: false` remove the field; an empty entry is removed. */
export function patchConfig(config: ChanConfig, key: string, patch: { muted?: boolean; alert?: Alert; color?: ChannelColor | null }): ChanConfig {
  const all = { ...normConfig(config) };
  const next: ChanCfg = { ...all[key] };
  if (patch.muted !== undefined) { if (patch.muted) next.muted = true; else delete next.muted; }
  if (patch.alert !== undefined && (ALERTS as readonly string[]).includes(patch.alert)) next.alert = patch.alert;
  if (patch.color !== undefined) { if (isChannelColor(patch.color)) next.color = patch.color; else if (patch.color === null) delete next.color; }
  if (Object.keys(next).length) all[key] = next; else delete all[key];
  return all;
}

/**
 * The host's channels with the extension's settings. The host counts unread on muted channels too (the extension
 * owns the settings); a muted channel shows no unread count and no mention.
 */
export function withConfig(v: ChannelsView | null, config: ChanConfig): ShownView | null {
  if (!v) return null;
  return {
    known: v.known, active: v.active, messages: v.messages,
    channels: v.channels.map((c) => {
      const cfg = config[c.key] ?? {};
      const muted = !!cfg.muted;
      return {
        key: c.key, name: c.name, caption: c.caption, command: c.command, online: c.online, ...(c.topic !== undefined ? { topic: c.topic } : {}),
        unread: muted ? 0 : c.unread, mention: muted ? false : c.mention, hostUnread: c.unread, muted, alert: cfg.alert ?? 'mentions', color: cfg.color ?? null,
      };
    }),
  };
}

/**
 * Whether a stored message raises a channel alert: the `alerts` setting is on, it was not read on another device,
 * the channel is not muted, and its alert setting is "every message", or "mentions only" (the default) and it
 * names the character.
 */
export function alertFor(e: Pick<ChannelMessageEvent, 'channel' | 'read' | 'message'>, config: ChanConfig, alertsOn: boolean): boolean {
  if (!alertsOn || e.read) return false;
  const cfg = config[e.channel] ?? {};
  if (cfg.muted) return false;
  const a = cfg.alert ?? 'mentions';
  return a === 'all' || (a === 'mentions' && !!e.message.mention);
}

/** What `mu.notify.mention` gets for a message: title "sender · caption", the text, and a key when the game sent a seq (one alert across the player's clients). */
export function mentionOf(e: ChannelMessageEvent): { sid: string; title: string; body: string; key?: string } {
  return { sid: e.sid, title: `${e.message.sender} · ${e.caption}`, body: e.message.text, ...(e.seq ? { key: `channel:${e.channel}:${e.seq}` } : {}) };
}

// ── search: μClient's features/terminal/search.ts makeMatcher, verbatim ──

export type Matcher = { ok: true; test: (s: string) => boolean } | { ok: false; error: string } | null;

/** Plain text (case-insensitive) or `/regex/flags`; `/abc` while typing is a regex in progress when it compiles. Null for an empty query. */
export function makeMatcher(q: string): Matcher {
  const t = q.trim();
  if (!t) return null;
  const m = /^\/(.+)\/([a-z]*)$/s.exec(t);
  if (m) {
    try {
      const re = new RegExp(m[1], m[2].replace(/[gy]/g, ''));
      return { ok: true, test: (s) => re.test(s) };
    } catch { return { ok: false, error: 'bad' }; }
  }
  if (t.startsWith('/') && t.length > 1 && !t.endsWith('/')) {
    try { const re = new RegExp(t.slice(1), 'i'); return { ok: true, test: (s) => re.test(s) }; } catch { return { ok: false, error: 'bad' }; }
  }
  const needle = t.toLowerCase();
  return { ok: true, test: (s) => s.toLowerCase().includes(needle) };
}

/** The text a channel search matches against: "sender: text". */
export const searchText = (m: Pick<ChannelMessage, 'sender' | 'text'>) => (m.sender ? `${m.sender}: ${m.text}` : m.text);

export interface Found { hits: number[]; error: boolean }
/** The ids of the messages matching `q`, in order; `error` when the regex does not compile. */
export function searchMessages(msgs: readonly ChannelMessage[], q: string): Found {
  const m = makeMatcher(q);
  if (!m) return { hits: [], error: false };
  if (!m.ok) return { hits: [], error: true };
  return { hits: msgs.filter((x) => m.test(searchText(x))).map((x) => x.id), error: false };
}

/** The count in the search strip: `n/N`, "no match", "not a valid regex", or '' for an empty query. */
export function countText(found: Found, query: string, hitIdx: number): string {
  if (found.error) return COPY.badRegex;
  if (!query.trim()) return '';
  return found.hits.length ? `${hitIdx + 1}/${found.hits.length}` : COPY.noMatch;
}

/** Move the active hit by `dir`, wrapping; unchanged with no hits. */
export function stepIndex(idx: number, dir: 1 | -1, n: number): number {
  if (!n) return idx;
  return (idx + dir + n) % n;
}

/** The active hit index after the hit count changed to `n` (the original's second watch). */
export function clampHit(idx: number, n: number): number {
  let i = idx;
  if (i >= n) i = n - 1;
  if (i < 0 && n) i = n - 1;
  return i;
}

/** The message id of the active hit, or -1. */
export const activeHitId = (found: Found, idx: number) => (idx >= 0 ? found.hits[idx] ?? -1 : -1);

export type SearchKey = 'close' | 'prev' | 'next' | null;
/** What a key in the search input does: Esc closes, Enter steps back (older), Shift+Enter forward, ↑ back, ↓ forward. */
export function searchKey(e: { key: string; shiftKey?: boolean }): SearchKey {
  if (e.key === 'Escape') return 'close';
  if (e.key === 'Enter') return e.shiftKey ? 'next' : 'prev';
  if (e.key === 'ArrowUp') return 'prev';
  if (e.key === 'ArrowDown') return 'next';
  return null;
}

/** Ctrl+F (⌘F on a Mac) without Alt opens the search, once the channels are known. */
export const isFindKey = (e: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }) =>
  !!(e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'f';

// ── colours and tint ──

export const isChannelColor = (v: unknown): v is ChannelColor => typeof v === 'string' && (CHANNEL_COLORS as readonly string[]).includes(v);
/** The CSS value for a channel colour (a token, never a free colour), or null for the default. */
export const colorVar = (c: unknown): string | null => (isChannelColor(c) ? `var(--${c})` : null);
/** The inline style that tints a chip or a message list: `--chan`, or nothing. */
export const tintStyle = (c: unknown): Record<string, string> => { const v = colorVar(c); return v ? { '--chan': v } : {}; };
/** A swatch's inline style. */
export const swatchStyle = (c: ChannelColor): Record<string, string> => ({ '--sw': `var(--${c})` });

// ── rail and selection ──

/** The channel a popped-out view names (`params.channel`), or '' for the full panel. */
export const soloOf = (params: Record<string, unknown> | undefined | null): string => (typeof params?.channel === 'string' ? params.channel : '');
export const activeKeyOf = (v: ShownView | null, solo: string) => solo || v?.active || '';
export const activeOf = (v: ShownView | null, solo: string): ChannelRow | null => {
  const k = activeKeyOf(v, solo);
  return v?.channels.find((c) => c.key === k) ?? null;
};
/** The chips: every channel, or in a popped-out view only its own. */
export const railOf = (v: ShownView | null, solo: string): ChannelRow[] => (!v ? [] : solo ? v.channels.filter((c) => c.key === solo) : v.channels);
export const messagesOf = (v: ShownView | null, solo: string): ChannelMessage[] => {
  const a = activeOf(v, solo);
  return v && a ? v.messages[a.key] ?? [] : [];
};

/** Which body the panel shows. */
export type Body = 'gone' | 'awaiting' | 'none' | 'view';
export function bodyOf(v: ShownView | null, solo: string): Body {
  if (solo && v?.known && !activeOf(v, solo)) return 'gone';
  if (!v || !v.known) return 'awaiting';
  return activeOf(v, solo) ? 'view' : 'none';
}

/**
 * Reading a channel clears its unread count: the popped-out view marks its own channel read (without
 * selecting it), the full panel selects the active one. Null when nothing is unread.
 */
export function readAction(v: ShownView | null, solo: string): { op: 'markRead' | 'select'; key: string } | null {
  const a = activeOf(v, solo);
  if (!a || !a.hostUnread) return null;
  return { op: solo ? 'markRead' : 'select', key: a.key };
}

/** The options `mu.panels.open` gets to pop a channel out. */
export const popOutArgs = (ch: Pick<ChannelRow, 'key' | 'caption'>, sid: string) =>
  ['channel', { channel: ch.key, instance: ch.key }, { sid, title: COPY.soloTitle(ch.caption) }] as const;

export const hhmm = (ts: number) => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

// ── 1.1.0: grouping, the new-messages divider, the latest button, replies, the badge ──

/** Messages from the same sender within this many ms of the previous one are grouped (no time, no sender). */
export const GROUP_MS = 5 * 60_000;
/** The ids of the messages that continue the previous one's group: same sender, within {@link GROUP_MS}. */
export function groupedIds(msgs: readonly ChannelMessage[]): Set<number> {
  const out = new Set<number>();
  for (let i = 1; i < msgs.length; i++) {
    const a = msgs[i - 1], b = msgs[i];
    if (b.sender && a.sender === b.sender && b.ts - a.ts >= 0 && b.ts - a.ts < GROUP_MS) out.add(b.id);
  }
  return out;
}

/**
 * The first unread message of a channel the player is switching to: with `unread` unread messages at the end of
 * `msgs`, the id of the oldest of them, or null when nothing is unread.
 */
export function firstUnreadId(msgs: readonly ChannelMessage[], unread: number): number | null {
  if (!unread || !msgs.length) return null;
  return msgs[Math.max(0, msgs.length - unread)].id;
}

/** How many messages are newer than `lastSeen` (an id); all of them when `lastSeen` is not in the list. */
export function newerThan(msgs: readonly ChannelMessage[], lastSeen: number | null): number {
  if (lastSeen === null) return 0;
  let n = 0;
  for (let i = msgs.length - 1; i >= 0 && msgs[i].id !== lastSeen; i--) n++;
  return n;
}

/** Within this many px of the bottom the list counts as at the bottom (it then follows new messages). */
export const BOTTOM_SLACK = 24;
export const atBottom = (el: { scrollTop: number; scrollHeight: number; clientHeight: number }) => el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;

/** What the composer sends while replying to `sender`: `@sender: text` (Underspire's reply form). */
export const replyText = (sender: string, text: string) => (sender ? `@${sender}: ${text}` : text);

/** The Channels tab badge for a session: the unread total of its unmuted channels, or null when nothing is unread. */
export function badgeOf(v: ShownView | null): { count: number } | null {
  const n = (v?.channels ?? []).reduce((s, c) => s + (c.muted ? 0 : c.unread), 0);
  return n > 0 ? { count: n } : null;
}

/** Keyboard movement in the message list: ↑ ↓ Home End → the index to focus, or null. `cur` -1: the list itself. */
export function moveIndex(key: string, cur: number, n: number): number | null {
  if (!n) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return n - 1;
  if (key === 'ArrowUp') return cur < 0 ? n - 1 : Math.max(0, cur - 1);
  if (key === 'ArrowDown') return cur < 0 ? n - 1 : Math.min(n - 1, cur + 1);
  return null;
}

/**
 * Channels (@runmu.sh/ext-channels): the Channels panel (R-CHAN, U-CHAN-VIEW, U-CHAN-CFG, U-CHAN-POP), moved out
 * of the μClient core onto the SDK. The host tracks every session's channels (GMCP Comm.Channel.List / Text /
 * Players through its bundled adapter, mentions, unread counts and read markers); this extension draws them
 * through `mu.channels.watch` and acts on them through `select`, `markRead` and `send`.
 *
 * Since 1.2.0 (SDK 1.14) the extension owns the channel settings: per-channel mute, alert and colour (`config`),
 * the reply format and the Channel alerts toggle are its own settings (src/settings.ts), and it registers
 * `mu.channels.onMessage(fn, { ownsSettings: true })`, so the host stops applying its legacy prefs and the
 * extension raises channel alerts itself with `mu.notify.mention`.
 *
 * Two panels: `channels` (the rail and the selected channel) and `channel` (one channel popped out,
 * `params.channel`, instance = its key). `channels` is always offered (it is opened before
 * the game sends its channels, and then says so); it is auto-added once when a session's channels are first
 * known (`mu.panels.touch`), and its dock tab carries the session's unread total (`mu.panels.badge`).
 */
import { defineExtension, type ChannelMessageEvent, type Dispose, type Mu } from '@muclient/sdk';
import { COPY } from './copy.ts';
import { CHANNELS_CSS } from './style.ts';
import { createChannelsPanel, restoreDraft, snapshotDraft, type ReplyBus } from './panel.ts';
import { alertFor, badgeOf, mentionOf, normConfig, withConfig, type ChanConfig } from './logic.ts';
import { KIND_MESSAGE, KINDS, SETTING, SETTINGS } from './settings.ts';

export { COPY } from './copy.ts';
export { CHANNELS_CSS } from './style.ts';
export { SETTINGS, SETTING, KINDS, KIND_MESSAGE, KIND_CHANNEL, DEFAULT_REPLY_FORMAT } from './settings.ts';
export type { CommChannelList, CommChannelText, CommChannelPlayers } from './types.ts';

/** The `focus.channels` command (Alt+C): the open Channels panel, else an open pop-out. */
export const FOCUS_COMMAND = 'focus.channels';

/** Register the settings, stylesheet, both panels, the per-session badge and auto-add, the alerts, the menu kinds and entries, and the focus command. Exported for tests. */
export function setup(mu: Mu): Dispose {
  const offs: Dispose[] = [];
  offs.push(mu.settings.define(SETTINGS));
  for (const k of KINDS) offs.push(mu.menus.kind(k));
  offs.push(mu.ui.style(CHANNELS_CSS));
  // The message menu's "Reply to X" reaches the panel showing that channel.
  const replies: ReplyBus = new Set();
  const mount = mu.panels.vue(createChannelsPanel(mu, replies));
  offs.push(mu.panels.register({ id: 'channels', title: COPY.title, singleton: true, defaultPosition: 'right-bottom', order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft }));
  // U-CHAN-POP: one channel as its own panel; `params.channel` names it, `channel:<key>` is the instance id.
  offs.push(mu.panels.register({ id: 'channel', title: COPY.title, singleton: false, defaultPosition: 'right-bottom', inViewsMenu: false, order: 21, mount }));

  // Per session: the first known channel list offers (and auto-adds) the panel; the unread total of the
  // unmuted channels is the tab badge.
  offs.push(mu.sessions.each((s) => {
    let touched = false, last = '';
    let host: Parameters<typeof withConfig>[0] = null, config: ChanConfig = {};
    const update = () => {
      if (!host) return;
      if (host.known && !touched) { touched = true; mu.panels.touch('channels', s.id); }
      const b = badgeOf(withConfig(host, config));
      const k = b ? String(b.count) : '';
      if (k !== last) { last = k; mu.panels.badge('channels', b, s.id); }
    };
    const a = mu.settings.watch<unknown>(SETTING.config, (v) => { config = normConfig(v); update(); }, { sid: s.id });
    const b = mu.channels.watch((v) => { host = v; update(); }, s.id);
    return () => { a(); b(); };
  }));

  // The channel alerts: the host raises none while this listener owns the settings.
  offs.push(mu.channels.onMessage((e: ChannelMessageEvent) => {
    const config = normConfig(mu.settings.get(SETTING.config, { sid: e.sid }));
    const on = mu.settings.get<boolean>(SETTING.alerts, { sid: e.sid }) !== false;
    if (alertFor(e, config, on)) void mu.notify.mention(mentionOf(e));
  }, { ownsSettings: true }));

  // Right-click (or long-press) on a message: reply to its sender, copy it.
  offs.push(mu.menus.context({
    id: 'reply', target: KIND_MESSAGE, order: 100,
    title: (t) => COPY.menuReply(t.data.message.sender),
    when: (t) => !!t.data?.message?.sender,
    run: (t) => { if (t.sid) for (const fn of replies) fn(t.sid, t.data.key, t.data.message.sender); },
  }));
  offs.push(mu.menus.context({
    id: 'copy', target: KIND_MESSAGE, order: 110, title: COPY.menuCopy,
    run: async (t) => {
      const m = t.data.message;
      await globalThis.navigator?.clipboard?.writeText(m.sender ? `${m.sender}: ${m.text}` : m.text);
    },
  }));

  // Alt+C (the core bound it until SDK 1.14): the Channels panel, else a popped-out channel. Opens nothing.
  offs.push(mu.commands.register({
    id: FOCUS_COMMAND, title: COPY.focusCommand, keys: ['Alt+C'], group: 'Focus', when: 'session',
    run: () => { if (!mu.panels.focus('channels')) mu.panels.focus('channel'); },
  }));
  return () => { for (const o of offs.reverse()) o(); };
}

export default defineExtension({
  activate(ctx) { ctx.subscriptions.push(setup(ctx.mu)); },
});

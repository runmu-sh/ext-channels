/**
 * Channels (@runmu.sh/ext-channels): the Channels panel (R-CHAN, U-CHAN-VIEW, U-CHAN-CFG, U-CHAN-POP), moved out
 * of the μClient core onto the SDK. The host still tracks every session's channels (GMCP Comm.Channel.List /
 * Text / Players through its bundled adapter, mentions, alerts, the per-world channel settings and reply
 * format); this extension only draws them, through `mu.channels.watch`, and acts on them through `select`,
 * `markRead`, `send` and `configure`.
 *
 * Two panels: `channels` (the rail and the selected channel) and `channel` (one channel popped out,
 * `params.channel`, instance = its key). `channels` is always offered (it is opened before
 * the game sends its channels, and then says so); it is auto-added once when a session's channels are first
 * known (`mu.panels.touch`), and its dock tab carries the session's unread total (`mu.panels.badge`).
 */
import { defineExtension, type ChannelMessage, type ContextTarget, type Dispose, type Mu } from '@muclient/sdk';
import { COPY } from './copy.ts';
import { CHANNELS_CSS } from './style.ts';
import { createChannelsPanel, restoreDraft, snapshotDraft, type ReplyBus } from './panel.ts';
import { badgeOf } from './logic.ts';

export { COPY } from './copy.ts';
export { CHANNELS_CSS } from './style.ts';
export type { CommChannelList, CommChannelText, CommChannelPlayers } from './types.ts';

/** Register the stylesheet, both panels, the per-session badge and auto-add, and the message menu. Exported for tests. */
export function setup(mu: Mu): Dispose {
  const offs: Dispose[] = [];
  offs.push(mu.ui.style(CHANNELS_CSS));
  // The message menu's "Reply to X" reaches the panel showing that channel.
  const replies: ReplyBus = new Set();
  const mount = mu.panels.vue(createChannelsPanel(mu, replies));
  offs.push(mu.panels.register({ id: 'channels', title: COPY.title, singleton: true, defaultPosition: 'right-bottom', order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft }));
  // U-CHAN-POP: one channel as its own panel; `params.channel` names it, `channel:<key>` is the instance id.
  offs.push(mu.panels.register({ id: 'channel', title: COPY.title, singleton: false, defaultPosition: 'right-bottom', inViewsMenu: false, order: 21, mount }));

  // Per session: the first known channel list offers (and auto-adds) the panel; the unread total is the tab badge.
  offs.push(mu.sessions.each((s) => {
    let touched = false, last = '';
    return mu.channels.watch((v) => {
      if (v.known && !touched) { touched = true; mu.panels.touch('channels', s.id); }
      const b = badgeOf(v);
      const k = b ? String(b.count) : '';
      if (k !== last) { last = k; mu.panels.badge('channels', b, s.id); }
    }, s.id);
  }));

  // Right-click (or long-press) on a message: reply to its sender, copy it.
  const msgOf = (t: ContextTarget): { sid: string; key: string; message: ChannelMessage } | null => (t.kind === 'channel-message' ? t : null);
  offs.push(mu.menus.context({
    id: 'reply', target: 'channel-message', order: 100,
    title: (t) => COPY.menuReply(msgOf(t)?.message.sender ?? ''),
    when: (t) => !!msgOf(t)?.message.sender,
    run: (t) => { const m = msgOf(t); if (m) for (const fn of replies) fn(m.sid, m.key, m.message.sender); },
  }));
  offs.push(mu.menus.context({
    id: 'copy', target: 'channel-message', order: 110, title: COPY.menuCopy,
    run: async (t) => {
      const m = msgOf(t);
      if (!m) return;
      const text = m.message.sender ? `${m.message.sender}: ${m.message.text}` : m.message.text;
      await globalThis.navigator?.clipboard?.writeText(text);
    },
  }));
  return () => { for (const o of offs.reverse()) o(); };
}

export default defineExtension({
  activate(ctx) { ctx.subscriptions.push(setup(ctx.mu)); },
});

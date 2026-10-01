/**
 * Channels (@runmu.sh/ext-channels): the Channels panel (R-CHAN, U-CHAN-VIEW, U-CHAN-CFG, U-CHAN-POP), moved out
 * of the μClient core onto the SDK. The host still tracks every session's channels (GMCP Comm.Channel.List /
 * Text / Players, mentions, alerts, the per-world channel settings and reply format); this extension only draws
 * them, through `mu.channels.watch`, and acts on them through `select`, `markRead`, `send` and `configure`.
 *
 * Two panels: `channels` (the rail and the selected channel) and `channel` (one channel popped out,
 * `params.channel`, instance = its key). The first Comm.Channel package of a session adds `channels`.
 */
import { defineExtension, type Mu } from '@muclient/sdk';
import { COPY } from './copy.ts';
import { CHANNELS_CSS } from './style.ts';
import { createChannelsPanel, restoreDraft, snapshotDraft } from './panel.ts';

export { COPY } from './copy.ts';
export { CHANNELS_CSS } from './style.ts';

/** Register the stylesheet, both panels and the auto-add on `mu`. Exported for tests (a fake mu). */
export function setup(mu: Mu): void {
  mu.ui.style(CHANNELS_CSS);
  const mount = mu.panels.vue(createChannelsPanel(mu));
  mu.panels.register({ id: 'channels', title: COPY.title, singleton: true, defaultPosition: 'right-bottom', order: 20, mount, snapshot: snapshotDraft, restore: restoreDraft });
  // U-CHAN-POP: one channel as its own panel; `params.channel` names it, `channel:<key>` is the instance id.
  mu.panels.register({ id: 'channel', title: COPY.title, singleton: false, defaultPosition: 'right-bottom', inViewsMenu: false, order: 21, mount });
  // R-AUTO-PANELS: the first Comm.Channel.* of a session adds the panel (the host keeps it to once per world on
  // this device, so a Channels panel the player closed stays closed).
  // Once per session here too: every Comm.Channel.Text would otherwise call autoAdd again.
  const added = new Set<string>();
  mu.gmcp.on('Comm.Channel', (_d, { sid }) => {
    if (added.has(sid)) return;
    added.add(sid);
    mu.panels.autoAdd('channels', sid);
  });
}

export default defineExtension({
  activate(ctx) { setup(ctx.mu); },
});

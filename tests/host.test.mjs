// The built extension in the headless μClient host (@runmu.sh/dev/test): what it registers, the per-session
// watch, the settings it owns, its channel alerts and the focus command, and that disabling it leaves nothing behind.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHost } from '@runmu.sh/dev/test';

const ROOT = new URL('..', import.meta.url).pathname;

test('in the host: both panels, one style, the menu kinds and entries, a channel watch per session; unload cleans up', async () => {
  const host = createHost({ root: ROOT, sessions: [{ id: 's1', worldId: 'w1' }, { id: 's2', worldId: 'w2' }] });
  await host.load('src/index.ts');
  assert.deepEqual([...host.panels.keys()], ['channels', 'channel']);
  assert.equal(host.panels.get('channels').show, undefined, 'always offered: it shows "Waiting for channels" before the list');
  assert.equal(host.panels.get('channel').inViewsMenu, false);
  const paths = host.calls.map((c) => c.path);
  assert.equal(paths.filter((p) => p === 'menus.context').length, 2);
  assert.deepEqual(host.calls.filter((c) => c.path === 'menus.context').map((c) => c.args[0].target), ['channels.message', 'channels.message']);
  assert.deepEqual(host.calls.filter((c) => c.path === 'menus.kind').map((c) => [c.args[0].id, c.args[0].title]), [['channels.message', 'Channel message'], ['channels.channel', 'Channel']]);
  assert.deepEqual(host.calls.filter((c) => c.path === 'channels.watch').map((c) => c.args[1]), ['s1', 's2'], 'one watch per session');
  assert.equal(paths.filter((p) => p === 'channels.configure').length, 0, 'the deprecated configure is not called');
  assert.deepEqual(host.errors, []);
  assert.deepEqual(host.sends(), [], 'nothing sent on load');
  await host.unload();
  assert.deepEqual(host.live(), []);
  assert.equal(host.panels.size, 0);
  assert.equal(host.commands.size, 0);
  assert.equal(host.settingsSchema, null);
});

test('in the host: its settings, onMessage with ownsSettings, a mention for an alerting message, Alt+C', async () => {
  const host = createHost({ root: ROOT, settings: { config: { trade: { alert: 'all' }, ooc: { muted: true, alert: 'all' } } } });
  await host.load('src/index.ts');
  assert.deepEqual(host.settingsSchema.items.map((i) => [i.key, i.migrateFrom]), [['config', 'channels.config'], ['replyFormat', 'channels.replyFormat'], ['alerts', 'alerts.channels']]);
  assert.deepEqual(host.settingsSchema.sections, [{ page: 'alerts', title: 'Channels', keys: ['alerts'] }]);
  assert.deepEqual(host.live().filter((k) => k === 'channels.onMessage'), ['channels.onMessage']);
  // Messages through the host's channel model: trade alerts on every message, ooc is muted, chat has the defaults.
  provide(host, 'trade', 'Quill', 'selling', 9);
  provide(host, 'ooc', 'Orrin', 'quiet');
  provide(host, 'chat', 'Orrin', 'no mention here');
  const mentions = host.calls.filter((c) => c.path === 'notify.mention').map((c) => c.args[0]);
  assert.deepEqual(mentions, [{ sid: 's1', title: 'Quill · trade', body: 'selling', key: 'channel:trade:9' }]);
  // Alt+C
  const cmd = host.commands.get('focus.channels');
  assert.deepEqual(cmd.keys, ['Alt+C']);
  cmd.run();
  assert.deepEqual(host.calls.filter((c) => c.path === 'panels.focus').map((c) => c.args[0]), ['channels'], 'the stub reports the registered panel as focused');
  assert.deepEqual(host.errors, []);
  await host.unload();
  assert.deepEqual(host.live(), []);
});

/** `mu.channels.provide` as the bundled adapter calls it: the dev host stores the message and runs the onMessage listeners. */
function provide(host, channel, sender, text, seq) {
  host.mu.channels.provide('s1', { message: { channel, sender, text, ...(seq ? { seq } : {}) } });
}

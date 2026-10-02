// The built extension in the headless μClient host (@runmu.sh/dev/test): what it registers, the per-session
// watch, and that disabling it leaves nothing behind.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHost } from '@runmu.sh/dev/test';

const ROOT = new URL('..', import.meta.url).pathname;

test('in the host: both panels, one style, the message menu, a channel watch per session; unload cleans up', async () => {
  const host = createHost({ root: ROOT, sessions: [{ id: 's1', worldId: 'w1' }, { id: 's2', worldId: 'w2' }] });
  await host.load('src/index.ts');
  assert.deepEqual([...host.panels.keys()], ['channels', 'channel']);
  assert.equal(host.panels.get('channels').show, undefined, 'always offered: it shows "Waiting for channels" before the list');
  assert.equal(host.panels.get('channel').inViewsMenu, false);
  const paths = host.calls.map((c) => c.path);
  assert.equal(paths.filter((p) => p === 'menus.context').length, 2);
  assert.deepEqual(host.calls.filter((c) => c.path === 'channels.watch').map((c) => c.args[1]), ['s1', 's2'], 'one watch per session');
  assert.deepEqual(host.errors, []);
  assert.deepEqual(host.sends(), [], 'nothing sent on load');
  await host.unload();
  assert.deepEqual(host.live(), []);
  assert.equal(host.panels.size, 0);
});

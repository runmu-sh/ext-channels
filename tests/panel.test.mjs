// The extension through a fake mu: what setup registers, the auto-add, and the panel rendered with Vue's
// server renderer (testids, markers, tint, the pop-out mode and the unread clearing of the original watch).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, effectScope, h, nextTick, shallowReactive } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { setup, CHANNELS_CSS } from '../src/index.ts';
import { chan, msg, view, fakeMu } from './fake.mjs';

const render = async (mu, props) => {
  setup(mu);
  const Panel = mu.registered[0].mount.component;
  return renderToString(createSSRApp({ render: () => h(Panel, props) }));
};

test('setup registers both panels, the stylesheet and the auto-add', () => {
  const mu = fakeMu();
  setup(mu);
  const [a, b] = mu.registered;
  assert.deepEqual({ id: a.id, title: a.title, singleton: a.singleton, pos: a.defaultPosition, order: a.order }, { id: 'channels', title: 'Channels', singleton: true, pos: 'right-bottom', order: 20 });
  assert.deepEqual({ id: b.id, singleton: b.singleton, pos: b.defaultPosition, views: b.inViewsMenu, order: b.order }, { id: 'channel', singleton: false, pos: 'right-bottom', views: false, order: 21 });
  assert.equal(mu.styles.length, 1);
  assert.equal(mu.handlers.length, 1);
  assert.equal(mu.handlers[0][0], 'Comm.Channel');
  mu.handlers[0][1]({}, { sid: 's-1', pkg: 'Comm.Channel.List' });
  assert.deepEqual(mu.calls, [['panels.autoAdd', 'channels', 's-1']]);
});

test('the stylesheet: one root, tokens only, sized from --shell-font-size', () => {
  const rules = CHANNELS_CSS.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const r of rules) {
    const sel = r.slice(0, r.indexOf('{'));
    for (const s of sel.split(',')) assert.match(s.trim(), /^\.mu-channels\b/, `scoped: ${s}`);
  }
  assert.doesNotMatch(CHANNELS_CSS, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i, 'no free colours');
  assert.match(CHANNELS_CSS, /\.mu-channels \{ --u: var\(--shell-font-size, 15px\);[^}]*font-size: var\(--u\)/);
});

test('no session: waiting for channels', async () => {
  const html = await render(fakeMu(), { sid: null, worldId: null, params: {} });
  assert.match(html, /data-testid="channels"/);
  assert.match(html, /<p class="empty awaiting" tabindex="-1" data-focus-region="channels" data-testid="channels-empty">Waiting for channels<\/p>/);
  assert.match(html, /Waiting for channels/);
  assert.match(html, /No channels/);
});

test('the full panel: rail markers, tint, messages, reactions, composer; reading selects', async () => {
  const v = view({
    channels: [chan('vox', { unread: 1, color: 'ok', online: 4, topic: 'the city' }), chan('ooc', { unread: 3, mention: true, muted: true })],
    messages: { vox: [msg(1, 'Orrin', 'hello <b>', { reactions: { '+': 2 }, mention: true })] },
  });
  const mu = fakeMu(v);
  const html = await render(mu, { sid: 's-1', worldId: 'w', params: {} });
  for (const id of ['channel-rail', 'channel-title', 'channel-cfg-btn', 'channel-search-btn', 'channel-mute', 'channel-popout', 'channel-msgs', 'channel-input']) assert.match(html, new RegExp(`data-testid="${id}"`), id);
  assert.match(html, /data-key="vox" class="cc on tinted" style="--chan:var\(--ok\);" data-color="ok" aria-pressed="true"/);
  assert.match(html, /data-key="ooc" class="cc muted mention"/);
  assert.match(html, /<span class="at" aria-hidden="true">@<\/span>/);
  assert.match(html, /<span class="online" title="4 online">4<\/span>/);
  assert.match(html, /<span class="bd sh-count" aria-label="3 unread">3<\/span>/);
  assert.match(html, /class="topic">the city</);
  assert.match(html, /class="msgs"[^>]*data-focus-region="channels"[^>]*style="--chan:var\(--ok\);"/);
  assert.match(html, /data-mid="1"[^>]*class="msg mention"/);
  assert.match(html, /hello &lt;b&gt;/, 'text is escaped');
  assert.match(html, /<span class="react">\+ 2<\/span>/);
  assert.match(html, /❯/);
  assert.match(html, /placeholder="message vox"/);
  assert.deepEqual(mu.calls, [['select', 'vox', 's-1']], 'the original watch: reading the active channel clears its unread');
});

test('popped out: one chip, no pop-out, marks its own channel read', async () => {
  const v = view({ channels: [chan('vox'), chan('ooc', { unread: 2 })], messages: { ooc: [msg(5, 'Quill', 'solo hello')] } });
  const mu = fakeMu(v);
  const html = await render(mu, { sid: 's-1', worldId: 'w', params: { channel: 'ooc', instance: 'ooc' } });
  assert.match(html, /<section class="mu-channels chan solo" aria-label="Channels" data-testid="channels" data-channel="ooc">/);
  assert.equal((html.match(/class="cc/g) ?? []).length, 1);
  assert.match(html, /data-key="ooc"/);
  assert.doesNotMatch(html, /channel-popout/);
  assert.match(html, /solo hello/);
  assert.deepEqual(mu.calls, [['markRead', 'ooc', 's-1']]);
});

test('popped out on a channel that is gone', async () => {
  const html = await render(fakeMu(view()), { sid: 's-1', worldId: 'w', params: { channel: 'trade' } });
  assert.match(html, /data-testid="channels-gone"[^>]*>channel trade is not open here</);
  assert.doesNotMatch(html, /channel-rail/);
});

test('known, nothing selected: No channel.', async () => {
  const html = await render(fakeMu(view({ active: '' })), { sid: 's-1', worldId: 'w', params: {} });
  assert.match(html, /data-testid="channels-none"[^>]*>No channel\.</);
  assert.match(html, /data-testid="channel-rail"/);
});

// The panel's reactive behaviour, without a DOM: run its setup in an effect scope with reactive props, the
// way the host would drive it, and let Vue's scheduler flush the watchers.
const live = (mu, props) => {
  setup(mu);
  const Panel = mu.registered[0].mount.component;
  const p = shallowReactive({ worldId: 'w', params: {}, ...props });
  const scope = effectScope();
  scope.run(() => Panel.setup(p, { attrs: {}, slots: {}, emit() {}, expose() {} }));
  return { p, stop: () => scope.stop() };
};

test('a sid change drops the old subscription and watches the new session', async () => {
  const mu = fakeMu(view());
  const { p, stop } = live(mu, { sid: 's-1' });
  assert.deepEqual(mu.subs, [['watch', 's-1']]);
  p.sid = 's-2';
  await nextTick();
  assert.deepEqual(mu.subs, [['watch', 's-1'], ['unwatch', 's-1'], ['watch', 's-2']]);
  assert.deepEqual([...mu.watchers].map((w) => w.sid), ['s-2']);
  p.sid = null;
  await nextTick();
  assert.equal(mu.watchers.size, 0, 'no session: nothing watched');
  p.sid = 's-3';
  await nextTick();
  stop();
  assert.deepEqual(mu.subs.slice(-2), [['watch', 's-3'], ['unwatch', 's-3']], 'unmount unsubscribes');
});

test('unread clears on a new message when the history is already at the 500 cap', async () => {
  const hist = (from) => Array.from({ length: 500 }, (_, i) => msg(from + i, 'Orrin', `line ${from + i}`));
  const mu = fakeMu(view({ messages: { vox: hist(1) } }));
  const { stop } = live(mu, { sid: 's-1' });
  await nextTick();
  assert.deepEqual(mu.calls, [], 'nothing unread yet');
  // One more message: the oldest drops off, the length stays 500, the active channel gets an unread.
  mu.set(view({ channels: [chan('vox', { unread: 1 }), chan('ooc')], messages: { vox: hist(2) } }));
  await nextTick();
  assert.deepEqual(mu.calls, [['select', 'vox', 's-1']]);
  // Unread arriving on its own (same last message) clears too.
  mu.set(view({ channels: [chan('vox', { unread: 2 }), chan('ooc')], messages: { vox: hist(2) } }));
  await nextTick();
  assert.deepEqual(mu.calls, [['select', 'vox', 's-1'], ['select', 'vox', 's-1']]);
  stop();
});

test('autoAdd runs once per session', () => {
  const mu = fakeMu();
  setup(mu);
  const on = mu.handlers[0][1];
  on({}, { sid: 's-1', pkg: 'Comm.Channel.List' });
  on({}, { sid: 's-1', pkg: 'Comm.Channel.Text' });
  on({}, { sid: 's-2', pkg: 'Comm.Channel.Text' });
  on({}, { sid: 's-1', pkg: 'Comm.Channel.Text' });
  assert.deepEqual(mu.calls, [['panels.autoAdd', 'channels', 's-1'], ['panels.autoAdd', 'channels', 's-2']]);
});

test('the channels panel snapshots and restores the composer draft', () => {
  const mu = fakeMu();
  setup(mu);
  const [spec, solo] = mu.registered;
  assert.equal(typeof spec.snapshot, 'function');
  assert.equal(solo.snapshot, undefined);
  const input = { value: 'half a sentence', events: [], dispatchEvent(e) { this.events.push(e.type); } };
  const el = { querySelector: (q) => (q === '[data-testid="channel-input"]' ? input : null) };
  assert.equal(spec.snapshot(el), 'half a sentence');
  input.value = '';
  assert.equal(spec.snapshot(el), undefined, 'an empty composer keeps nothing');
  spec.restore(el, 'half a sentence');
  assert.equal(input.value, 'half a sentence');
  assert.deepEqual(input.events, ['input']);
  spec.restore({ querySelector: () => null }, 'x');
});

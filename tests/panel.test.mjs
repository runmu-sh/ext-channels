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

test('setup registers both panels (channels always offered), the stylesheet and the message menu', () => {
  const mu = fakeMu();
  setup(mu);
  const [a, b] = mu.registered;
  assert.deepEqual({ id: a.id, title: a.title, singleton: a.singleton, pos: a.defaultPosition, order: a.order, show: a.show }, { id: 'channels', title: 'Channels', singleton: true, pos: 'right-bottom', order: 20, show: undefined });
  assert.deepEqual({ id: b.id, singleton: b.singleton, pos: b.defaultPosition, views: b.inViewsMenu, order: b.order }, { id: 'channel', singleton: false, pos: 'right-bottom', views: false, order: 21 });
  assert.equal(mu.styles.length, 1);
  assert.equal(mu.handlers.length, 0, 'no GMCP handler of its own: the host adapter reads Comm.Channel');
  assert.deepEqual(mu.menus.contexts.map((c) => [c.id, c.target]), [['reply', 'channel-message'], ['copy', 'channel-message']]);
});

test('the stylesheet: scoped to the panel box, tokens only, sized from --shell-font-size', () => {
  const rules = CHANNELS_CSS.split('\n').map((l) => l.trim()).filter(Boolean).map((r) => r.replace(/^@media[^{]*\{\s*/, ''));
  for (const r of rules) {
    const sel = r.slice(0, r.indexOf('{'));
    for (const s of sel.split(',')) assert.match(s.trim(), /^\.ext-panel\[data-ext="channels"\] \.mu-channels\b/, `scoped: ${s}`);
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
  assert.match(html, /data-key="vox" class="cc on tinted" style="--chan:var\(--ok\);" data-color="ok" aria-pressed="true" aria-current="true"/);
  assert.match(html, /data-key="ooc" class="cc muted mention"/);
  assert.match(html, /<span class="at" aria-hidden="true">@<\/span>/);
  assert.match(html, /<span class="online" title="4 online" aria-hidden="true">4<\/span>/);
  assert.match(html, /<span class="bd sh-count" aria-hidden="true">3<\/span>/);
  assert.match(html, /aria-label="ooc, 3 unread, mentioned, muted"/, 'the chip names its state');
  assert.match(html, /class="topic" title="the city">the city</);
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
/** Depth-first: the first vnode under `n` that `pred` accepts, or null. */
const find = (n, pred) => {
  if (!n || typeof n !== 'object') return null;
  if (Array.isArray(n)) { for (const c of n) { const f = find(c, pred); if (f) return f; } return null; }
  if (pred(n)) return n;
  return find(n.children, pred);
};
const text = (n) => (typeof n === 'string' ? n : Array.isArray(n) ? n.map(text).join('') : n && typeof n === 'object' ? text(n.children ?? '') : '');
/** A vnode's template ref (`ref: someRef`) set by hand, the way a mount would. */
const setRef = (n, el) => { const r = n.ref; if (r && typeof r === 'object' && 'r' in r) { if (typeof r.r === 'object') r.r.value = el; } };
const live = (mu, props) => {
  setup(mu);
  const Panel = mu.registered[0].mount.component;
  const p = shallowReactive({ worldId: 'w', params: {}, ...props });
  const scope = effectScope();
  const render = scope.run(() => Panel.setup(p, { attrs: {}, slots: {}, emit() {}, expose() {} }));
  return { p, stop: () => scope.stop(), tree: () => scope.run(render) };
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

test('per session: touch once when the channels are known, the badge follows the unread total', () => {
  const mu = fakeMu(view({ known: false, channels: [] }), { sessions: ['s-1'] });
  setup(mu);
  assert.deepEqual(mu.calls, [], 'not known yet: nothing');
  mu.set(view({ channels: [chan('vox', { unread: 2 }), chan('ooc', { unread: 1 }), chan('trade', { unread: 5, muted: true })] }));
  mu.set(view({ channels: [chan('vox', { unread: 2 }), chan('ooc', { unread: 1 })] }));
  mu.set(view({ channels: [chan('vox'), chan('ooc')] }));
  assert.deepEqual(mu.calls, [
    ['panels.touch', 'channels', 's-1'],
    ['panels.badge', 'channels', { count: 3 }, 's-1'],
    ['panels.badge', 'channels', null, 's-1'],
  ], 'muted channels do not count; the same total is not set twice');
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

test('grouped messages drop the time and sender; the divider marks what was unread; rows are message targets', async () => {
  const t = (m) => Date.UTC(2026, 9, 1, 4, m);
  const v = view({
    channels: [chan('vox', { unread: 3 }), chan('ooc')],
    messages: { vox: [msg(1, 'Orrin', 'one', { ts: t(0) }), msg(2, 'Orrin', 'two', { ts: t(1) }), msg(3, 'Quill', 'three', { ts: t(2) }), msg(4, 'Quill', 'four', { ts: t(3) })] },
  });
  const mu = fakeMu(v);
  const html = await render(mu, { sid: 's-1', worldId: 'w', params: {} });
  assert.match(html, /data-mid="4"[^>]*class="msg grouped">(<!---->)*<span class="b text">four</, 'grouped: no time, no sender');
  assert.match(html, /data-mid="2"[^>]*class="msg"><span class="mts">/, 'after the divider a new group starts');
  assert.match(html, /data-mid="1"[^>]*class="msg"><span class="mts">/);
  assert.match(html, /data-testid="channel-new"><span>new<\/span><\/div><div data-mid="2"/, 'divider before the first unread');
  assert.match(html, /aria-label="Orrin, 04:01: two"/, 'the label always names the sender and time');
  assert.match(html, /aria-label="vox messages"/);
  assert.equal((html.match(/data-testid="channel-reply"/g) ?? []).length, 4, 'a reply tool per message with a sender');
});

test('the Mute tool reads Muted while pressed', async () => {
  const html = await render(fakeMu(view({ channels: [chan('vox', { muted: true })] })), { sid: 's-1', worldId: 'w', params: {} });
  assert.match(html, /aria-pressed="true" data-testid="channel-mute">Muted</);
});

test('reply from the message menu: the bar shows, the composer sends @sender: text, the bar goes', async () => {
  const mu = fakeMu(view({ messages: { vox: [msg(1, 'Orrin', 'anyone?')] } }));
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  const reply = mu.menus.contexts.find((c) => c.id === 'reply');
  const target = { kind: 'channel-message', sid: 's-1', key: 'vox', message: msg(1, 'Orrin', 'anyone?') };
  assert.equal(reply.title(target), 'Reply to Orrin');
  assert.equal(reply.when(target), true);
  assert.equal(reply.when({ ...target, message: msg(2, '', 'system') }), false, 'nobody to reply to');
  reply.run(target);
  await nextTick();
  const bar = find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar');
  assert.ok(bar, 'the reply bar shows');
  assert.match(text(bar), /^Reply to Orrin/);
  const input = find(tree(), (n) => n.props?.['data-testid'] === 'channel-input');
  input.props.onInput({ target: { value: 'on my way' } });
  const form = find(tree(), (n) => n.type === 'form');
  await form.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'send').at(-1), ['send', '@Orrin: on my way', 'vox', 's-1']);
  await nextTick();
  assert.equal(find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar'), null, 'the bar goes after sending');
  // Another session's reply does not reach this view.
  reply.run({ ...target, sid: 's-2' });
  await nextTick();
  assert.equal(find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar'), null);
  // The hover tool starts one too; Cancel drops it.
  find(tree(), (n) => n.props?.['data-testid'] === 'channel-reply').props.onClick({ stopPropagation() {} });
  await nextTick();
  const cancel = find(find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar'), (n) => n.type === 'button');
  cancel.props.onClick();
  await nextTick();
  assert.equal(find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar'), null);
  stop();
});

test('scrolled up: new messages count on the latest button; clicking it goes back down', async () => {
  const mu = fakeMu(view({ messages: { vox: [msg(1, 'Orrin', 'a'), msg(2, 'Orrin', 'b')] } }));
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  const list = find(tree(), (n) => n.props?.['data-testid'] === 'channel-msgs');
  const el = { scrollTop: 0, scrollHeight: 600, clientHeight: 100, focus() {} };
  // Point the panel's list ref at the fake element, then scroll it up.
  setRef(list, el);
  list.props.onScroll();
  mu.set(view({ messages: { vox: [msg(1, 'Orrin', 'a'), msg(2, 'Orrin', 'b'), msg(3, 'Quill', 'c'), msg(4, 'Quill', 'd')] } }));
  await nextTick();
  const latest = find(tree(), (n) => n.props?.['data-testid'] === 'channel-latest');
  assert.ok(latest, 'the latest button shows');
  assert.equal(text(latest), '↓ 2 new messages');
  latest.props.onClick();
  await nextTick();
  assert.equal(el.scrollTop, 600);
  assert.equal(find(tree(), (n) => n.props?.['data-testid'] === 'channel-latest'), null);
  stop();
});

test('↑ ↓ Home End in the list move the roving focus', async () => {
  const mu = fakeMu(view({ messages: { vox: [msg(1, 'Orrin', 'a'), msg(2, 'Orrin', 'b'), msg(3, 'Quill', 'c')] } }));
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  const tab = () => find(tree(), (n) => n.props?.['data-testid'] === 'channel-msgs').children.filter((c) => c.props?.['data-mid']).map((c) => c.props.tabindex);
  assert.deepEqual(tab(), ['-1', '-1', '-1']);
  const list = find(tree(), (n) => n.props?.['data-testid'] === 'channel-msgs');
  const key = (k, target = null) => { let d = false; list.props.onKeydown({ key: k, target, preventDefault() { d = true; } }); return d; };
  assert.equal(key('ArrowUp'), true);
  await nextTick();
  assert.deepEqual(tab(), ['-1', '-1', '0'], 'from the list: the newest');
  const row = {};
  key('ArrowUp', row); await nextTick();
  assert.deepEqual(tab(), ['-1', '0', '-1']);
  key('Home', row); await nextTick();
  assert.deepEqual(tab(), ['0', '-1', '-1']);
  key('End', row); await nextTick();
  assert.deepEqual(tab(), ['-1', '-1', '0']);
  assert.equal(key('a'), false, 'other keys pass');
  stop();
});

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
  assert.deepEqual(mu.menus.contexts.map((c) => [c.id, c.target]), [['reply', 'channels.message'], ['copy', 'channels.message']]);
  assert.deepEqual(mu.menus.kinds.map((k) => [k.id, k.title]), [['channels.message', 'Channel message'], ['channels.channel', 'Channel']]);
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
    channels: [chan('vox', { unread: 1, online: 4, topic: 'the city' }), chan('ooc', { unread: 3, mention: true })],
    messages: { vox: [msg(1, 'Orrin', 'hello <b>', { reactions: { '+': 2 }, mention: true })] },
  });
  // Unread and mention arrive on the muted channel too (the host counts them while the extension owns the settings).
  const mu = fakeMu(v, { settings: { config: { vox: { color: 'ok' }, ooc: { muted: true } } } });
  const html = await render(mu, { sid: 's-1', worldId: 'w', params: {} });
  for (const id of ['channel-rail', 'channel-title', 'channel-cfg-btn', 'channel-search-btn', 'channel-mute', 'channel-popout', 'channel-msgs', 'channel-input']) assert.match(html, new RegExp(`data-testid="${id}"`), id);
  assert.match(html, /data-key="vox" class="cc on tinted" style="--chan:var\(--ok\);" data-color="ok" aria-pressed="true" aria-current="true"/);
  assert.match(html, /data-key="ooc" class="cc muted"/, 'muted: no mention marker');
  assert.doesNotMatch(html, /<span class="at" aria-hidden="true">@<\/span>/);
  assert.match(html, /<span class="online" title="4 online" aria-hidden="true">4<\/span>/);
  assert.doesNotMatch(html, /<span class="bd sh-count" aria-hidden="true">3<\/span>/, 'muted: no unread badge');
  assert.match(html, /aria-label="ooc, muted"/, 'the chip names its state');
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
  assert.deepEqual(mu.subs, [['watch', 's-1'], ['settings.watch', 'config', 's-1']]);
  p.sid = 's-2';
  await nextTick();
  assert.deepEqual(mu.subs, [['watch', 's-1'], ['settings.watch', 'config', 's-1'], ['unwatch', 's-1'], ['settings.unwatch', 'config', 's-1'], ['watch', 's-2'], ['settings.watch', 'config', 's-2']]);
  assert.deepEqual([...mu.watchers].map((w) => w.sid), ['s-2']);
  p.sid = null;
  await nextTick();
  assert.equal(mu.watchers.size, 0, 'no session: nothing watched');
  p.sid = 's-3';
  await nextTick();
  stop();
  assert.deepEqual(mu.subs.slice(-2), [['unwatch', 's-3'], ['settings.unwatch', 'config', 's-3']], 'unmount unsubscribes');
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
  const mu = fakeMu(view({ known: false, channels: [] }), { sessions: ['s-1'], settings: { config: { trade: { muted: true } } } });
  setup(mu);
  assert.deepEqual(mu.calls.filter((c) => c[0].startsWith('panels.')), [], 'not known yet: nothing');
  mu.set(view({ channels: [chan('vox', { unread: 2 }), chan('ooc', { unread: 1 }), chan('trade', { unread: 5 })] }));
  mu.set(view({ channels: [chan('vox', { unread: 2 }), chan('ooc', { unread: 1 })] }));
  mu.set(view({ channels: [chan('vox'), chan('ooc')] }));
  assert.deepEqual(mu.calls.filter((c) => c[0].startsWith('panels.')), [
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
  const html = await render(fakeMu(view({ channels: [chan('vox')] }), { settings: { config: { vox: { muted: true } } } }), { sid: 's-1', worldId: 'w', params: {} });
  assert.match(html, /aria-pressed="true" data-testid="channel-mute">Muted</);
});

test('reply from the message menu: the bar shows, the composer sends @sender: text, the bar goes', async () => {
  const mu = fakeMu(view({ messages: { vox: [msg(1, 'Orrin', 'anyone?')] } }));
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  const reply = mu.menus.contexts.find((c) => c.id === 'reply');
  const target = { kind: 'channels.message', sid: 's-1', data: { key: 'vox', message: msg(1, 'Orrin', 'anyone?') } };
  assert.equal(reply.title(target), 'Reply to Orrin');
  assert.equal(reply.when(target), true);
  assert.equal(reply.when({ ...target, data: { key: 'vox', message: msg(2, '', 'system') } }), false, 'nobody to reply to');
  reply.run(target);
  await nextTick();
  const bar = find(tree(), (n) => n.props?.['data-testid'] === 'channel-replybar');
  assert.ok(bar, 'the reply bar shows');
  assert.match(text(bar), /^Reply to Orrin/);
  const input = find(tree(), (n) => n.props?.['data-testid'] === 'channel-input');
  input.props.onInput({ target: { value: 'on my way' } });
  const form = find(tree(), (n) => n.type === 'form');
  await form.props.onSubmit({ preventDefault() {} });
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'send').at(-1), ['send', '@Orrin: on my way', 'vox', 's-1', { format: '{channel} {text}' }], 'the reply format goes with it');
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

// ── 1.2.0: settings of its own, alerts, menu kinds, Alt+C ──

test('colour, alert and mute are written to the extension\'s config setting for the session\'s world, never through channels.configure', async () => {
  const mu = fakeMu(view({ channels: [chan('vox', { unread: 2 }), chan('ooc')] }), { settings: { config: { vox: { muted: true } } } });
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  find(tree(), (n) => n.props?.['data-testid'] === 'channel-cfg-btn').props.onClick();
  await nextTick();
  find(tree(), (n) => n.props?.['data-color'] === 'gold' && n.props?.role === 'radio').props.onClick();
  await nextTick();
  assert.deepEqual(mu.values.get('config'), { vox: { muted: true, color: 'gold' } });
  find(tree(), (n) => n.type === 'select').props.onChange({ target: { value: 'all' } });
  await nextTick();
  assert.deepEqual(mu.values.get('config'), { vox: { muted: true, color: 'gold', alert: 'all' } });
  // Unmute: the field goes, and what came in while muted is marked read.
  find(tree(), (n) => n.props?.['data-testid'] === 'channel-mute').props.onClick();
  await nextTick();
  assert.deepEqual(mu.values.get('config'), { vox: { color: 'gold', alert: 'all' } });
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'settings.set').map((c) => c[3]), ['w', 'w', 'w'], 'per world');
  assert.equal(mu.calls.filter((c) => c[0] === 'configure').length, 0);
  assert.ok(mu.calls.some((c) => c[0] === 'select' && c[1] === 'vox'), 'reading the unmuted channel clears the host count');
  // The chip follows the setting at once.
  assert.equal(find(tree(), (n) => n.props?.['data-key'] === 'vox').props['data-color'], 'gold');
  stop();
});

test('the composer sends with the world\'s reply format', async () => {
  const mu = fakeMu(view(), { settings: { replyFormat: '{channel}: {text}' } });
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  find(tree(), (n) => n.props?.['data-testid'] === 'channel-input').props.onInput({ target: { value: 'hi' } });
  await find(tree(), (n) => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'send'), [['send', 'hi', 'vox', 's-1', { format: '{channel}: {text}' }]]);
  assert.deepEqual(mu.calls.find((c) => c[0] === 'settings.get' && c[1] === 'replyFormat'), ['settings.get', 'replyFormat', { sid: 's-1' }]);
  stop();
});

test('settings: config, replyFormat and alerts with migrateFrom, and the Channels section on the Alerts page', () => {
  const mu = fakeMu();
  setup(mu);
  const s = mu.settings.schema;
  assert.deepEqual(s.items.map((i) => [i.key, i.kind, i.scope, i.migrateFrom, i.default]), [
    ['config', 'json', 'world', 'channels.config', {}],
    ['replyFormat', 'text', 'both', 'channels.replyFormat', '{channel} {text}'],
    ['alerts', 'toggle', 'both', 'alerts.channels', true],
  ]);
  assert.deepEqual(s.sections, [{ page: 'alerts', title: 'Channels', keys: ['alerts'] }]);
});

test('onMessage owns the settings and raises the channel alerts itself', async () => {
  const mu = fakeMu(null, { settings: { config: { ooc: { muted: true }, trade: { alert: 'all' }, vox: { alert: 'none' } } } });
  setup(mu);
  assert.equal(mu.messageListeners.length, 1);
  assert.deepEqual(mu.messageListeners[0].opts, { ownsSettings: true });
  mu.message({ channel: 'chat', caption: 'Chat', message: msg(1, 'Orrin', 'hey Vesper', { mention: true }), seq: 7 });
  mu.message({ channel: 'chat', message: msg(2, 'Orrin', 'no mention') });
  mu.message({ channel: 'ooc', message: msg(3, 'Orrin', 'muted Vesper', { mention: true }) });
  mu.message({ channel: 'trade', caption: 'Trade', message: msg(4, 'Quill', 'selling') });
  mu.message({ channel: 'vox', message: msg(5, 'Quill', 'Vesper', { mention: true }) });
  mu.message({ channel: 'chat', message: msg(6, 'Orrin', 'Vesper again', { mention: true }), read: true });
  assert.deepEqual(mu.notify.mentions, [
    { sid: 's-1', title: 'Orrin · Chat', body: 'hey Vesper', key: 'channel:chat:7' },
    { sid: 's-1', title: 'Quill · Trade', body: 'selling' },
  ]);
  // Channel alerts off.
  mu.values.set('alerts', false);
  mu.message({ channel: 'chat', message: msg(7, 'Orrin', 'Vesper', { mention: true }) });
  assert.equal(mu.notify.mentions.length, 2);
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'settings.get').at(-1), ['settings.get', 'alerts', { sid: 's-1' }], 'read for the message\'s session');
});

test('rows publish channels.message targets with data; chips publish channels.channel', async () => {
  const mu = fakeMu(view({ messages: { vox: [msg(1, 'Orrin', 'a')] } }));
  const { stop, tree } = live(mu, { sid: 's-1' });
  await nextTick();
  globalThis.HTMLElement ??= class {};
  const fakeEl = () => { const el = new HTMLElement(); el.isConnected = true; el.ls = []; el.addEventListener = (t, f) => el.ls.push([t, f]); el.removeEventListener = (t, f) => { el.ls = el.ls.filter((x) => x[1] !== f); }; return el; };
  // A function ref, as Vue calls it on mount (h() outside a render keeps it under `.r`).
  const callRef = (n, el) => (typeof n.ref === 'function' ? n.ref : n.ref.r)(el);
  callRef(find(tree(), (n) => n.props?.['data-mid'] === 1), fakeEl());
  const chipEl = fakeEl();
  callRef(find(tree(), (n) => n.props?.['data-key'] === 'vox'), chipEl);
  assert.deepEqual(mu.menus.targets, [
    { kind: 'channels.message', sid: 's-1', data: { key: 'vox', message: msg(1, 'Orrin', 'a') } },
    { kind: 'channels.channel', sid: 's-1', data: { key: 'vox' } },
  ]);
  // A right-click that no menu took opens the settings strip.
  const [, onCtx] = chipEl.ls.find((x) => x[0] === 'contextmenu');
  let prevented = false;
  onCtx({ defaultPrevented: false, preventDefault() { prevented = true; } });
  await nextTick();
  assert.ok(prevented);
  assert.ok(find(tree(), (n) => n.props?.['data-testid'] === 'channel-cfg'), 'settings strip open');
  stop();
});

test('focus.channels (Alt+C): the Channels panel, else a pop-out; opens nothing', () => {
  const mu = fakeMu();
  setup(mu);
  const cmd = mu.commandMap.get('focus.channels');
  assert.deepEqual({ title: cmd.title, keys: cmd.keys, group: cmd.group, when: cmd.when }, { title: 'Go to channels', keys: ['Alt+C'], group: 'Focus', when: 'session' });
  cmd.run();
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'panels.focus'), [['panels.focus', 'channels'], ['panels.focus', 'channel']]);
  mu.panels.open_.add('channels');
  cmd.run();
  assert.deepEqual(mu.calls.filter((c) => c[0] === 'panels.focus').slice(2), [['panels.focus', 'channels']]);
  assert.equal(mu.calls.filter((c) => c[0] === 'panels.open').length, 0);
});

test('the manifest declares the same settings, command and menu entries setup registers', async () => {
  const { readFileSync } = await import('node:fs');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const c = pkg.muclient.contributes;
  const { SETTINGS } = await import('../src/settings.ts');
  assert.deepEqual(c.settings, JSON.parse(JSON.stringify(SETTINGS)));
  const mu = fakeMu();
  setup(mu);
  const cmd = mu.commandMap.get('focus.channels');
  assert.deepEqual(c.commands, [{ id: cmd.id, title: cmd.title, keys: cmd.keys }]);
  assert.deepEqual(c.contextMenus.map((m) => [m.id, m.target]), mu.menus.contexts.map((m) => [m.id, m.target]));
  assert.equal(pkg.muclient.api, '^1.14');
});

// The pure parts of the Channels panel: the matcher and search (the terminal's rules), the count, stepping and
// key handling, the colour and tint helpers, and the rail / selection / unread logic.
//   node --experimental-strip-types --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_COLORS } from '@muclient/sdk';
import {
  makeMatcher, searchText, searchMessages, countText, stepIndex, clampHit, activeHitId, searchKey, isFindKey,
  isChannelColor, colorVar, tintStyle, swatchStyle, soloOf, activeKeyOf, activeOf, railOf, messagesOf, bodyOf, readAction, popOutArgs, hhmm,
} from '../src/logic.ts';
import { chan, msg, view } from './fake.mjs';

const MSGS = [msg(1, 'Orrin', 'the bells toll at dusk'), msg(2, 'Quill', 'more Bells?'), msg(3, 'Maren', 'quiet now'), msg(4, '', 'System notice')];

test('makeMatcher: empty is null, plain text is case-insensitive', () => {
  assert.equal(makeMatcher(''), null);
  assert.equal(makeMatcher('   '), null);
  const m = makeMatcher('  BeLLs ');
  assert.ok(m?.ok);
  assert.equal(m.test('the bells toll'), true);
  assert.equal(m.test('the bell tolls'), false);
});

test('makeMatcher: /regex/flags, g and y dropped, case-sensitive without i', () => {
  const m = makeMatcher('/^Q\\w+:/');
  assert.ok(m?.ok);
  assert.equal(m.test('Quill: hi'), true);
  assert.equal(m.test('quill: hi'), false);
  const i = makeMatcher('/^q/gi');
  assert.equal(i.test('Quill'), true);
  assert.equal(i.test('Quill'), true, 'no lastIndex state: g is stripped');
});

test('makeMatcher: a regex in progress, and a bad regex', () => {
  const p = makeMatcher('/bel+');
  assert.ok(p?.ok);
  assert.equal(p.test('BELLS'), true, 'in-progress regex is case-insensitive');
  assert.deepEqual(makeMatcher('/(/'), { ok: false, error: 'bad' });
  assert.deepEqual(makeMatcher('/a(b'), { ok: false, error: 'bad' });
  const slash = makeMatcher('/');
  assert.ok(slash?.ok, 'a lone slash is plain text');
  assert.equal(slash.test('a/b'), true);
});

test('searchMessages matches "sender: text" and returns ids in order', () => {
  assert.equal(searchText(MSGS[0]), 'Orrin: the bells toll at dusk');
  assert.equal(searchText(MSGS[3]), 'System notice');
  assert.deepEqual(searchMessages(MSGS, 'bells'), { hits: [1, 2], error: false });
  assert.deepEqual(searchMessages(MSGS, 'maren:'), { hits: [3], error: false });
  assert.deepEqual(searchMessages(MSGS, '/^(Orrin|Maren):/'), { hits: [1, 3], error: false });
  assert.deepEqual(searchMessages(MSGS, ''), { hits: [], error: false });
  assert.deepEqual(searchMessages(MSGS, '/[/'), { hits: [], error: true });
});

test('countText: n/N, no match, bad regex, empty', () => {
  assert.equal(countText({ hits: [1, 2], error: false }, 'bells', 1), '2/2');
  assert.equal(countText({ hits: [1, 2], error: false }, 'bells', 0), '1/2');
  assert.equal(countText({ hits: [], error: false }, 'zzz', -1), 'no match');
  assert.equal(countText({ hits: [], error: true }, '/[/', -1), 'not a valid regex');
  assert.equal(countText({ hits: [], error: false }, '  ', -1), '');
});

test('stepping wraps; clampHit follows the hit count; activeHitId', () => {
  assert.equal(stepIndex(1, -1, 2), 0);
  assert.equal(stepIndex(0, -1, 2), 1);
  assert.equal(stepIndex(1, 1, 2), 0);
  assert.equal(stepIndex(-1, 1, 0), -1, 'no hits: unchanged');
  assert.equal(clampHit(5, 3), 2);
  assert.equal(clampHit(-1, 3), 2, 'first hits arrive: the newest is active');
  assert.equal(clampHit(-1, 0), -1);
  assert.equal(clampHit(1, 3), 1);
  assert.equal(activeHitId({ hits: [4, 9], error: false }, 1), 9);
  assert.equal(activeHitId({ hits: [4, 9], error: false }, -1), -1);
  assert.equal(activeHitId({ hits: [4], error: false }, 3), -1);
});

test('search keys: Esc closes, Enter back, Shift+Enter forward, ↑ back, ↓ forward; Ctrl+F', () => {
  assert.equal(searchKey({ key: 'Escape' }), 'close');
  assert.equal(searchKey({ key: 'Enter' }), 'prev');
  assert.equal(searchKey({ key: 'Enter', shiftKey: true }), 'next');
  assert.equal(searchKey({ key: 'ArrowUp' }), 'prev');
  assert.equal(searchKey({ key: 'ArrowDown' }), 'next');
  assert.equal(searchKey({ key: 'n' }), null);
  assert.equal(isFindKey({ key: 'f', ctrlKey: true }), true);
  assert.equal(isFindKey({ key: 'F', metaKey: true }), true);
  assert.equal(isFindKey({ key: 'f', ctrlKey: true, altKey: true }), false);
  assert.equal(isFindKey({ key: 'f' }), false);
});

test('colours: the SDK palette only, as tokens', () => {
  assert.deepEqual([...CHANNEL_COLORS], ['accent', 'accent-bright', 'gold', 'alert', 'ok', 'fg', 'fg-dim']);
  for (const c of CHANNEL_COLORS) assert.equal(isChannelColor(c), true);
  assert.equal(isChannelColor('#ff0000'), false);
  assert.equal(isChannelColor('red'), false);
  assert.equal(isChannelColor(null), false);
  assert.equal(colorVar('ok'), 'var(--ok)');
  assert.equal(colorVar('#fff'), null);
  assert.equal(colorVar(null), null);
  assert.deepEqual(tintStyle('gold'), { '--chan': 'var(--gold)' });
  assert.deepEqual(tintStyle(null), {});
  assert.deepEqual(tintStyle('url(x)'), {});
  assert.deepEqual(swatchStyle('accent-bright'), { '--sw': 'var(--accent-bright)' });
});

test('rail and selection: full panel', () => {
  const v = view({ messages: { vox: [MSGS[0]], ooc: [MSGS[1]] } });
  assert.equal(soloOf({}), '');
  assert.equal(soloOf({ channel: 3 }), '');
  assert.equal(activeKeyOf(v, ''), 'vox');
  assert.equal(activeOf(v, '').key, 'vox');
  assert.deepEqual(railOf(v, '').map((c) => c.key), ['vox', 'ooc']);
  assert.deepEqual(messagesOf(v, '').map((m) => m.id), [1]);
  assert.equal(bodyOf(v, ''), 'view');
  assert.deepEqual(railOf(null, ''), []);
  assert.deepEqual(messagesOf(null, ''), []);
});

test('rail and selection: popped out', () => {
  const v = view({ messages: { vox: [MSGS[0]], ooc: [MSGS[1]] } });
  const solo = soloOf({ channel: 'ooc', instance: 'ooc' });
  assert.equal(solo, 'ooc');
  assert.equal(activeKeyOf(v, solo), 'ooc', 'the solo channel, whatever is selected');
  assert.deepEqual(railOf(v, solo).map((c) => c.key), ['ooc']);
  assert.deepEqual(messagesOf(v, solo).map((m) => m.id), [2]);
  assert.equal(bodyOf(v, solo), 'view');
  assert.equal(bodyOf(v, 'trade'), 'gone', 'channel X is not open here');
  assert.equal(bodyOf(view({ known: false, channels: [] }), 'trade'), 'awaiting', 'not gone before the channels are known');
});

test('bodyOf: awaiting, none', () => {
  assert.equal(bodyOf(null, ''), 'awaiting');
  assert.equal(bodyOf(view({ known: false, channels: [], active: '' }), ''), 'awaiting');
  assert.equal(bodyOf(view({ active: '' }), ''), 'none');
});

test('readAction: the full panel selects, the pop-out marks read, nothing when read', () => {
  const v = view({ channels: [chan('vox', { unread: 2, mention: true }), chan('ooc', { unread: 1 })] });
  assert.deepEqual(readAction(v, ''), { op: 'select', key: 'vox' });
  assert.deepEqual(readAction(v, 'ooc'), { op: 'markRead', key: 'ooc' });
  assert.equal(readAction(view(), ''), null);
  assert.equal(readAction(v, 'trade'), null);
  assert.equal(readAction(null, ''), null);
});

test('popOutArgs: the channel panel, the instance and the title', () => {
  assert.deepEqual(popOutArgs({ key: 'ooc', caption: 'OOC' }, 's-1'), ['channel', { channel: 'ooc', instance: 'ooc' }, { sid: 's-1', title: 'Channel · OOC' }]);
});

test('hhmm', () => {
  const d = new Date(2026, 0, 2, 7, 5);
  assert.equal(hhmm(d.getTime()), '07:05');
});

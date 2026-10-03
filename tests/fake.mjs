// A fake `mu` for the tests: records what the extension registers and calls, and serves a ChannelsView.
/** A host channel (SDK 1.14 `ChannelView` without the deprecated muted/alert/color, which the extension no longer reads). */
export function chan(key, over = {}) {
  return { key, name: key, caption: key, command: key, online: null, unread: 0, mention: false, ...over };
}
export function msg(id, sender, text, over = {}) {
  return { id, ts: Date.UTC(2026, 9, 1, 4, id), sender, text, mention: false, ...over };
}
export function view(over = {}) {
  return { known: true, active: 'vox', channels: [chan('vox'), chan('ooc')], messages: {}, ...over };
}

/**
 * `sessions`: the session ids `mu.sessions.each` runs for (none by default, so the panel tests see only the panel).
 * `settings`: initial setting values by key (one value for every world, as the fake keeps no scopes).
 */
export function fakeMu(initial = null, { sessions = [], settings = {} } = {}) {
  const calls = [];
  const registered = [];
  const handlers = [];
  const styles = [];
  const watchers = new Set();
  const subs = [];
  const values = new Map(Object.entries(settings));
  const settingWatchers = new Set();
  const messageListeners = [];
  const commands = new Map();
  let current = initial;
  const mu = {
    calls, registered, handlers, styles, subs, watchers, values, messageListeners, commandMap: commands,
    /** Deliver a stored channel message to the onMessage listeners (`ChannelMessageEvent`). */
    message(e) { for (const l of messageListeners) l.fn({ sid: 's-1', worldId: 'w', caption: e.channel, read: false, ...e }); },
    /** Serve `v` to every watcher, or (with `sid`) to that session's watchers only. */
    set(v, sid) { current = v; for (const w of watchers) if (sid === undefined || w.sid === sid) w.fn(v); },
    panels: {
      register(spec) { registered.push(spec); return () => {}; },
      open(...a) { calls.push(['panels.open', ...a]); },
      autoAdd(...a) { calls.push(['panels.autoAdd', ...a]); },
      touch(...a) { calls.push(['panels.touch', ...a]); },
      badge(...a) { calls.push(['panels.badge', ...a]); },
      open_: new Set(),
      focus(id) { calls.push(['panels.focus', id]); return this.open_.has(id); },
      vue(component) { const m = () => () => {}; m.component = component; return m; },
      close() {}, update() {}, openWeb() { return 'blocked'; }, closeWeb() {},
    },
    sessions: { list: () => sessions.map((id) => ({ id, worldId: 'w' })), each(fn) { const ds = sessions.map((id) => fn({ id, worldId: 'w' })); return () => { for (const d of ds) if (typeof d === 'function') d(); }; } },
    menus: {
      contexts: [], targets: [], kinds: [],
      kind(spec) { this.kinds.push(spec); return () => {}; },
      context(spec) { this.contexts.push(spec); return () => {}; },
      target(el, t) { this.targets.push(t); return () => {}; },
    },
    gmcp: { on(pkg, fn) { handlers.push([pkg, fn]); return () => {}; }, state() {}, send: async () => false, supports: () => () => {} },
    channels: {
      push: () => () => {},
      get: () => current,
      watch(fn, sid) {
        const w = { fn, sid };
        watchers.add(w); subs.push(['watch', sid]);
        if (current) fn(current);
        return () => { watchers.delete(w); subs.push(['unwatch', sid]); };
      },
      select(...a) { calls.push(['select', ...a]); },
      markRead(...a) { calls.push(['markRead', ...a]); },
      send: async (...a) => { calls.push(['send', ...a]); },
      onMessage(fn, opts) { const l = { fn, opts }; messageListeners.push(l); return () => { messageListeners.splice(messageListeners.indexOf(l), 1); }; },
    },
    settings: {
      schema: null,
      define(schema) { this.schema = schema; for (const it of schema.items) if (!values.has(it.key)) values.set(it.key, it.default); return () => {}; },
      get(key, at) { calls.push(['settings.get', key, at]); return values.get(key); },
      set(key, value, worldId) { calls.push(['settings.set', key, value, worldId]); values.set(key, value); for (const w of settingWatchers) if (w.key === key) w.fn(value, { replay: false }); },
      watch(key, fn, opts) {
        const w = { key, fn, opts };
        settingWatchers.add(w); subs.push(['settings.watch', key, opts?.sid]);
        fn(values.get(key), { replay: true });
        return () => { settingWatchers.delete(w); subs.push(['settings.unwatch', key, opts?.sid]); };
      },
    },
    notify: {
      mentions: [],
      async mention(m) { this.mentions.push(m); },
    },
    commands: {
      register(spec) { commands.set(spec.id, spec); return () => { commands.delete(spec.id); }; },
    },
    ui: {
      style(css) { styles.push(css); return () => {}; },
      toast() {},
      css: { btn: 'btn', primary: 'btn primary', tool: 'tool', chip: 'chip', inp: 'inp', secHead: 'sec-head', empty: 'empty', framed: 'framed', badge: 'badge', lamp: 'lamp', glow: 'glow-text', cmd: 'sh-cmd', toggle: 'sh-toggle', plate: 'sh-plate', count: 'sh-count', field: 'sh-field', row: 'sh-row', label: 'sh-label', sq: 'sq' },
    },
    log: { info() {}, warn() {}, error() {} },
  };
  return mu;
}

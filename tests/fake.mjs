// A fake `mu` for the tests: records what the extension registers and calls, and serves a ChannelsView.
export function chan(key, over = {}) {
  return { key, name: key, caption: key, command: key, online: null, unread: 0, mention: false, muted: false, alert: 'mentions', color: null, ...over };
}
export function msg(id, sender, text, over = {}) {
  return { id, ts: Date.UTC(2026, 9, 1, 4, id), sender, text, mention: false, ...over };
}
export function view(over = {}) {
  return { known: true, active: 'vox', channels: [chan('vox'), chan('ooc')], messages: {}, ...over };
}

export function fakeMu(initial = null) {
  const calls = [];
  const registered = [];
  const handlers = [];
  const styles = [];
  const watchers = new Set();
  const subs = [];
  let current = initial;
  const mu = {
    calls, registered, handlers, styles, subs, watchers,
    /** Serve `v` to every watcher, or (with `sid`) to that session's watchers only. */
    set(v, sid) { current = v; for (const w of watchers) if (sid === undefined || w.sid === sid) w.fn(v); },
    panels: {
      register(spec) { registered.push(spec); return () => {}; },
      open(...a) { calls.push(['panels.open', ...a]); },
      autoAdd(...a) { calls.push(['panels.autoAdd', ...a]); },
      vue(component) { const m = () => () => {}; m.component = component; return m; },
      close() {}, update() {}, openWeb() { return 'blocked'; }, closeWeb() {},
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
      configure(...a) { calls.push(['configure', ...a]); },
    },
    ui: {
      style(css) { styles.push(css); return () => {}; },
      toast() {},
      css: { btn: 'btn', primary: 'btn primary', tool: 'tool', chip: 'chip', inp: 'inp', secHead: 'sec-head', empty: 'empty', framed: 'framed', badge: 'badge', lamp: 'lamp', glow: 'glow-text', cmd: 'sh-cmd', toggle: 'sh-toggle', plate: 'sh-plate', count: 'sh-count', field: 'sh-field', row: 'sh-row', label: 'sh-label' },
    },
    log: { info() {}, warn() {}, error() {} },
  };
  return mu;
}

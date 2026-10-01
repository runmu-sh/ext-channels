/**
 * The scoped style block of μClient's ChannelsPanel.vue, every rule under `.mu-channels` (the panel root, which
 * also carries the old `.chan`). Tokens only (R-ARCH-7). Sizes scale with the dock's per-panel
 * --shell-font-size (R-PANEL-PREFS): --u is 1rem at the default. Host globals the original used (sh-cmd, sh-field,
 * sh-count, glow-text, empty) come from mu.ui.css and keep their host styling.
 */
export const CHANNELS_CSS = `
.mu-channels { --u: var(--shell-font-size, 15px); height: 100%; display: flex; flex-direction: column; background: var(--bg-elev); min-height: 0; font-size: var(--u); box-sizing: border-box; }
.mu-channels .awaiting, .mu-channels .rail-empty, .mu-channels .msgs .empty { color: var(--fg-faint); font-style: normal; font-size: calc(var(--u) * .64); letter-spacing: .14em; text-transform: uppercase; }
.mu-channels .awaiting { padding: 10px; margin: 0; }
.mu-channels .rail { display: flex; flex-wrap: wrap; gap: 2px; padding: 4px 6px; border-bottom: 1px solid var(--accent); flex: none; }
.mu-channels .cc { display: inline-flex; gap: .6ch; align-items: center; border: 0; background: none; padding: 2px .8ch; min-height: 24px; font-size: calc(var(--u) * .66); letter-spacing: .14em; text-transform: uppercase; color: var(--fg-dim); transition: color .12s ease, background-color .12s ease; }
.mu-channels .cc:hover { color: var(--fg); background: var(--tint-toggle); }
.mu-channels .cc.on { color: var(--bg-deep); background: var(--accent); }
.mu-channels .cc.tinted:not(.on) .name { color: var(--chan); }
.mu-channels .cc.mention:not(.on) .name { color: var(--gold); }
.mu-channels .cc.muted .name { opacity: .5; text-decoration: line-through; }
.mu-channels .at { color: var(--gold); }
.mu-channels .online { color: var(--ok); font-size: calc(var(--u) * .6); letter-spacing: 0; }
.mu-channels .cc.on .at, .mu-channels .cc.on .online { color: inherit; }
.mu-channels .bd { font-size: calc(var(--u) * .6); }
.mu-channels .cv { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.mu-channels .head { display: flex; align-items: baseline; gap: 1ch; padding: 5px 10px; border-bottom: 1px solid var(--border); flex: none; }
.mu-channels .title { color: var(--accent-bright); text-transform: uppercase; letter-spacing: .16em; font-size: calc(var(--u) * .78); }
.mu-channels .topic { color: var(--fg-dim); font-size: calc(var(--u) * .72); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mu-channels .tools { margin-left: auto; display: flex; gap: 2px; flex-wrap: wrap; justify-content: flex-end; }
.mu-channels .t { font-size: calc(var(--u) * .68); }
.mu-channels .ccfg { display: flex; flex-wrap: wrap; gap: 12px; padding: 6px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.mu-channels .cfg-row { display: flex; align-items: center; gap: 6px; font-size: calc(var(--u) * .72); color: var(--fg-dim); }
.mu-channels .sel { color: var(--fg); background: var(--bg-deep); font-size: calc(var(--u) * .72); min-height: 24px; padding: 2px; }
.mu-channels .swatches { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.mu-channels .sw { width: 24px; height: 24px; border: 1px solid var(--border-bright); background: var(--bg); display: inline-grid; place-items: center; color: var(--fg-faint); font-size: calc(var(--u) * .72); transition: border-color .12s ease; }
.mu-channels .sw:not(.none)::before { content: ''; width: 14px; height: 14px; background: var(--sw); }
.mu-channels .sw:hover { border-color: var(--accent); }
.mu-channels .sw.on { border-color: var(--accent-bright); box-shadow: inset 0 0 0 1px var(--accent-bright); }
.mu-channels .csearch { display: flex; align-items: center; gap: .5ch; padding: 3px 10px; border-bottom: 1px solid var(--accent); background: var(--bg-deep); flex: none; }
.mu-channels .s-glyph { color: var(--accent); }
.mu-channels .csearch input { flex: 1; min-width: 0; background: transparent; border: 0; color: var(--fg); font-size: calc(var(--u) * .82); padding: 2px 0; }
.mu-channels .csearch input::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.mu-channels .cnt { color: var(--fg-dim); font-size: calc(var(--u) * .72); min-width: 3.5em; text-align: right; }
.mu-channels .cnt.err { color: var(--alert); }
.mu-channels .s-btn { font-size: calc(var(--u) * .68); }
.mu-channels .msgs { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 10px; line-height: 1.5; display: flex; flex-direction: column; }
.mu-channels .msgs > :first-child { margin-top: auto; }
.mu-channels .msgs .empty { margin: 0; }
.mu-channels .msg { padding: 1px 0; font-size: calc(var(--u) * .85); overflow-wrap: anywhere; }
.mu-channels .mts { color: var(--fg-faint); font-size: .72em; margin-right: .6ch; user-select: none; }
.mu-channels .sender { color: var(--chan, var(--gold)); margin-right: .6ch; }
.mu-channels .text { color: var(--fg); white-space: pre-wrap; }
.mu-channels .msg.mention { border-left: 2px solid var(--gold); padding-left: 7px; margin-left: -9px; box-shadow: -4px 0 8px -6px var(--gold); }
.mu-channels .msg.hit { background: var(--tint-hit); }
.mu-channels .msg.hit.active { background: var(--tint-hit-active); outline: 1px solid var(--accent); outline-offset: -1px; }
.mu-channels .reacts { margin-left: .5ch; }
.mu-channels .react { border: 0; border-bottom: 1px solid var(--border-bright); background: none; color: var(--fg-dim); font-size: .72em; padding: 0 4px; margin-left: 3px; }
.mu-channels .composer { display: flex; align-items: center; gap: .6rem; padding: 6px 10px; border-top: 1px solid var(--accent); flex: none; }
.mu-channels .chev { color: var(--accent-bright); }
.mu-channels .in { flex: 1; min-width: 0; min-height: 24px; background: transparent; outline: none; color: var(--fg); caret-color: var(--accent-bright); font-size: calc(var(--u) * .85); padding: 2px; }
.mu-channels .in::placeholder { color: var(--fg-faint); font-style: normal; letter-spacing: .14em; text-transform: uppercase; font-size: calc(var(--u) * .66); opacity: 1; }
.mu-channels .composer:focus-within { box-shadow: inset 0 0 0 2px var(--accent-bright); }
`;

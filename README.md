# Channels (`@runmu.sh/ext-channels`, id `channels`)

The Channels panel of [μClient](https://runmu.sh) (R-CHAN): the game's chat channels as a rail of chips, the selected channel's messages with search, a colour and alert setting per channel, a ❯ composer, and a pop-out per channel.

First-party, on the [marketplace](https://runmu.sh/marketplace/x/channels). Install it from **☰ → Extensions → Discover**, then turn it on per world in **Extensions → Installed**. Until 1.0.0 the panel was part of the client core. The core still tracks every session's channels. This extension only draws them.

## Where the channels come from
The host keeps the channels per session and fills them from:

| Source | What |
|---|---|
| GMCP `Comm.Channel.List` | The channels: `name`, `caption` (shown), `command` (what to send) |
| GMCP `Comm.Channel.Text` | A message: `channel`, `talker`/`sender`/`from`, `text` (ANSI stripped), `reactions` (`{ "+": 2 }`) |
| GMCP `Comm.Channel.Players` | The online counts on the chips |
| Another extension: `mu.channels.push(channel, sender, text)` | A message |

The host also tracks mentions (a message that names your character, from `Char.Name` / `Char.Status` or the *Character name* setting), unread counts, alerts and the per-world settings. This panel reads them with `mu.channels.watch`.

## What it shows
- **Rail**: one chip per channel. The active chip is a solid accent fill. A chip shows the unread count as a badge, `@` and a gold name when an unread message mentions you, the online count in `--ok`, and a struck-through name when the channel is muted. With a colour set, the chip name takes it. Click a chip to switch to it. Right-click it to open its settings.
- **Head**: the channel title, its topic in italics, and the tools **Settings**, **Search**, **Mute / Unmute** and **Pop out**.
- **Settings strip**: the colour swatches (default, then the SDK's `CHANNEL_COLORS`: accent, bright accent, gold, alert, ok, text, dim text; theme tokens only, so a colour follows the theme) and **Alerts**: *Every message*, *Mentions only* (default) or *None*. Both are saved per world through `mu.channels.configure`.
- **Search** (also **Ctrl+F** / **⌘F** inside the panel) follows the terminal's rules. Plain text matches case-insensitively, and `/regex/flags` is a regular expression. The search runs over `sender: text`. Matching rows take the terminal's hit tint and the active hit is outlined. The count shows `n/N`, *no match*, or *not a valid regex*. **Enter** or **↑** goes to the previous hit, **Shift+Enter** or **↓** to the next, and **Esc** closes the search and clears the query.
- **Messages**: the time, the sender (in the channel colour, gold by default) and the text, one line each, with the reactions after the text. A message that mentions you has a gold left rule. The view keeps to the bottom as messages arrive, unless a search hit is active.
- **Composer**: `❯ message <channel>`. Enter sends through the input pipeline with the world's *Reply format* (`{channel} {text}`), via `mu.channels.send`.
- **Pop out** opens the channel as its own panel (`channel`, instance = the channel key, titled `Channel · <caption>`). The pop-out shows only that channel, keeps its own composer and survives a layout reload. While it is shown it marks its channel read. If the game no longer has the channel, it says *channel X is not open here*.

Reading a channel clears its unread count and mention: the main panel selects the channel, and a pop-out marks its own channel read. Text scales with the dock's per-panel font size (`--shell-font-size`). The message list is the focus region `channels`, so **Alt+C** (*Go to channels*) focuses it.

## Behaviour
- Panel `channels`: singleton, right bottom, Views order 20, title *Channels*.
- Panel `channel`: not a singleton, right bottom, not in Views, order 21, opened with `params.channel` (and `params.instance`).
- The first `Comm.Channel.*` package of a session adds `channels` if it is not open (R-AUTO-PANELS). The host does this once per world on this device, so a panel you closed stays closed.
- It sends nothing to the game except what you type in the composer. It adds no `Core.Supports` of its own: the backend's base set already has `Comm.Channel 1`.

## Settings
The extension has no settings page of its own. The channel settings are the strip in the panel (colour, alerts, mute). *Reply format* and *Character name* are core settings, so they stay in μClient's Settings.

## SDK
Needs SDK 1.7. It uses `mu.channels.get`, `watch`, `select`, `markRead`, `send` and `configure`, plus `CHANNEL_COLORS`, `mu.panels.register`, `mu.panels.vue`, `mu.panels.open` (with `opts`), `mu.panels.autoAdd`, `mu.gmcp.on` and `mu.ui.style`. It exports no API.

## Develop
Made with `npm create @runmu.sh/extension` ([the quickstart](https://runmu.sh/docs/extensions/quickstart)).

```sh
npm install
npm run build        # src/index.ts → dist/index.js, then the manifest check
npm run typecheck
npm test             # tests/*.test.mjs: the pure helpers, and the panel rendered through a fake mu
npm run dev          # dev server with hot reload (☰ → Extensions → Advanced → Developer)
```

| Path | What |
|---|---|
| `src/index.ts` | `setup(mu)`: the stylesheet, both panels, the auto-add |
| `src/panel.ts` | The panel, a Vue component in render functions (`vue` is the host's, external) |
| `src/logic.ts` | The pure parts: matcher and search, count and stepping, keys, colour and tint, rail, selection and unread |
| `src/style.ts` | The CSS, every rule under `.mu-channels`, tokens only |
| `src/copy.ts` | Every visible string |

## Licence
MIT

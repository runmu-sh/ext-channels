# Changelog

## 1.2.0

- The channel settings are the extension's own: mute, alerts and colour per channel (`config`, per world), *Reply format* and *Channel alerts*, under Settings → Extensions → Channels. Your settings from μClient carry over the first time it runs (`migrateFrom` `channels.config`, `channels.replyFormat`, `alerts.channels`).
- *Channel alerts* is also a **Channels** section on Settings → Alerts.
- The extension raises channel alerts itself (`mu.notify.mention`), by each channel's alert setting. A message the game numbers alerts once across your clients.
- A muted channel shows no unread count or `@` on its chip. Unmuting marks it read.
- **Alt+C** (*Go to channels*, `focus.channels`) is the extension's command now, so you can rebind it in Settings → Keys. It focuses the open Channels panel, else a popped-out channel.
- Message rows are targets of the context kind `channels.message` and chips of `channels.channel`, which the extension registers (they replace `channel-message` and `channel`). A chip's right-click still opens its settings unless another extension added an entry to its menu.
- Needs μClient's extension SDK 1.14. It no longer uses `mu.channels.configure` or `ChannelView.muted`, `alert` and `color`.

## 1.1.0

- Messages from the same person within five minutes are grouped, so a run of lines reads as one.
- A **new** divider shows where your unread messages begin when you open a channel.
- If you have scrolled up, a **↓ N new messages** button counts what arrived and takes you back down.
- Reply to someone with the **↩** tool on a message or from its right-click menu (which can also copy the message). A *Reply to X* bar shows above the composer, and **Esc** or **Cancel** drops it.
- The Channels tab shows your unread count.
- The Mute button reads **Muted** while a channel is muted.
- Better for screen readers and the keyboard: chips and messages say what they are, and **↑ ↓ Home End** move through the messages.
- Needs μClient's extension SDK 1.12.

## 1.0.0

- First version: the Channels panel moved out of the μClient core into its own extension, on SDK 1.7 (`mu.channels.get/watch/select/markRead/send/configure`, `mu.panels.open` with `opts`). Same panel ids (`channels`, `channel`), testids, copy and look as the core panel it replaces. The core keeps the channel state, GMCP handling, mentions, alerts and per-world settings.

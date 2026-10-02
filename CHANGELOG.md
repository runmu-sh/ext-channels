# Changelog

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

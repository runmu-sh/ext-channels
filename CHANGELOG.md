# Changelog

## 1.0.0

- First version: the Channels panel moved out of the μClient core into its own extension, on SDK 1.7 (`mu.channels.get/watch/select/markRead/send/configure`, `mu.panels.open` with `opts`). Same panel ids (`channels`, `channel`), testids, copy and look as the core panel it replaces. The core keeps the channel state, GMCP handling, mentions, alerts and per-world settings.

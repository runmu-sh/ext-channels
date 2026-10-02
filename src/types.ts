/**
 * The GMCP payloads the Channels panel shows, as the host's bundled channel adapter reads them (the panel itself
 * reads the host's channel model, `mu.channels`). The same shapes are the manifest's payload contracts
 * (`muclient.contributes.gmcp[0].messages`, schema/*.json). Extra fields are allowed everywhere.
 */

/** `Comm.Channel.List`: the channels you can talk on, in rail order. A bare string is a channel name. */
export type CommChannelList = Array<string | {
  /** The channel's name (its key, case-insensitive). */
  name: string;
  /** What the rail and the title show (default: the name). */
  caption?: string;
  /** What the composer sends before your text (default: the name), through the world's Reply format. */
  command?: string;
}>;

/** `Comm.Channel.Text`: one message. ANSI colour codes in `text` are stripped. */
export interface CommChannelText {
  channel: string;
  /** The speaker; `sender` and `from` are read when `talker` is absent. */
  talker?: string;
  sender?: string;
  from?: string;
  text: string;
  /** Reaction → count, shown after the text: `{ "+": 2 }`. */
  reactions?: Record<string, number>;
}

/**
 * `Comm.Channel.Players`: who is on which channel, for the online counts on the chips. Any of:
 * `{ "<channel>": ["Orrin", …] | <count> }`, `{ channel, players: [...] }`, `[{ name, channels: [...] }]`,
 * `[{ channel, players: [...] | count }]`.
 */
export type CommChannelPlayers = Record<string, unknown> | Array<Record<string, unknown>>;

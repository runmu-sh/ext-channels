/**
 * The extension's own settings (1.2.0) and the context kinds it publishes. Until 1.1.0 the host kept the
 * per-channel settings (`channels.config`), the reply format (`channels.replyFormat`) and the Channel alerts
 * toggle (`alerts.channels`) as core prefs; each setting here names the pref it replaces in `migrateFrom`, so
 * the host copies the player's stored values once. The same items are declared in the manifest
 * (`muclient.contributes.settings`), which lets the host migrate them before the extension activates.
 */
import type { ChannelMessage, ContextKindSpec, JsonSchema, SettingsSchema } from '@muclient/sdk';
import { COPY } from './copy.ts';

/** Setting keys (stored as `ext.channels.<key>`). */
export const SETTING = { config: 'config', replyFormat: 'replyFormat', alerts: 'alerts' } as const;

/** The default reply format: the channel's command, then the text. */
export const DEFAULT_REPLY_FORMAT = '{channel} {text}';

export const SETTINGS: SettingsSchema = {
  title: COPY.title,
  items: [
    { key: SETTING.config, label: COPY.cfgLabel, kind: 'json', default: {}, scope: 'world', hint: COPY.cfgHint, migrateFrom: 'channels.config' },
    { key: SETTING.replyFormat, label: COPY.replyFormat, kind: 'text', default: DEFAULT_REPLY_FORMAT, scope: 'both', hint: COPY.replyFormatHint, migrateFrom: 'channels.replyFormat' },
    { key: SETTING.alerts, label: COPY.alertsSetting, kind: 'toggle', default: true, scope: 'both', hint: COPY.alertsSettingHint, migrateFrom: 'alerts.channels' },
  ],
  sections: [{ page: 'alerts', title: COPY.title, keys: [SETTING.alerts] }],
};

/** The context kinds this extension registers and publishes targets of. */
export const KIND_MESSAGE = 'channels.message';
export const KIND_CHANNEL = 'channels.channel';

/** The data of the two kinds, typed for `mu.menus.context` (this extension's entries and any other extension's). */
export interface ChannelMessageData { key: string; message: ChannelMessage }
declare module '@muclient/sdk' {
  interface ContextKinds {
    'channels.message': ChannelMessageData;
    'channels.channel': { key: string };
  }
}

const MESSAGE_SCHEMA: JsonSchema = {
  type: 'object', required: ['id', 'ts', 'sender', 'text', 'mention'],
  properties: { id: { type: 'number' }, ts: { type: 'number' }, sender: { type: 'string' }, text: { type: 'string' }, mention: { type: 'boolean' }, reactions: { type: 'object' } },
};
export const KINDS: ContextKindSpec[] = [
  { id: KIND_MESSAGE, title: COPY.kindMessage, schema: { type: 'object', required: ['key', 'message'], properties: { key: { type: 'string' }, message: MESSAGE_SCHEMA } } },
  { id: KIND_CHANNEL, title: COPY.kindChannel, schema: { type: 'object', required: ['key'], properties: { key: { type: 'string' } } } },
];

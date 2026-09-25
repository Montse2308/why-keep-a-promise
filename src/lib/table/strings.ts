/**
 * The UI strings the table's client script needs. They are resolved at build time and passed to
 * the script as JSON, so the script never bundles the dictionaries.
 */
import type { UiKey } from '../i18n';

export const CLIENT_STRING_KEYS = [
  'table.summary.promised',
  'table.summary.not-promised',
  'table.summary.roll',
  'table.summary.dont',
  'table.switch.same',
  'table.switch.switched',
  'table.promiser.you',
  'table.promiser.none',
  'table.meter.label',
  'table.meter.value',
  'table.die.label',
  'table.announce.die',
  'table.announce.outcome',
  'table.announce.reset',
  'table.reveal.title',
  'table.announce.reveal',
  'table.rate',
  'table.switch.illustrative',
] as const satisfies readonly UiKey[];

export type ClientStringKey = (typeof CLIENT_STRING_KEYS)[number];
export type ClientStrings = Record<ClientStringKey, string>;

export function clientStrings(translate: (key: UiKey) => string): ClientStrings {
  return Object.fromEntries(CLIENT_STRING_KEYS.map((key) => [key, translate(key)])) as ClientStrings;
}

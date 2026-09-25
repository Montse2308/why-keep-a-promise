/**
 * The UI strings the best-reply script needs, resolved at build time and passed as JSON, so the
 * script never bundles the dictionaries.
 */
import type { UiKey } from '../i18n';

export const PD_STRING_KEYS = [
  'pd.col.cooperate',
  'pd.col.defect',
  'pd.choice.cooperate',
  'pd.choice.defect',
  'pd.alt.cooperate',
  'pd.alt.defect',
  'pd.ask',
  'pd.result',
  'pd.tag.pick',
  'pd.tag.best',
  'pd.tag.equilibrium',
  'pd.tag.better',
  'pd.done.dominant',
  'pd.done.equilibrium',
  'pd.announce.reset',
] as const satisfies readonly UiKey[];

export type PdStringKey = (typeof PD_STRING_KEYS)[number];
export type PdStrings = Record<PdStringKey, string>;

export function pdStrings(translate: (key: UiKey) => string): PdStrings {
  return Object.fromEntries(PD_STRING_KEYS.map((key) => [key, translate(key)])) as PdStrings;
}

/**
 * The UI strings the curve's client script needs, resolved at build time and passed as JSON, so the
 * script never bundles the dictionaries.
 */
import type { UiKey } from '../i18n';

export const CURVE_STRING_KEYS = [
  'curve.value',
  'curve.trust.value',
  'curve.series.personal',
  'curve.series.partner',
  'curve.series.general',
  'curve.pulls.yes',
  'curve.pulls.no',
  'curve.announce.trust',
  'curve.announce.payoff',
] as const satisfies readonly UiKey[];

export type CurveStringKey = (typeof CURVE_STRING_KEYS)[number];
export type CurveStrings = Record<CurveStringKey, string>;

export function curveStrings(translate: (key: UiKey) => string): CurveStrings {
  return Object.fromEntries(CURVE_STRING_KEYS.map((key) => [key, translate(key)])) as CurveStrings;
}

/**
 * The curve, read once at build time. Import this only from Astro components, never from a client
 * script: the raw file carries model details the page must not ship. `FINDING` is only for
 * /finding's chart, behind act 5's lock (ADR 0017).
 */
import raw from '../../data/curve.json';
import { readCurve } from './curve';
import { readFinding } from './finding';

export const CURVE = readCurve(raw);
export const FINDING = readFinding(raw);

/**
 * The curve, read once at build time. Import this only from Astro components, never from a client
 * script: the raw file carries model details the page must not ship.
 */
import raw from '../../data/curve.json';
import { readCurve } from './curve';

export const CURVE = readCurve(raw);

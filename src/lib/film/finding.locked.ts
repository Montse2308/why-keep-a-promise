/**
 * Stands in for ./finding.ts in a build while the lock is closed (ADR 0034, `lockFinding` in
 * astro.config.mjs): chapter 7 ends at the sealed envelope, with no beats after it.
 */
import type { Beat } from '../chapters';

export const FINDING_BEATS: readonly Beat[] = [];

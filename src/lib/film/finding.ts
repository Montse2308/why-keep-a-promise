/**
 * Chapter 7's finding (ADR 0034): the beats that follow the sealed envelope once the lock is open,
 * each with its length in screens. Their captions are the part of chapter 7's Markdown after its
 * `<!-- lock -->` mark, and ./chapters/Finding.astro draws them, with the curve and its control.
 *
 * Behind the lock: until the working paper is public, a build resolves this module to
 * ./finding.locked.ts (`lockFinding` in astro.config.mjs), so a locked film does not even know these
 * beats exist, and `npm run verify:dist` fails if the first one's id reaches dist/.
 */
import type { Beat } from '../chapters';

export const FINDING_BEATS: readonly Beat[] = [
  { id: 'third-reason', screens: 1.2 },
  { id: 'alike', screens: 1.2 },
  { id: 'trust', screens: 1.1 },
  { id: 'middle', screens: 1.2 },
  { id: 'worlds', screens: 1.3 },
  { id: 'curve', screens: 2.6 },
  { id: 'chance', screens: 1.4 },
];

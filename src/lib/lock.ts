/**
 * The lock (ADR 0034). Chapter 7's finding (its prose, the curve and its control), /finding and the
 * engine part of /how-its-built render only once the working paper is public on SSRN, that is, once
 * its link in src/config.ts is no longer a placeholder, or on the dev server. Otherwise chapter 7
 * ends at its sealed envelope, /finding and the notebook's entry for it show their title and the
 * status sentence, nothing links to /finding, and `npm run verify:dist` fails if anything locked
 * reached dist/.
 */

/** A link still to be written at step 3 of docs/launch-checklist.md, such as `SSRN_URL_PENDING`. */
export function isPending(link: string): boolean {
  return link.endsWith('_PENDING');
}

export function findingUnlocked(ssrn: string, dev: boolean): boolean {
  return !isPending(ssrn) || dev;
}

/**
 * The status sentence (docs/content-rules.md, rule (b)) split around its `{title}`: the words before
 * the working paper's title and after it. Shown the same in both states of the lock.
 */
export function statusParts(sentence: string): readonly [string, string] {
  const parts = sentence.split('{title}');
  if (parts.length !== 2) throw new Error(`The status sentence must hold {title} once: "${sentence}"`);
  return [parts[0] ?? '', parts[1] ?? ''];
}

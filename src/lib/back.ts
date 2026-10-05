/**
 * The way back from the notebook to the film (ADR 0029). The film keeps what was played in its own
 * entry of the tab's history; a link back to it opens a new entry, empty. So when the page before
 * this one, in this tab, was the film the link leads to, the link goes back instead, to that entry.
 */

/**
 * Whether a link to `target` should go back in the tab's history: the page came from that same
 * film (the referrer, without its fragment, is the target's page) and there is an entry to go back to.
 */
export function goesBack(referrer: string, target: string, historyLength: number): boolean {
  if (historyLength < 2 || !referrer) return false;
  try {
    const from = new URL(referrer);
    const to = new URL(target);
    return from.origin === to.origin && from.pathname === to.pathname;
  } catch {
    return false;
  }
}

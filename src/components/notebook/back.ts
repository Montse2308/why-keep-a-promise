/**
 * The notebook's links back to the film (`data-film-back`), part of the notebook's script, which
 * every page loads (ADR 0025). If the visitor came from that film, a press goes back in the tab's
 * history, to the film's own entry and what was played in it (src/lib/back.ts, ADR 0029). A press
 * with a modifier, or without JavaScript, stays a plain link.
 */
import { goesBack } from '../../lib/back';

export function back(doc: Document = document): void {
  doc.querySelectorAll<HTMLAnchorElement>('a[data-film-back]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!goesBack(doc.referrer, link.href, history.length)) return;
      event.preventDefault();
      history.back();
    });
  });
}

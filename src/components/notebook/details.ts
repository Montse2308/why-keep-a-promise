/**
 * The tab's title and the console's note (src/lib/details.ts, ADR 0025), part of the notebook's
 * script, which every page loads. The lines come from the page (BaseLayout.astro writes them into
 * `data-away` and `data-console` on <body>), in its language.
 */
import { consoleNote, threadOf, type Thread } from '../../lib/details';

export function details(doc: Document = document): void {
  const { away, console: line, name } = doc.body.dataset;
  if (away) {
    const lines = JSON.parse(away) as Record<Thread, string>;
    const title = doc.title;
    doc.addEventListener('visibilitychange', () => {
      const thread = threadOf(doc.querySelector<HTMLElement>('[data-film]')?.dataset.thread);
      doc.title = doc.visibilityState === 'hidden' ? lines[thread] : title;
    });
  }
  if (line && name) console.info(...consoleNote(name, line));
}

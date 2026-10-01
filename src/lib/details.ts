/**
 * Two small details of every page (ADR 0025). The tab's title: when the visitor goes to another
 * tab, it changes to a line about the promise, the one the film's spool holds at that moment, and it
 * comes back when they return. The console: a short note for whoever opens the developer tools,
 * with the link to /how-its-built. src/components/notebook/details.ts applies both.
 */

/** The thread's states, as the film's spool says them (film.ts). */
export const THREADS = ['none', 'tied', 'kept', 'broken'] as const;
export type Thread = (typeof THREADS)[number];

/** The line for each state of the thread; `none` also on the notebook's pages, where there is no film. */
export const AWAY_KEYS = {
  none: 'tab.away.none',
  tied: 'tab.away.tied',
  kept: 'tab.away.kept',
  broken: 'tab.away.broken',
} as const satisfies Record<Thread, `tab.away.${Thread}`>;

/** The thread a page's film holds, from its `data-thread`; `none` before any promise and off the film. */
export function threadOf(value: string | undefined): Thread {
  return (THREADS as readonly string[]).includes(value ?? '') ? (value as Thread) : 'none';
}

/** The console's note: the project's name, set apart, then the line with the link. */
export function consoleNote(name: string, line: string): readonly [string, string, string] {
  return [`%c${name}%c ${line}`, 'font: italic 900 1.1em Georgia, serif; color: #8a6500', 'font: inherit; color: inherit'];
}

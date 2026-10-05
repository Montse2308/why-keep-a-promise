/**
 * Chapter 7's controller (MyResearch.astro). It has no choices: the stage opens the envelope as the
 * page scrolls (film.ts), and, with the sound on, the seal sounds when it comes into view.
 */
import type { FilmContext } from '../context';

export function myResearch(film: FilmContext): void {
  film.onSight(film.root.querySelector('[data-envelope] .envelope__seal'), 'stamp', 0.75);
}

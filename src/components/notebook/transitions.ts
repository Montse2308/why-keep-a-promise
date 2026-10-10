/**
 * The transition between two pages of the notebook is the browser's own, asked for in CSS by each
 * of them (SubpageView.astro). It needs both pages to ask, and the film never does: on the way
 * there, or anywhere that is not a notebook page, the page lets the transition go before the browser
 * aborts it and logs that as an error. Letting it go rejects the transition's `ready`, which nothing
 * here waits on, so that rejection is caught too. Part of the notebook's script, which every page
 * loads.
 */
import { routeOf } from '../../lib/routes';

export function transitions(win: Window = window): void {
  win.addEventListener('pageswap', (event: PageSwapEvent) => {
    if (!event.viewTransition) return;
    const to = event.activation?.entry?.url;
    const url = to ? new URL(to) : null;
    const route = url && url.origin === win.location.origin ? routeOf(import.meta.env.BASE_URL, url.pathname) : null;
    if (route === null || route === 'home') {
      event.viewTransition.ready.catch(() => undefined);
      event.viewTransition.skipTransition();
    }
  });
}

// The notebook's transitions (7.5.5): a page of the notebook lets the browser's transition go on the
// way to the film or off the site, and the rejection that letting it go leaves behind is caught, so
// the console stays clean (8.6).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { transitions } from '../src/components/notebook/transitions';

type Swap = (event: PageSwapEvent) => void;

const ORIGIN = 'https://example.org';
const base = import.meta.env.BASE_URL;

/** A window with one `pageswap` listener, and a transition whose `ready` rejects once skipped. */
function swapTo(url: string) {
  let listener: Swap | undefined;
  const win = {
    location: { origin: ORIGIN },
    addEventListener: (type: string, fn: Swap) => {
      if (type === 'pageswap') listener = fn;
    },
  } as unknown as Window;
  transitions(win);
  let reject: (reason: unknown) => void = () => undefined;
  const ready = new Promise<void>((_, no) => {
    reject = no;
  });
  const viewTransition = {
    ready,
    skipTransition: vi.fn(() => reject(new DOMException('Transition was skipped.', 'AbortError'))),
  };
  listener?.({ viewTransition, activation: { entry: { url } } } as unknown as PageSwapEvent);
  return viewTransition;
}

const unhandled = vi.fn();
process.on('unhandledRejection', unhandled);
afterEach(() => unhandled.mockClear());
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("the notebook's transitions", () => {
  it('let the transition go on the way to the film, and catch what that rejects', async () => {
    const transition = swapTo(`${ORIGIN}${base}`);
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    await settle();
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('let it go off the site too', async () => {
    const transition = swapTo('https://papers.ssrn.com/');
    expect(transition.skipTransition).toHaveBeenCalledOnce();
    await settle();
    expect(unhandled).not.toHaveBeenCalled();
  });

  it('keep it between two pages of the notebook', () => {
    const transition = swapTo(`${ORIGIN}${base}dilemma/`);
    expect(transition.skipTransition).not.toHaveBeenCalled();
  });
});

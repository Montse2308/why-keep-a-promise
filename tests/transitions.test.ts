// The notebook's transitions (7.5.5): a page of the notebook lets the browser's transition go on the
// way to the film or off the site, and catches the rejection that letting it go leaves behind, so the
// console stays clean (8.6). Vitest fails the run on a rejection nobody handles.
import { describe, expect, it, vi } from 'vitest';
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
  const caught = vi.spyOn(ready, 'catch');
  const skip = vi.fn(() => reject(new DOMException('Transition was skipped.', 'AbortError')));
  listener?.({ viewTransition: { ready, skipTransition: skip }, activation: { entry: { url } } } as unknown as PageSwapEvent);
  return { caught, skip };
}

describe("the notebook's transitions", () => {
  it('let the transition go on the way to the film, its rejection caught first', () => {
    const { caught, skip } = swapTo(`${ORIGIN}${base}`);
    expect(skip).toHaveBeenCalledOnce();
    expect(caught).toHaveBeenCalledOnce();
    expect(caught.mock.invocationCallOrder[0]).toBeLessThan(skip.mock.invocationCallOrder[0] ?? 0);
  });

  it('let it go off the site too', () => {
    const { caught, skip } = swapTo('https://papers.ssrn.com/');
    expect(skip).toHaveBeenCalledOnce();
    expect(caught).toHaveBeenCalledOnce();
  });

  it('keep it between two pages of the notebook', () => {
    const { caught, skip } = swapTo(`${ORIGIN}${base}dilemma/`);
    expect(skip).not.toHaveBeenCalled();
    expect(caught).not.toHaveBeenCalled();
  });
});

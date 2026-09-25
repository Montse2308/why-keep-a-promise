import type { Rng } from './game';

/** Deterministic RNG for tests: returns the given values in order, then fails. */
export function sequence(...values: number[]): Rng {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error('RNG sequence exhausted');
    return values[index++] as number;
  };
}

/** An RNG that must never be called. */
export const noRng: Rng = () => {
  throw new Error('RNG should not be called');
};

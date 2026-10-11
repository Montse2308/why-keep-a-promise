import { describe, expect, it } from 'vitest';
import live from './live.ts?raw';
import { PACE, advance, buttonLabel, linePath, nextRun } from './live';

describe('the live engine, free of the engine (ADR 0042)', () => {
  it('imports only types, so the page never loads the engine before the worker does', () => {
    const imports = [...live.matchAll(/^import\s+(type\s+)?/gm)];
    expect(imports.length).toBeGreaterThan(0);
    expect(imports.every((match) => match[1])).toBe(true);
  });
});

describe('advance', () => {
  it('plays at PACE generations a second, about 30', () => {
    expect(PACE).toBe(30);
    expect(advance(0, 1, 401)).toBe(30);
    expect(advance(10, 0.5, 401)).toBe(25);
  });

  it('never goes past what arrived, nor moves before anything has', () => {
    expect(advance(0, 10, 12)).toBe(11);
    expect(advance(0, 10, 0)).toBe(0);
    expect(advance(400, 1, 401)).toBe(400);
    expect(advance(5, -1, 401)).toBe(5);
  });
});

describe('linePath', () => {
  const generations = [
    [100, 100],
    [98, 103],
    [97, 110],
  ];

  it("draws one run's line from generation 0, its count up from the bottom", () => {
    expect(linePath(generations, 0, 2, 200)).toBe('M0 100L1 102L2 103');
    expect(linePath(generations, 1, 1.6, 200)).toBe('M0 100L1 97');
  });

  it('stops at what arrived', () => {
    expect(linePath(generations, 0, 400, 200)).toBe('M0 100L1 102L2 103');
    expect(linePath([], 0, 3, 200)).toBe('');
  });
});

describe('the main button and the highlighted run', () => {
  it('runs, pauses and resumes with one label at a time', () => {
    expect(['idle', 'starting', 'running', 'paused', 'done'].map((phase) => buttonLabel(phase as Parameters<typeof buttonLabel>[0]))).toEqual([
      'run',
      'starting',
      'pause',
      'resume',
      'run',
    ]);
  });

  it('goes round the runs', () => {
    expect(nextRun(0, 40)).toBe(1);
    expect(nextRun(39, 40)).toBe(0);
    expect(nextRun(3, 0)).toBe(0);
  });
});

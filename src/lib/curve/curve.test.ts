import { describe, expect, it } from 'vitest';
import raw from '../../data/curve.json';
import { payoffLevels, pullWindow, readCurve, REASONS, SERIES_IDS } from './curve';

type Raw = typeof raw;
const clone = (): Raw => structuredClone(raw);

describe('curve.json provenance (ADR 0010)', () => {
  it('is schema version 1', () => {
    expect(raw.schemaVersion).toBe(1);
  });

  it('names the engine commit as 40 hex characters, with its seed, command and generation time', () => {
    expect(raw.provenance.engineCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(raw.provenance.rngSeed).toEqual(expect.any(String));
    expect(raw.provenance.rngSeed.length).toBeGreaterThan(0);
    expect(raw.provenance.command).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(raw.provenance.generatedAt))).toBe(false);
  });

  it('has 18 grid rows, strictly ordered by background trust, as fractions over 100', () => {
    expect(raw.grid).toHaveLength(18);
    for (const row of raw.grid) {
      expect(row.beta0.den).toBe(100);
      expect(Number.isInteger(row.beta0.num)).toBe(true);
    }
    const trust = raw.grid.map((row) => row.beta0.num);
    trust.slice(1).forEach((value, i) => expect(value).toBeGreaterThan(trust[i] ?? Infinity));
  });

  it('has only integer payoffs', () => {
    for (const row of raw.grid) {
      for (const value of Object.values(row.payoff)) expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('carries the series PGA, MC-b and GA', () => {
    expect(raw.series.map((series) => series.id).sort()).toEqual(['GA', 'MC-b', 'PGA']);
    expect(Object.values(SERIES_IDS).sort()).toEqual(['GA', 'MC-b', 'PGA']);
  });

  it('describes itself as a comparison across worlds (docs/content-rules.md, rule (e))', () => {
    expect(raw.note).toMatch(/comparison across worlds/i);
  });
});

describe('readCurve', () => {
  const curve = readCurve(raw);

  it('keeps one row per grid row, with background trust out of 100', () => {
    expect(curve.rows).toHaveLength(raw.grid.length);
    expect(curve.rows.map((row) => row.trust)).toEqual(raw.grid.map((row) => row.beta0.num));
  });

  it('keeps only background trust, the payoff of each reason and whether personal guilt pulls', () => {
    for (const row of curve.rows) {
      expect(Object.keys(row).sort()).toEqual(['payoff', 'pulls', 'trust']);
      expect(Object.keys(row.payoff).sort()).toEqual([...REASONS].sort());
    }
  });

  it('pays personal guilt the higher payoff exactly where it pulls', () => {
    const [low, high] = payoffLevels(curve);
    for (const row of curve.rows) expect(row.payoff.personal).toBe(row.pulls ? high : low);
  });

  it('reads the axis and the peak', () => {
    expect(curve.axis).toEqual({ min: raw.axis.min.num, max: raw.axis.max.num });
    expect(curve.peak).toBe(raw.peak.num);
  });

  it('finds the window where personal guilt pulls and the payoff levels', () => {
    expect(pullWindow(curve)).toEqual({ from: 15, to: 65 });
    expect(payoffLevels(curve)).toEqual([5, 10]);
  });

  it('rejects another schema version', () => {
    const bad = { ...clone(), schemaVersion: 2 };
    expect(() => readCurve(bad)).toThrow(/schemaVersion/);
  });

  it('rejects a missing series', () => {
    const bad = clone();
    bad.series = bad.series.filter((series) => series.id !== 'GA');
    expect(() => readCurve(bad)).toThrow(/series/);
  });

  it('rejects rows out of order', () => {
    const bad = clone();
    const [first, second] = bad.grid;
    if (!first || !second) throw new Error('fixture needs two rows');
    bad.grid[0] = second;
    bad.grid[1] = first;
    expect(() => readCurve(bad)).toThrow(/strictly ordered|span/);
  });

  it('rejects another denominator and a non-integer payoff', () => {
    const wrongDen = clone();
    if (wrongDen.grid[3]) wrongDen.grid[3].beta0 = { num: 3, den: 20 };
    expect(() => readCurve(wrongDen)).toThrow(/denominator 100/);

    const fractional = clone();
    if (fractional.grid[3]) fractional.grid[3].payoff.PGA = 9.5;
    expect(() => readCurve(fractional)).toThrow(/integers/);
  });

  it('rejects a peak off the grid', () => {
    const bad = { ...clone(), peak: { num: 37, den: 100 } };
    expect(() => readCurve(bad)).toThrow(/peak/);
  });
});

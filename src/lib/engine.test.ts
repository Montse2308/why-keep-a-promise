import { describe, expect, it } from 'vitest';
import { ENGINE } from '../config';
import { ENGINE_TOKEN, engineLinks, withEngine } from './engine';

describe("the engine's links (ADR 0034)", () => {
  it('links the repository and the DOI of its archived release, both from src/config.ts', () => {
    expect(engineLinks()).toBe(
      `<a href="https://github.com/Montse2308/Dilema-del-Prisionero">github.com/Montse2308/Dilema-del-Prisionero</a> (DOI <a href="https://doi.org/${ENGINE.doi}">${ENGINE.doi}</a>)`,
    );
  });

  it('fills every {engine} of the prose, and leaves the rest as written', () => {
    expect(ENGINE_TOKEN).toBe('{engine}');
    expect(withEngine('<p>The engine: {engine}.</p>')).toBe(`<p>The engine: ${engineLinks()}.</p>`);
    expect(withEngine('<p>{engine} {engine}</p>').split(ENGINE.repository)).toHaveLength(3);
    expect(withEngine('<p>{low} and {high}</p>')).toBe('<p>{low} and {high}</p>');
  });
});

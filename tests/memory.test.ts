// The film's memory in the tab (ADR 0029), as the film's code uses it: every action is noted, it is
// written only into the tab's history entry, and nothing else keeps or sends it.
import { describe, expect, it } from 'vitest';
import memory from '../src/lib/film/memory.ts?raw';
import type { Action } from '../src/lib/film/memory';

const sources = import.meta.glob<string>(['../src/components/film/*.ts', '../src/components/film/chapters/*.ts'], { query: '?raw', import: 'default', eager: true });
const film = Object.values(sources).join('\n');

const TYPES: readonly Action['type'][] = ['promise', 'round', 'column', 'message', 'decision', 'card', 'bet', 'guess', 'now', 'page'];

describe("the film's memory in the tab", () => {
  it('is noted by a controller for every action of ADR 0029', () => {
    for (const type of TYPES) expect(film, type).toContain(`film.note({ type: '${type}'`);
  });

  it('is written only into the history entry, with the rest of its state kept', () => {
    expect(film).toContain("history.replaceState(withMemory(history.state, memory), '');");
    expect(film.match(/history\.(replaceState|pushState)\(/g)).toHaveLength(1);
  });

  it('uses no storage, no cookies and no network, in the film or in the memory', () => {
    for (const [name, source] of [...Object.entries(sources), ['memory.ts', memory]]) {
      expect(source, name).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|XMLHttpRequest|WebSocket/);
    }
  });
});

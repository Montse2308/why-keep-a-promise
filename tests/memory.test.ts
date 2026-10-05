// The film's memory in the tab (ADR 0029), as the film's code uses it: every action is noted, it is
// written only into the tab's history entry, and nothing else keeps or sends it.
import { describe, expect, it } from 'vitest';
import notebook from '../src/components/notebook/Notebook.astro?raw';
import footer from '../src/components/notebook/NotebookFooter.astro?raw';
import memory from '../src/lib/film/memory.ts?raw';
import subpage from '../src/views/SubpageView.astro?raw';
import type { Action } from '../src/lib/film/memory';

const sources = import.meta.glob<string>(['../src/components/film/*.ts', '../src/components/film/chapters/*.ts'], { query: '?raw', import: 'default', eager: true });
const film = Object.values(sources).join('\n');

const TYPES: readonly Action['type'][] = ['promise', 'round', 'column', 'message', 'decision', 'card', 'bet', 'guess', 'now', 'page'];

describe("the film's memory in the tab", () => {
  it('is noted by a controller for every action of ADR 0029', () => {
    for (const type of TYPES) expect(film, type).toContain(`film.note({ type: '${type}'`);
  });

  it('plays every action back through a press, quietly: no sound, no wait, no focus moved, nothing moving', () => {
    for (const type of TYPES) expect(film, type).toContain(`film.onReplay('${type}'`);
    expect(film).toContain('if (!replaying) sound?.play(cue, after);');
    expect(film).toContain('if (replaying) next();');
    expect(film).toContain('if (!replaying) element?.focus(options);');
    expect(film).toContain("clocks[clock] = replaying ? -Infinity : performance.now();");
    expect(film).not.toMatch(/setTimeout\(land|\.focus\(\{ preventScroll|button'\)\?\.focus\(\)/);
  });

  it('is written only into the history entry, with the rest of its state kept', () => {
    expect(film).toContain("history.replaceState(withMemory(history.state, memory), '');");
    expect(film.match(/history\.(replaceState|pushState)\(/g)).toHaveLength(1);
  });

  it("comes back from the notebook's two links to the film, from the panel's own script", () => {
    expect(subpage).toMatch(/<a href=\{href\(locale, 'home', page\.film \?\? undefined\)\} data-film-back>\{back\}<\/a>/);
    expect(footer).toMatch(/<a class="footer__film" href=\{href\(locale, 'home'\)\} data-film-back>/);
    expect(notebook).toMatch(/<script>\s*import \{ back \} from '\.\/back';[\s\S]*\n\s*back\(\);[\s\S]*<\/script>/);
    expect(notebook.match(/<script/g)).toHaveLength(1);
  });

  it('uses no storage, no cookies and no network, in the film or in the memory', () => {
    for (const [name, source] of [...Object.entries(sources), ['memory.ts', memory]]) {
      expect(source, name).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|XMLHttpRequest|WebSocket/);
    }
  });
});

import { describe, expect, it } from 'vitest';
import controller from '../src/components/table/controller.ts?raw';
import gameTable from '../src/components/table/GameTable.astro?raw';
import scene from '../src/components/table/Scene.astro?raw';
import homeView from '../src/views/HomeView.astro?raw';
import en from '../src/i18n/en.json';
import es from '../src/i18n/es.json';
import { expectedPayoffs, PAYOFFS, realizedPayoffs } from '../src/lib/table/game';
import { toNumber } from '../src/lib/table/fraction';
import { BEATS, CAPTION_FADE, CAPTIONS, SCENE_FACE, sceneCaptions, scenePayoffs, sceneStops } from '../src/lib/table/scene';
import type { UiKey } from '../src/lib/i18n';

const dictionaries = { en, es } as const;
const tr = (locale: keyof typeof dictionaries) => (key: UiKey) => dictionaries[locale][key];
const styles = scene.slice(scene.indexOf('<style>'));
const markup = scene.slice(0, scene.indexOf('<style>'));

/** Each `@keyframes` block of the scene, with its stops and the properties it animates. */
const keyframes = [...styles.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n {2}\}/g)].map((match) => {
  const body = match[2] ?? '';
  return {
    name: match[1] ?? '',
    stops: [...body.matchAll(/(\d+)%/g)].map((m) => Number(m[1])),
    properties: [...body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]),
  };
});

describe('act 1 scene: the beats (ADR 0020)', () => {
  it("tells beats 0 to 6 in Vanberg's order, back to back, over the whole pinned scroll", () => {
    expect(BEATS.map((beat) => beat.beat)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(BEATS[0]?.from).toBe(0);
    expect(BEATS.at(-1)?.to).toBe(100);
    BEATS.forEach((beat, i) => {
      expect(beat.to).toBeGreaterThan(beat.from);
      if (i > 0) expect(beat.from).toBe(BEATS[i - 1]?.to);
    });
  });

  it('talks, then draws the roles, then switches the partner, then rolls', () => {
    const order = ['chat', 'roles', 'switch', 'rolls'].map((word) => BEATS.findIndex((beat) => beat.what.includes(word)));
    expect(order.every((index) => index > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('captions beats 1, 4, 5 and 6, in order, each inside the scroll and apart from the next', () => {
    expect(CAPTIONS.map((caption) => caption.beat)).toEqual([1, 4, 5, 6]);
    CAPTIONS.forEach((caption, i) => {
      expect(caption.from).toBeGreaterThanOrEqual(0);
      expect(caption.to).toBeLessThanOrEqual(100);
      expect(caption.to - caption.from).toBeGreaterThan(2 * CAPTION_FADE);
      if (i > 0) expect(caption.from).toBeGreaterThanOrEqual(CAPTIONS[i - 1]?.to ?? 0);
      const beat = BEATS.find((b) => b.beat === caption.beat);
      expect(caption.from).toBe(beat?.from);
    });
  });

  it('ends on the visitor: the last caption stays to the end of the scroll', () => {
    expect(CAPTIONS.at(-1)?.to).toBe(100);
  });
});

describe('act 1 scene: rule (k)', () => {
  it("shows the table's payoffs: 10 instead of 14, 10 expected, a cost of 4", () => {
    const payoffs = scenePayoffs();
    expect(payoffs).toEqual({ roll: PAYOFFS.roll.you, dont: PAYOFFS.dont.you, expected: toNumber(expectedPayoffs('roll').other), cost: 4 });
    expect(payoffs).toEqual({ roll: 10, dont: 14, expected: 10, cost: 4 });
  });

  it.each(['en', 'es'] as const)('%s: fills the payoff caption from the table, with its own word for "expected"', (locale) => {
    const captions = sceneCaptions(tr(locale));
    const die = captions.find((caption) => caption.beat === 5)?.text ?? '';
    const word = dictionaries[locale]['table.expected'].toLocaleLowerCase();
    expect(die).toContain(`10 ${word}`);
    for (const n of ['10', '14', '4']) expect(die).toMatch(new RegExp(`\\b${n}\\b`));
    for (const caption of captions) expect(caption.text).not.toMatch(/[{}]/);
  });

  it.each(['en', 'es'] as const)("%s: never turns the die's face into a payoff", (locale) => {
    const faceOnly = realizedPayoffs('roll', SCENE_FACE).other; // 12: what this face would pay the other
    expect(faceOnly).not.toBe(scenePayoffs().expected);
    const texts = [...sceneCaptions(tr(locale)).map((caption) => caption.text), dictionaries[locale]['scene.chip.instead']];
    for (const text of texts) expect(text).not.toMatch(new RegExp(`\\b${faceOnly}\\b`));
    // Only the table's figures appear in the captions.
    const numbers = texts.join(' ').match(/\d+/g) ?? [];
    for (const n of numbers) expect(['10', '14', '4']).toContain(n);
  });

  it.each(['en', 'es'] as const)('%s: claims no result of the experiment', (locale) => {
    const d = dictionaries[locale];
    const word = d['table.expected'].toLocaleLowerCase();
    const texts = [
      ...sceneCaptions(tr(locale)).map((caption) => caption.text.replace(word, '')),
      d['scene.alt'],
      d['scene.message'],
      d['scene.tag.decides'],
      d['scene.before-switch'],
      d['scene.hint'],
    ];
    for (const text of texts) {
      // The expectation staying the same after the switch (70 against 68) lives in act 4.
      expect(text).not.toMatch(/expect|esper|unchanged|sin cambio|no cambió|igual que|the same as|70|68|73|54|%/iu);
      expect(text).not.toMatch(/participant|participante|vanberg/iu);
    }
  });

  it.each(['en', 'es'] as const)("%s: gives the message as A's own words, not as a quotation", (locale) => {
    expect(dictionaries[locale]['scene.message']).not.toMatch(/["“”«»]/u);
  });
});

describe('act 1 scene: the CSS (ADR 0018, ADR 0020)', () => {
  it('adds no script: the scene moves with CSS alone', () => {
    expect(scene).not.toMatch(/<script/i);
  });

  it('uses only the progress stops of src/lib/table/scene.ts', () => {
    const allowed = new Set(sceneStops());
    expect(keyframes.length).toBeGreaterThan(10);
    for (const { name, stops } of keyframes) {
      expect(stops.length, name).toBeGreaterThan(1);
      for (const stop of stops) expect(allowed.has(stop), `${name}: ${stop}%`).toBe(true);
    }
  });

  it('animates only transform, opacity and clip-path', () => {
    for (const { name, properties } of keyframes) {
      for (const property of properties) expect(['transform', 'opacity', 'clip-path'], `${name}: ${property}`).toContain(property);
    }
  });

  it('binds the scene to the scroll only where scroll timelines exist, motion is allowed and scripting is on', () => {
    const gate = styles.indexOf('@media (prefers-reduced-motion: no-preference) and (scripting: enabled)');
    const supports = styles.indexOf('@supports (animation-timeline: view())');
    const firstKeyframes = styles.indexOf('@keyframes');
    expect(gate).toBeGreaterThan(0);
    expect(supports).toBeGreaterThan(gate);
    const uses = [...styles.matchAll(/animation-(timeline|name|range)\s*:/g)].map((m) => m.index ?? 0);
    expect(uses.length).toBeGreaterThan(0);
    for (const at of uses) {
      expect(at).toBeGreaterThan(supports);
      expect(at).toBeLessThan(firstKeyframes);
    }
    // The track only grows, and the frame only sticks, inside the gate: the still version is the default.
    for (const rule of ['position: sticky', '500svh', 'view-timeline']) {
      expect(styles.indexOf(rule), rule).toBeGreaterThan(supports);
    }
  });

  it('never hijacks the scroll', () => {
    expect(scene).not.toMatch(/scroll-snap|overscroll-behavior|touch-action:\s*none|addEventListener|onwheel|ontouch/i);
  });

  it('moves only inner groups, never an element that carries an SVG transform attribute', () => {
    const animated = [...styles.matchAll(/\.(sc-[a-z-]+)\s*\{\s*animation-name/g)].map((m) => m[1]);
    expect(animated.length).toBeGreaterThan(8);
    for (const tag of markup.matchAll(/<[a-z]+\b[^>]*class="([^"]+)"[^>]*>/g)) {
      const classes = (tag[1] ?? '').split(/\s+/);
      if (classes.some((c) => animated.includes(c))) expect(tag[0], classes.join(' ')).not.toMatch(/\stransform=/);
    }
  });
});

describe('act 1 scene: one table (ADR 0020)', () => {
  it('draws the scene inside the act 1 table, and puts its controls after the scene', () => {
    expect(gameTable.indexOf('<Scene')).toBeGreaterThan(0);
    expect(gameTable.indexOf('<Scene')).toBeLessThan(gameTable.indexOf('<figure'));
    expect(gameTable).toMatch(/Only moment 1 opens with the scene/);
  });

  it('opens the home page with a single moment 1 table, the one with the scene', () => {
    const tables = [...homeView.matchAll(/<GameTable[^>]*mode="moment1"[^>]*>/g)].map((m) => m[0]);
    expect(tables).toHaveLength(1);
    expect(tables[0]).toMatch(/\bscene\b/);
  });

  it("lets the table's own script clear the still version once the visitor chooses", () => {
    expect(controller).toMatch(/data-scene-state', 'played'/);
    expect(scene).toMatch(/\[data-scene-state='played'\]/);
  });
});

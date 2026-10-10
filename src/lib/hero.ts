/**
 * The home's cover (ADR 0036): before the film, the page says what it holds. The question as the
 * page's title, one line, and a door to each of its three parts: the story, which starts at chapter 0;
 * the research, chapter 7, whose open part every state of the lock shows; and the notebook's pages.
 * Its sky is the film's dawn and ends in the colour the stage begins with, so the light never cuts
 * (ADR 0027).
 */
import type { ChapterId } from './chapters';
import { parseHex } from './design/color';
import { LIGHT_POINTS } from './design/film';
import { SKY } from './film/stage';
import type { UiKey } from './i18n';
import { NOTEBOOK, type NotebookPage } from './notebook';

export interface Door {
  readonly id: 'story' | 'research' | 'notebook';
  readonly titleKey: UiKey;
  readonly textKey: UiKey;
  /** The door's own link, to its chapter; the notebook's door holds the pages' links instead. */
  readonly goKey: UiKey | null;
  readonly chapter: ChapterId | null;
}

export const DOORS: readonly Door[] = [
  { id: 'story', titleKey: 'hero.story.title', textKey: 'hero.story.text', goKey: 'hero.story.go', chapter: 'arrival' },
  { id: 'research', titleKey: 'hero.research.title', textKey: 'hero.research.text', goKey: 'hero.research.go', chapter: 'my-research' },
  { id: 'notebook', titleKey: 'hero.notebook.title', textKey: 'hero.notebook.text', goKey: null, chapter: null },
];

/**
 * The notebook's pages the cover links: all but /finding, in either state of the lock, so the cover
 * never changes with it. The research door leads to chapter 7, which both states show.
 */
export const COVER_PAGES: readonly NotebookPage[] = NOTEBOOK.filter((entry) => entry.page !== 'finding');

const DAWN = (() => {
  const dawn = LIGHT_POINTS[0];
  if (!dawn) throw new Error('The day has no dawn');
  return dawn.colours;
})();

const hex = (rgb: readonly number[]): string => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

/**
 * The stage's sky at dawn, at world height `y`: the world's gradient runs from sky-top at the top of
 * its square to sky-bottom at its foot, mixed channel by channel, as SVG paints it.
 */
export function dawnSkyAt(y: number): string {
  const t = Math.min(1, Math.max(0, (y - SKY.y) / SKY.size));
  const top = parseHex(DAWN['sky-top']);
  const bottom = parseHex(DAWN['sky-bottom']);
  return hex(top.map((c, i) => c + ((bottom[i] ?? c) - c) * t));
}

/**
 * Where the top of the screen falls on the world at the film's first frame, in world units: about 25
 * on a phone and 166 on a computer. The gradient is so gentle there that one height serves every
 * screen; the test checks each against it.
 */
export const COVER_FOOT_Y = 100;

/** The cover's sky: the dawn's sky-top, a glow of its sky-bottom, and a foot in the stage's first colour. */
export const COVER_SKY = {
  top: DAWN['sky-top'],
  glow: DAWN['sky-bottom'],
  foot: dawnSkyAt(COVER_FOOT_Y),
} as const;

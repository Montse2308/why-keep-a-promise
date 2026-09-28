/**
 * The film's colours (ADR 0027): the cast, the golden thread, the paper, and the day's light keyed to
 * the scroll. The film owns its light, so none of this follows the visitor's theme. Single source of
 * these values: `src/styles/film.css` mirrors FILM exactly, and `film.test.ts` checks that, the
 * contrast at every light point, the colour-blind distances and that the light never cuts.
 */
import { track, type Track } from '../film/track';

/** Each token is the CSS custom property `--film-<token>`. */
export const FILM_TOKENS = [
  'you',
  'other',
  'new',
  'thread',
  'thread-edge',
  'ink',
  'rim',
  'card',
  'card-muted',
  'voice-expects',
  'voice-word',
  'table-top',
  'table-front',
  'lamp',
] as const;
export type FilmToken = (typeof FILM_TOKENS)[number];

export const FILM: Record<FilmToken, string> = {
  you: '#5d7ee0', // the circle: "you"
  other: '#ed6b41', // the square: the other
  new: '#2ab2ac', // the triangle: the new partner, after the blackout
  thread: '#f3bd46', // the golden thread: the promise
  'thread-edge': '#8a6500',
  ink: '#1d1b3a', // outlines, faces, text on cards
  rim: '#fffaf0', // the paper rim of every cut-out
  card: '#fffdf8', // caption and dialogue cards, tickets
  'card-muted': '#5b5875',
  'voice-expects': '#b9b6d8', // the cloud: what the other expects
  'voice-word': '#fff4d6', // the scroll: my word
  'table-top': '#d99a5b',
  'table-front': '#b8733a',
  lamp: '#ffcf8a', // the desk lamp that lights the night chapters
};

/** The surfaces of the stage that change with the light. */
export const LIGHT_SURFACES = ['sky-top', 'sky-bottom', 'hill-far', 'hill-near', 'floor'] as const;
export type LightSurface = (typeof LIGHT_SURFACES)[number];

export interface LightPoint {
  readonly name: string;
  /** Scroll position, from 0 to 1. */
  readonly at: number;
  readonly colours: Record<LightSurface, string>;
}

/** The day, from the arrival to the closing (ADR 0027). Between points the light is eased, never cut. */
export const LIGHT_POINTS: readonly LightPoint[] = [
  { name: 'dawn', at: 0, colours: { 'sky-top': '#ffc58f', 'sky-bottom': '#ffe6cf', 'hill-far': '#b9c9a4', 'hill-near': '#9dba9a', floor: '#86ae98' } },
  { name: 'sunrise', at: 0.08, colours: { 'sky-top': '#f6b3c0', 'sky-bottom': '#ffd9cf', 'hill-far': '#b4c8a8', 'hill-near': '#96b89b', floor: '#83ac99' } },
  { name: 'morning', at: 0.17, colours: { 'sky-top': '#9ed0ff', 'sky-bottom': '#d3eaff', 'hill-far': '#a9c8b0', 'hill-near': '#8db59c', floor: '#7fa99a' } },
  { name: 'noon', at: 0.34, colours: { 'sky-top': '#8fb8f5', 'sky-bottom': '#d9e8ff', 'hill-far': '#a2c4ae', 'hill-near': '#86b097', floor: '#78a092' } },
  { name: 'afternoon', at: 0.55, colours: { 'sky-top': '#c7a8e0', 'sky-bottom': '#ffd3e6', 'hill-far': '#a9b3b8', 'hill-near': '#8ea3a6', floor: '#8a9fa0' } },
  { name: 'sunset', at: 0.73, colours: { 'sky-top': '#ff9f6b', 'sky-bottom': '#ffd08a', 'hill-far': '#b3a98a', 'hill-near': '#99a07c', floor: '#8d9a78' } },
  { name: 'nightfall', at: 0.86, colours: { 'sky-top': '#4a3b78', 'sky-bottom': '#c9706a', 'hill-far': '#4d4f6e', 'hill-near': '#434a5e', floor: '#4f5a60' } },
];

/** One colour track per surface, ready to sample at any scroll position. */
export const LIGHT: Record<LightSurface, Track<string>> = Object.fromEntries(
  LIGHT_SURFACES.map((surface) => [surface, track(LIGHT_POINTS.map((p) => ({ at: p.at, value: p.colours[surface] })))]),
) as Record<LightSurface, Track<string>>;

/** The lamp lights the table from this scroll position on: the night chapters, 7 and 8. */
export const LAMP_FROM = 0.8;

/**
 * The steepest colour change the light may make, in ΔE*ab per screen of scroll. A change as large as
 * dusk falling (about 90) then takes at least three and a half screens; a cut would take a fraction
 * of one (ADR 0027: no cuts).
 */
export const MAX_LIGHT_CHANGE_PER_SCREEN = 25;

/**
 * The least colour the sky keeps anywhere between two light points: the spread between its
 * strongest and weakest channel, out of 255. Below it the sky reads grey and dirty. The horizon is
 * paler by nature, so it may keep less.
 */
export const MIN_SKY_COLOUR = { 'sky-top': 24, 'sky-bottom': 18 } as const;

/** The minimum distances of ADR 0027, as in palette.ts: the cast apart, the thread apart from all. */
export const FILM_DISTANCE = { cast: 40, thread: 20 } as const;

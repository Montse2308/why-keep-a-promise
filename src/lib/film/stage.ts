/**
 * What the stage shows at each point of the film (ADR 0021, ADR 0027): the camera, the light, where
 * the cast and the die stand, how they feel, the rooms, the board, the coins and the state of the
 * golden thread. Pure: the build samples it for the storyboard's still frames and the film's script
 * samples it on every frame.
 *
 * Positions are world units in an SVG 1600 wide; the table's centre sits at x = 800, the floor at
 * y = 640. `p` is the scroll position through the whole film, from 0 to 1; the choreography is
 * written in screens from the top of the film (src/lib/film/timeline.ts) and turned into `p` there.
 */
import { CHAPTERS, type ChapterId } from '../chapters';
import { LAMP_FROM, LIGHT, LIGHT_SURFACES, type LightSurface } from '../design/film';
import { cellTags, COLUMNS, currentColumn, reduce as pick, START as NO_PICKS, type CellKey, type State as Picks, type Tag } from '../pd/bestReply';
import { bestReply, type Move } from '../pd/game';
import type { RoundState } from '../pd/round';
import { BOARD } from './board';
import type { Shot } from './camera';
import type { Mood } from './faces';
import { AFTER, type Chat } from './talk';
import { spans, type Span } from './spans';
import { at, beatAt, beatRange, TOTAL_SCREENS } from './timeline';
import { easeInOut, progress, sample, track } from './track';

export const WORLD = { width: 1600, centre: 800, floor: 640, tableTop: 560 } as const;

/** Every chapter's share of the whole film, in order. */
export const SPANS: readonly Span<ChapterId>[] = spans(CHAPTERS);

export function spanOf(id: ChapterId): Span<ChapterId> {
  const found = SPANS.find((span) => span.id === id);
  if (!found) throw new Error(`No span for chapter "${id}"`);
  return found;
}

/** The visitor's answer in chapter 0: null until they choose. */
export type Promised = boolean | null;

export type ThreadState = 'tied' | 'broken' | 'none';

/** What the visitor has done so far. Every choice is optional: the film goes on without it. */
export interface StageState {
  readonly promised: Promised;
  /** Chapter 1: the one round of the dilemma. */
  readonly round?: RoundState;
  /** Chapter 1: the visitor's move against each of the other's, one column at a time. */
  readonly columns?: Picks;
  /** Chapter 2: the message the visitor wrote. */
  readonly chat?: Chat;
}

export interface StageView {
  readonly shot: Shot;
  readonly light: Record<LightSurface, string>;
  /** How much of the lamp's warm light falls on the table, from 0 to 1. */
  readonly lamp: number;
  /** The beat whose card has the stage. */
  readonly beat: { readonly chapter: ChapterId; readonly id: string };
  /** Half the distance between the circle and the square. */
  readonly spread: number;
  /** 0 at the table; 1 in two rooms, with the wall up between them. */
  readonly rooms: number;
  /** How far the rooms' bulbs hang down, from 0 (out of sight) to 1. */
  readonly bulbs: number;
  /** How much of the table shows, from 0 to 1. */
  readonly table: number;
  readonly die: { readonly y: number; readonly opacity: number; readonly floating: boolean };
  /** The prisoner's dilemma board: how far it has come down, the column asked about, each cell's marks. */
  readonly board: { readonly shown: number; readonly column: Move | null; readonly tags: Readonly<Record<CellKey, readonly Tag[]>> };
  /** The coins over each character, and how much they show, from 0 to 1. */
  readonly coins: { readonly you: number; readonly other: number; readonly shown: number };
  /** Chapter 2's speech bubbles over the wall, from 0 (gone) to 1. */
  readonly bubbles: { readonly you: number; readonly other: number };
  readonly moods: { readonly you: Mood; readonly other: Mood };
  readonly thread: { readonly state: ThreadState; readonly drawn: number };
  /** How far the chapter 0 title has gone, from 0 (fully shown) to 1 (gone). */
  readonly titleGone: number;
}

/** A beat takes the stage a little before its stretch starts: its card is already coming up. */
export const LEAD = 0.55;

/** The stretch, in screens, over which a beat's scene settles as its card comes up. */
function entering(chapter: ChapterId, beat: string): readonly [number, number] {
  const { from } = beatRange(chapter, beat);
  return [from - 0.7, from + 0.1];
}

/** How far a point (in screens) has gone through a stretch, eased. */
const eased = (screens: number, [from, to]: readonly [number, number]): number => easeInOut(progress(screens, from, to));

const INTO_ROOMS = entering('two-rooms', 'rooms');
const BOARD_DOWN = entering('two-rooms', 'columns');
const TRAP = entering('two-rooms', 'trap');
const CHAT = entering('talk', 'chat');
/** The round's coins show while its card does, and go when the board comes down. */
const ROUND_COINS = [beatRange('two-rooms', 'play').from - 0.4, BOARD_DOWN[0] + 0.1] as const;

/** Where each beat's still pose sits, in screens from the beat's start. */
const POSE_IN: Readonly<Record<string, number>> = {
  'two-rooms/rooms': 0.6,
  'two-rooms/play': 0.3,
  'two-rooms/columns': 0.4,
  'two-rooms/trap': 0.4,
  'talk/chat': 0.4,
  'talk/cheap': 0.3,
};

const poseOf = (chapter: ChapterId, beat: string): number => beatRange(chapter, beat).from + (POSE_IN[`${chapter}/${beat}`] ?? 0);

/**
 * With reduced motion the stage cuts between still poses instead of moving (ADR 0027): from each
 * cut's point on, everything that moves stands where it stands at the cut's pose. In screens.
 * Chapter 0 cuts once, from the wide shot of the title to the table; every later beat cuts as its
 * card takes the stage.
 */
export const CUTS: readonly { readonly from: number; readonly pose: number }[] = [
  { from: 0, pose: 0 },
  { from: 0.9, pose: 1.8 },
  ...(
    [
      ['two-rooms', 'rooms'],
      ['two-rooms', 'play'],
      ['two-rooms', 'columns'],
      ['two-rooms', 'trap'],
      ['talk', 'chat'],
      ['talk', 'cheap'],
    ] as const
  ).map(([chapter, b]) => ({ from: beatRange(chapter, b).from - LEAD, pose: poseOf(chapter, b) })),
];

/** The pose that stands for a point, in screens, when the stage cuts instead of moving. */
export function poseAt(screens: number): number {
  let pose = CUTS[0]?.pose ?? 0;
  for (const cut of CUTS) if (screens >= cut.from) pose = cut.pose;
  return pose;
}

/** The key pose of each built chapter, in `p`: the storyboard draws its still frame there. */
export const KEY_POSE: Partial<Record<ChapterId, number>> = {
  arrival: at(2.1),
  'two-rooms': at(poseOf('two-rooms', 'trap')),
  talk: at(poseOf('talk', 'chat')),
};

/** The camera: wide on the title, closing in on the table as the other asks, wide again for the rooms. */
const SHOTS = {
  cx: track([{ at: 0, value: 800 }, { at: at(3), value: 800 }]),
  cy: track([
    { at: 0, value: 470 },
    { at: at(1.8), value: 505 },
    { at: at(INTO_ROOMS[0]), value: 505 },
    { at: at(INTO_ROOMS[1]), value: 480 },
  ]),
  width: track([
    { at: 0, value: 1500 },
    { at: at(1.8), value: 1180 },
    { at: at(INTO_ROOMS[0]), value: 1180 },
    { at: at(INTO_ROOMS[1]), value: 1450 },
  ]),
  widthPortrait: track([
    { at: 0, value: 660 },
    { at: at(1.8), value: 600 },
    { at: at(INTO_ROOMS[0]), value: 600 },
    { at: at(INTO_ROOMS[1]), value: 620 },
  ]),
};

/** Room the view leaves over the board, in world units: the spool sits in the corner above it. */
export const BOARD_MARGIN = 90;

/** Half the distance between the two characters, at the table and in the rooms, by screen shape. */
export const SPREAD = { landscape: 280, portrait: 190 } as const;
export const ROOMS_SPREAD = { landscape: 390, portrait: 205 } as const;

const NO_TAGS = cellTags(NO_PICKS);

/** The columns as someone who always picks the best reply would leave them: the trap's board. */
const REASONED: Picks = COLUMNS.reduce((state, other) => pick(state, { type: 'pick', move: bestReply(other) }), NO_PICKS);
const TRAP_TAGS = Object.fromEntries(
  Object.entries(cellTags(REASONED)).map(([cell, tags]) => [cell, tags.filter((tag) => tag !== 'pick')]),
) as Record<CellKey, Tag[]>;

function moodsAt(beat: { chapter: ChapterId; id: string }, state: StageState, asked: number): StageView['moods'] {
  const round = state.round ?? null;
  switch (`${beat.chapter}/${beat.id}`) {
    case 'arrival/ask':
      return {
        you: state.promised === true ? 'proud' : state.promised === false ? 'neutral' : asked > 0.5 ? 'tempted' : 'neutral',
        other: state.promised === true ? 'happy' : state.promised === false ? 'sad' : asked > 0 ? 'worried' : 'neutral',
      };
    case 'two-rooms/rooms':
      return { you: 'worried', other: 'worried' };
    case 'two-rooms/play':
      if (round === null) return { you: 'tempted', other: 'neutral' };
      // Cooperating against a defector is being betrayed; both defecting leaves both worse off.
      return round.you === 'cooperate' ? { you: 'sad', other: 'happy' } : { you: 'worried', other: 'worried' };
    case 'two-rooms/columns':
      return { you: 'tempted', other: 'tempted' };
    case 'talk/chat':
      return state.chat ? AFTER[state.chat] : { you: 'neutral', other: 'worried' };
    case 'talk/cheap':
      return { you: 'tempted', other: 'tempted' };
    default:
      return { you: 'worried', other: 'worried' };
  }
}

export function stageAt(p: number, state: StageState, portrait: boolean, reduced: boolean): StageView {
  const screens = p * TOTAL_SCREENS;
  // What moves stands at its pose with reduced motion; the light and the moods follow the scroll.
  const m = reduced ? poseAt(screens) : screens;
  const beat = beatAt(screens + LEAD);

  const light = Object.fromEntries(LIGHT_SURFACES.map((s) => [s, sample(LIGHT[s], p)])) as Record<LightSurface, string>;
  const lamp = easeInOut(progress(p, LAMP_FROM, Math.min(1, LAMP_FROM + 0.05)));

  const rooms = eased(m, INTO_ROOMS);
  const boardShown = eased(m, BOARD_DOWN);
  const table = portrait ? SPREAD.portrait : SPREAD.landscape;
  const apart = portrait ? ROOMS_SPREAD.portrait : ROOMS_SPREAD.landscape;

  const shot: Shot = {
    cx: sample(SHOTS.cx, at(m)),
    cy: sample(SHOTS.cy, at(m)),
    width: sample(SHOTS.width, at(m)),
    widthPortrait: sample(SHOTS.widthPortrait, at(m)),
    // While the board is down, the view keeps it clear of the spool in the corner; hidden, the
    // constraint is far away.
    top: BOARD.card.y - BOARD_MARGIN + (1 - boardShown) * 2000,
  };

  const columns = state.columns ?? NO_PICKS;
  const inTrap = m >= TRAP[0];
  const board = {
    shown: boardShown,
    column: inTrap || boardShown < 0.5 ? null : currentColumn(columns),
    tags: boardShown === 0 ? NO_TAGS : inTrap ? TRAP_TAGS : cellTags(columns),
  };

  const round = state.round ?? null;
  const coinsShown = round === null ? 0 : eased(m, [ROUND_COINS[0], ROUND_COINS[0] + 0.2]) * (1 - eased(m, [ROUND_COINS[1] - 0.2, ROUND_COINS[1]]));
  const coins = { you: round?.payoff.you ?? 0, other: round?.payoff.other ?? 0, shown: coinsShown };

  // The other speaks first, as the chat opens; the visitor's bubble comes with their message.
  const talking = eased(m, CHAT);
  const bubbles = { you: state.chat ? talking : 0, other: talking };

  const thread = state.promised === true ? { state: 'tied' as const, drawn: 1 } : { state: 'none' as const, drawn: 0 };
  const asked = progress(p, at(0.6), at(1.35));

  return {
    shot,
    light,
    lamp,
    beat: { chapter: beat.chapter, id: beat.beat.id },
    spread: table + (apart - table) * rooms,
    rooms,
    bulbs: rooms * (1 - boardShown),
    table: 1 - rooms,
    die: { y: WORLD.tableTop - 90, opacity: 1 - eased(m, [INTO_ROOMS[0], INTO_ROOMS[0] + 0.4]), floating: m < 1.5 },
    board,
    coins,
    bubbles,
    moods: moodsAt({ chapter: beat.chapter, id: beat.beat.id }, state, asked),
    thread,
    titleGone: easeInOut(progress(p, at(0.36), at(1.2))),
  };
}

/** Where the circle and the square stand for a given spread (their faces' centres). */
export function castPositions(spread: number): { readonly you: readonly [number, number]; readonly other: readonly [number, number] } {
  return { you: [WORLD.centre - spread, 500], other: [WORLD.centre + spread, 496] };
}

/** The golden thread between the circle and the square: it leaves each side and sags upwards. */
export function threadPath(spread: number): string {
  const from = WORLD.centre - spread + 50;
  const to = WORLD.centre + spread - 50;
  const y = 486;
  const lift = Math.min(96, spread * 0.36);
  const pull = (to - from) * 0.3;
  return `M${from} ${y} C${from + pull} ${y - lift} ${to - pull} ${y - lift} ${to} ${y}`;
}

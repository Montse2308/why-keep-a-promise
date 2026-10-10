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
import { CHAPTERS, LOCKED_BEATS, type ChapterId } from '../chapters';
import { LAMP_FROM, LIGHT, LIGHT_SURFACES, type LightSurface } from '../design/film';
import { cellTags, COLUMNS, currentColumn, reduce as pick, START as NO_PICKS, type CellKey, type State as Picks, type Tag } from '../pd/bestReply';
import { bestReply, type Move } from '../pd/game';
import type { RoundState } from '../pd/round';
import type { DecisionState } from '../table/decision';
import type { Choice, Face } from '../table/game';
import { betMood, type Bet } from './bet';
import { BOARD } from './board';
import type { Shot } from './camera';
import { DECK } from './deck';
import type { Guesses } from './guess';
import { SIGN, SIGN_X } from './signs';
import type { Mood } from './faces';
import { AFTER, type Chat } from './talk';
import { spans, type Span } from './spans';
import { at, beatAt, beatRange, BEATS, lightAt, TOTAL_SCREENS } from './timeline';
import { easeInOut, progress, sample, track } from './track';
import { voicePlaces, type Point } from './voices';

export const WORLD = { width: 1600, centre: 800, floor: 640, tableTop: 560 } as const;

/**
 * The sky behind the whole world: one square, its gradient from the light's sky-top at its top edge to
 * its sky-bottom at its bottom edge. Drawn this large so any screen shape only shows more sky. The
 * home's cover (ADR 0036) reads it to end in the colour the stage begins with.
 */
export const SKY = { x: -4000, y: -4000, size: 9600 } as const;

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

/** Where one of the cast stands: its centre, its size (1 at the table) and how much of it shows. */
export interface Place {
  readonly at: Point;
  readonly scale: number;
  readonly opacity: number;
}

/** What the visitor has done so far. Every choice is optional: the film goes on without it. */
export interface StageState {
  readonly promised: Promised;
  /** Chapter 1: the one round of the dilemma. */
  readonly round?: RoundState;
  /** Chapter 1: the visitor's move against each of the other's, one column at a time. */
  readonly columns?: Picks;
  /** Chapter 2: the message the visitor wrote. */
  readonly chat?: Chat;
  /** Chapter 3: keep the money or roll the die. */
  readonly decision?: DecisionState;
  /** Chapter 5: the decisions on the deck, one per card, and the card the stage shows. */
  readonly deck?: { readonly choices: readonly Choice[]; readonly at: number };
  /** Chapter 5: the visitor's bet, once they receive. */
  readonly bet?: Bet | null;
  /** Chapter 6: the visitor's guesses, by figure; a figure shows once it is guessed. */
  readonly guesses?: Guesses;
  /** Chapter 8: what the visitor says they would do now, when the other asks one last time. */
  readonly now?: Choice | null;
  /** Chapter 8: whether the page kept its own promise, as the visitor answers. */
  readonly pageKept?: boolean | null;
}

export interface StageView {
  readonly shot: Shot;
  readonly light: Record<LightSurface, string>;
  /** How much of the lamp's warm light falls on the table, from 0 to 1. */
  readonly lamp: number;
  /** How far the lamp's shade has come down over the table (chapter 7 on), from 0 to 1. */
  readonly shade: number;
  /** How much the night's stars show, from 0 to 1. */
  readonly stars: number;
  /** The beat whose card has the stage. */
  readonly beat: { readonly chapter: ChapterId; readonly id: string };
  /** Half the distance between the circle and the square's seat at the table. */
  readonly spread: number;
  /**
   * Where the circle stands, the square (at its seat, or away at another table after the lights go
   * out) and the triangle, the new partner, who sits in the square's seat after a switch.
   */
  readonly cast: { readonly you: Point; readonly other: Place; readonly partner: Place };
  /**
   * The two voices (chapter 4 on): how much they show, the point each one looks at, how much the
   * scroll glows, and whose face waits in the cloud's globe.
   */
  readonly voices: {
    readonly shown: number;
    readonly at: { readonly expects: Point; readonly word: Point };
    readonly look: { readonly expects: Point; readonly word: Point };
    readonly glow: number;
    /** Whose face waits in the cloud's globe: whoever sits across the table. */
    readonly globe: 'other' | 'partner';
  };
  /** The blackout of chapter 5, from 0 (the day's light) to 1 (dark, but for the cast's eyes). */
  readonly dark: number;
  /**
   * Chapter 6's two signs over the table: how far they have come down, where each hangs, how much
   * each figure shows (a question mark until then), and how much the recipients' expectations show.
   */
  readonly signs: {
    readonly shown: number;
    readonly x: { readonly same: number; readonly switched: number };
    readonly same: number;
    readonly switched: number;
    readonly expected: number;
  };
  /** 0 at the table; 1 in two rooms, with the wall up between them. */
  readonly rooms: number;
  /** How far the rooms' bulbs hang down, from 0 (out of sight) to 1. */
  readonly bulbs: number;
  /** How much of the table shows, from 0 to 1. */
  readonly table: number;
  /**
   * The die: where it stands, whether it floats (chapters 0 and 8) or rolls (chapter 3), and the
   * face it shows. The face is never a payoff (rule (k)): it only says whether the other gets theirs.
   */
  readonly die: { readonly y: number; readonly opacity: number; readonly floating: boolean; readonly rolling: boolean; readonly face: Face };
  /**
   * The prisoner's dilemma board: how far it has come down and folded into the die (chapter 3),
   * the column asked about, each cell's marks.
   */
  readonly board: {
    readonly shown: number;
    readonly folded: number;
    readonly column: Move | null;
    readonly tags: Readonly<Record<CellKey, readonly Tag[]>>;
  };
  /**
   * Chapter 7's engine on the table: how far it has come down, from 0 to 1, and how far its gears have
   * turned, in degrees. It turns with the scroll, never on its own.
   */
  readonly engine: { readonly shown: number; readonly turn: number };
  /** Chapter 7's envelope: 0 sealed; with the lock open, it opens to 1 before the finding. */
  readonly envelope: number;
  /** The coins over each character, and how much they show, from 0 to 1. */
  readonly coins: { readonly you: number; readonly other: number; readonly shown: number };
  /** Chapter 2's speech bubbles over the wall, from 0 (gone) to 1. */
  readonly bubbles: { readonly you: number; readonly other: number };
  readonly moods: { readonly you: Mood; readonly other: Mood; readonly partner: Mood };
  /** The golden thread, from the circle to the square wherever it stands, and how much of it shows. */
  readonly thread: { readonly state: ThreadState; readonly drawn: number; readonly shown: number };
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

/**
 * Chapter 0, halfway through its three screens, once the camera has closed in: while the visitor
 * has not answered, the other's bubble comes up with its three dots, still waiting, so the stretch
 * does not stand still. It goes as the rooms come.
 */
export const WAITING = [1.8, 2.05] as const;
const INTO_ROOMS = entering('two-rooms', 'rooms');
const BOARD_DOWN = entering('two-rooms', 'columns');
const TRAP = entering('two-rooms', 'trap');
const CHAT = entering('talk', 'chat');
const OUT_OF_ROOMS = entering('fold', 'fold');
const DECIDE = entering('fold', 'decide');
export const VOICES_IN = entering('two-voices', 'voices');
/**
 * Chapter 5. The lights go out as the blackout's card comes up; in the dark the square leaves its
 * seat for another table and the triangle sits down; then the lights come back.
 */
const BLACKOUT = beatRange('blackout', 'blackout').from;
export const LIGHTS_OUT = [BLACKOUT - 0.8, BLACKOUT - 0.4] as const;
export const LIGHTS_ON = [BLACKOUT + 0.05, BLACKOUT + 0.45] as const;
const SWAP = [LIGHTS_OUT[1], LIGHTS_ON[0]] as const;
const WIDER = [BLACKOUT - 0.9, BLACKOUT - 0.4] as const;
const DECK_IN = entering('blackout', 'deck');
/** The visitor receives at the table as it was; then the lights flicker and the seats change again. */
const RECEIVE_IN = entering('blackout', 'receive');
const REVEAL = beatRange('blackout', 'reveal').from;
export const FLICKER_OUT = [REVEAL - 0.75, REVEAL - 0.55] as const;
export const FLICKER_ON = [REVEAL - 0.25, REVEAL + 0.05] as const;
const REVEAL_SWAP = [FLICKER_OUT[1], FLICKER_ON[0]] as const;
/**
 * Chapter 6. Back at the table as it was, two signs come down over it; each figure shows when the
 * visitor guesses it, and both do when the film reaches them. At the conclusion, my word glows.
 */
const REAL_IN = entering('real-people', 'guess-same');
export const EXPECTED = entering('real-people', 'expected');
const CONCLUSION = entering('real-people', 'conclusion');
/**
 * Chapter 7. Night has fallen: the signs go back up, and the lamp comes down over the table as the
 * chapter's card comes up. The engine comes down onto the table, where the die was; the envelope
 * follows, and with the lock open it opens before the finding (ADR 0034).
 */
const RESEARCH_IN = entering('my-research', 'question');
const SIGNS_UP = [RESEARCH_IN[0], RESEARCH_IN[0] + 0.4] as const;
const SHADE_DOWN = [RESEARCH_IN[0] + 0.3, RESEARCH_IN[1]] as const;
const ENGINE_IN = entering('my-research', 'engine');
const SEALED = beatRange('my-research', 'sealed').from;
/** The flap opens while the envelope's card is held at the bottom of the screen. */
const OPENING = [SEALED + 0.05, SEALED + 0.3] as const;
/** How far the engine's gears turn per screen of scroll, in degrees. */
export const GEAR_TURN = 150;
/**
 * Chapter 8. Back at the first table, under the night lamp: the engine goes back up, and the die
 * floats over the table again, as it did at the arrival, while the other asks one last time. At the
 * credits the new partner comes back, at the other table, for the curtain call.
 */
const CLOSING_IN = entering('closing', 'collect');
const ENGINE_UP = [CLOSING_IN[0], CLOSING_IN[0] + 0.4] as const;
const DIE_BACK = [CLOSING_IN[0] + 0.3, CLOSING_IN[1]] as const;
const CREDITS_IN = entering('closing', 'credits');
/**
 * Once the table is back, the board folds flat while "another game" is on screen, and the die it
 * folds into drops onto the table.
 */
const FOLD = [OUT_OF_ROOMS[1] - 0.05, OUT_OF_ROOMS[1] + 0.45] as const;
const DIE_DROP = [FOLD[0] + 0.25, FOLD[1] + 0.3] as const;
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
  'fold/fold': 1,
  'fold/decide': 0.5,
  'two-voices/voices': 0.5,
  'two-voices/together': 0.1,
  'two-voices/trick': 0.3,
  'blackout/blackout': 0.6,
  'blackout/new-partner': 0.2,
  'blackout/deck': 0.5,
  'blackout/receive': 0.3,
  'blackout/reveal': 0.3,
  'real-people/guess-same': 0.3,
  'real-people/guess-switched': 0.3,
  'real-people/expected': 0.1,
  'real-people/conclusion': 0.3,
  'my-research/question': 0.4,
  'my-research/engine': 0.4,
  // Sealed at its pose: with reduced motion, the envelope opens at the finding's first cut.
  'my-research/sealed': 0,
  'closing/collect': 0.3,
  'closing/asked': 0.3,
  'closing/credits': 0.5,
};

/**
 * Where a beat's still pose sits, in screens from the top of the film. The finding's beats go
 * unnamed here, so a locked build carries none of their ids (ADR 0034): each poses a little past its
 * start, with the envelope already open.
 */
function poseOf(chapter: ChapterId, beat: string): number {
  const finding = chapter === 'my-research' && LOCKED_BEATS.some((b) => b.id === beat);
  return beatRange(chapter, beat).from + (finding ? 0.3 : (POSE_IN[`${chapter}/${beat}`] ?? 0));
}

/**
 * With reduced motion the stage cuts between still poses instead of moving (ADR 0027): from each
 * cut's point on, everything that moves stands where it stands at the cut's pose. In screens.
 * Chapter 0 cuts to the other asking, and halfway to the other still waiting for an answer; every
 * later beat cuts as its card takes the stage.
 */
export const CUTS: readonly { readonly from: number; readonly pose: number }[] = [
  { from: 0, pose: 0 },
  { from: 0.9, pose: 1.8 },
  { from: WAITING[0], pose: WAITING[1] + 0.1 },
  ...BEATS.filter((range) => range.chapter !== 'arrival').map((range) => ({ from: range.from - LEAD, pose: poseOf(range.chapter, range.beat.id) })),
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
  fold: at(poseOf('fold', 'decide')),
  'two-voices': at(poseOf('two-voices', 'together')),
  blackout: at(poseOf('blackout', 'new-partner')),
  'real-people': at(poseOf('real-people', 'expected')),
  'my-research': at(poseOf('my-research', 'engine')),
  closing: at(poseOf('closing', 'collect')),
};

/**
 * The camera: on the table from the first frame, as the other asks (the title is the cover's, above
 * the film, ADR 0036), wide for the rooms and the fold, close on the table for the decision, a little wider and higher when the two
 * voices come to float over the circle, and wider still once the square has gone to another table.
 * At nightfall it rises a little for the stars and the lamp, then closes in on the engine. Back at
 * the first table it frames the two and their voices, and it opens up for the curtain call.
 */
const SHOTS = {
  cx: track([{ at: 0, value: 800 }, { at: at(3), value: 800 }]),
  cy: track([
    { at: 0, value: 505 },
    { at: at(INTO_ROOMS[0]), value: 505 },
    { at: at(INTO_ROOMS[1]), value: 480 },
    { at: at(DECIDE[0]), value: 480 },
    { at: at(DECIDE[1]), value: 505 },
    { at: at(VOICES_IN[0]), value: 505 },
    { at: at(VOICES_IN[1]), value: 495 },
    { at: at(WIDER[0]), value: 495 },
    { at: at(WIDER[1]), value: 520 },
    { at: at(REAL_IN[0]), value: 520 },
    { at: at(REAL_IN[1]), value: 490 },
    { at: at(RESEARCH_IN[0]), value: 490 },
    { at: at(RESEARCH_IN[1]), value: 470 },
    { at: at(ENGINE_IN[0]), value: 470 },
    { at: at(ENGINE_IN[1]), value: 500 },
    { at: at(CLOSING_IN[0]), value: 500 },
    { at: at(CLOSING_IN[1]), value: 495 },
    { at: at(CREDITS_IN[0]), value: 495 },
    { at: at(CREDITS_IN[1]), value: 485 },
  ]),
  width: track([
    { at: 0, value: 1180 },
    { at: at(INTO_ROOMS[0]), value: 1180 },
    { at: at(INTO_ROOMS[1]), value: 1450 },
    { at: at(DECIDE[0]), value: 1450 },
    { at: at(DECIDE[1]), value: 1180 },
    { at: at(VOICES_IN[0]), value: 1180 },
    { at: at(VOICES_IN[1]), value: 1300 },
    { at: at(WIDER[0]), value: 1300 },
    { at: at(WIDER[1]), value: 1500 },
    { at: at(REAL_IN[0]), value: 1500 },
    { at: at(REAL_IN[1]), value: 1320 },
    { at: at(RESEARCH_IN[0]), value: 1320 },
    { at: at(RESEARCH_IN[1]), value: 1400 },
    { at: at(ENGINE_IN[0]), value: 1400 },
    { at: at(ENGINE_IN[1]), value: 1240 },
    { at: at(CLOSING_IN[0]), value: 1240 },
    { at: at(CLOSING_IN[1]), value: 1300 },
    { at: at(CREDITS_IN[0]), value: 1300 },
    { at: at(CREDITS_IN[1]), value: 1450 },
  ]),
  widthPortrait: track([
    { at: 0, value: 600 },
    { at: at(INTO_ROOMS[0]), value: 600 },
    { at: at(INTO_ROOMS[1]), value: 620 },
    { at: at(DECIDE[0]), value: 620 },
    { at: at(DECIDE[1]), value: 600 },
    { at: at(VOICES_IN[0]), value: 600 },
    { at: at(VOICES_IN[1]), value: 640 },
    { at: at(WIDER[0]), value: 640 },
    { at: at(WIDER[1]), value: 660 },
    { at: at(REAL_IN[0]), value: 660 },
    { at: at(REAL_IN[1]), value: 640 },
    { at: at(RESEARCH_IN[0]), value: 640 },
    { at: at(RESEARCH_IN[1]), value: 660 },
    { at: at(ENGINE_IN[0]), value: 660 },
    { at: at(ENGINE_IN[1]), value: 620 },
    { at: at(CLOSING_IN[0]), value: 620 },
    { at: at(CLOSING_IN[1]), value: 640 },
    { at: at(CREDITS_IN[0]), value: 640 },
    { at: at(CREDITS_IN[1]), value: 660 },
  ]),
};

/**
 * Where the square goes when the lights go out: to another table, farther off, still holding the
 * golden thread (ADR 0027). On a phone, up behind the seat, so it stays in view.
 */
export const AWAY = {
  landscape: { at: [1330, 402], scale: 0.55 },
  portrait: { at: [1062, 352], scale: 0.45 },
} as const satisfies Record<string, { at: Point; scale: number }>;

/** How far past the seat the triangle waits, out of sight, before it sits down. */
export const OFFSTAGE = 260;

/** Where the square and the triangle stand. */
interface Layout {
  readonly other: Place;
  readonly partner: Place;
}

/** The table as it was: the square in its seat, the triangle out of sight. */
const tableLayout = (seat: Point): Layout => ({
  other: { at: seat, scale: 1, opacity: 1 },
  partner: { at: [seat[0] + OFFSTAGE, seat[1]], scale: 1, opacity: 0 },
});

/** After a switch: the square at another table, the triangle in its seat. */
const switchedLayout = (seat: Point, portrait: boolean): Layout => {
  const away = AWAY[portrait ? 'portrait' : 'landscape'];
  return { other: { at: away.at, scale: away.scale, opacity: 1 }, partner: { at: seat, scale: 1, opacity: 1 } };
};

/** The curtain call (chapter 8): the square in its seat, and the triangle back at the other table. */
const curtainLayout = (seat: Point, portrait: boolean): Layout => {
  const away = AWAY[portrait ? 'portrait' : 'landscape'];
  return { other: { at: seat, scale: 1, opacity: 1 }, partner: { at: away.at, scale: away.scale, opacity: 1 } };
};

const mixPlace = (a: Place, b: Place, t: number): Place => ({
  at: [a.at[0] + (b.at[0] - a.at[0]) * t, a.at[1] + (b.at[1] - a.at[1]) * t],
  scale: a.scale + (b.scale - a.scale) * t,
  opacity: a.opacity + (b.opacity - a.opacity) * t,
});
const mixLayout = (a: Layout, b: Layout, t: number): Layout =>
  t <= 0 ? a : t >= 1 ? b : { other: mixPlace(a.other, b.other, t), partner: mixPlace(a.partner, b.partner, t) };

/** Where chapter 7's engine stands on the table: its centre, where the die rested. */
export const ENGINE_AT: Point = [WORLD.centre, 496];

/**
 * The night lamp of the character sheet (ADR 0027), from chapter 7 on: a paper shade hung over the
 * table's centre, high enough to clear the voices. `top` is the top of the shade, which the view keeps
 * on screen; `rise` is how far above its place it waits before it comes down.
 */
export const SHADE = { y: 190, top: 168, rise: 640 } as const;

/** Room the view leaves over the lamp's shade. */
export const SHADE_MARGIN = 30;

/** Where the die floats in chapter 0, where the board's fold drops it from, and where it rests. */
export const DIE = { floats: WORLD.tableTop - 90, folds: 236, rests: WORLD.tableTop - 44 } as const;

/** The face the die shows before anyone rolls it: the one of the character sheet. */
export const RESTING_FACE: Face = 5;

/** Room the view leaves over the board, in world units: the spool sits in the corner above it. */
export const BOARD_MARGIN = 90;

/** Room the view leaves over chapter 6's signs, and their strings' knots. */
export const SIGNS_MARGIN = 60;

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
  switch (`${beat.chapter}/${beat.id}`) {
    case 'blackout/blackout':
      return { you: 'shock', other: 'worried', partner: 'neutral' };
    case 'blackout/new-partner':
      return { you: 'worried', other: 'neutral', partner: 'happy' };
    case 'blackout/deck':
      return deckMoods(state);
    case 'blackout/receive':
      return { you: betMood(state.bet ?? null), other: 'happy', partner: 'neutral' };
    case 'blackout/reveal':
      return { you: 'shock', other: 'neutral', partner: 'neutral' };
    case 'real-people/guess-same':
      return { you: 'neutral', other: 'neutral', partner: 'neutral' };
    case 'real-people/guess-switched':
      return { you: 'worried', other: 'neutral', partner: 'neutral' };
    case 'real-people/expected':
      return { you: 'shock', other: 'neutral', partner: 'neutral' };
    case 'real-people/conclusion':
      return { you: 'neutral', other: 'happy', partner: 'neutral' };
    case 'my-research/engine':
      return { you: 'shock', other: 'shock', partner: 'neutral' };
    case 'my-research/sealed':
      return { you: 'happy', other: 'happy', partner: 'neutral' };
    case 'closing/collect':
      return collectMoods(state);
    case 'closing/asked':
      return askedMoods(state);
    case 'closing/credits':
      return { you: 'happy', other: 'happy', partner: 'happy' };
    default:
      // The question, and the finding's beats with the lock open: both listen.
      if (beat.chapter === 'my-research') return { you: 'neutral', other: 'neutral', partner: 'neutral' };
      return { ...pairMoods(beat, state, asked), partner: 'neutral' };
  }
}

/**
 * The deck's faces, for the card on stage: tempted, and whoever sits across hoping, until the
 * visitor decides; then each reacts to what happened, never to why (ADR 0023).
 */
function deckMoods(state: StageState): StageView['moods'] {
  const at = state.deck?.at ?? 0;
  const card = DECK[at];
  const choice = state.deck?.choices[at];
  const seated: Mood = choice === undefined ? 'happy' : choice === 'roll' ? 'happy' : 'sad';
  const you: Mood = choice === undefined ? 'tempted' : choice === 'dont' ? 'neutral' : card?.partner === 'same' ? 'proud' : 'happy';
  return card?.partner === 'switched' ? { you, other: 'neutral', partner: seated } : { you, other: seated, partner: 'neutral' };
}

/**
 * Chapter 8's faces as the other asks one last time: tempted, and the other hoping if it was
 * promised; then each takes the answer as it comes, never why (ADR 0023). It is only an answer, so
 * nobody is betrayed by it.
 */
function collectMoods(state: StageState): StageView['moods'] {
  const promised = state.promised === true;
  switch (state.now ?? null) {
    case 'roll':
      return { you: promised ? 'proud' : 'happy', other: 'happy', partner: 'neutral' };
    case 'dont':
      return { you: 'neutral', other: 'worried', partner: 'neutral' };
    default:
      return { you: 'tempted', other: promised ? 'happy' : 'worried', partner: 'neutral' };
  }
}

/** The page asks whether it kept its own promise: the two wait, a little nervous, then take the answer. */
function askedMoods(state: StageState): StageView['moods'] {
  const kept = state.pageKept ?? null;
  const face: Mood = kept === null ? 'worried' : kept ? 'proud' : 'neutral';
  return { you: face, other: face, partner: 'neutral' };
}

function pairMoods(beat: { chapter: ChapterId; id: string }, state: StageState, asked: number): { readonly you: Mood; readonly other: Mood } {
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
    case 'fold/fold':
      return { you: 'shock', other: 'shock' };
    case 'fold/decide':
      return decisionMoods(state);
    case 'two-voices/voices':
      return { you: 'worried', other: aftermath(state) };
    case 'two-voices/together':
      return { you: 'happy', other: aftermath(state) };
    case 'two-voices/trick':
      return { you: 'shock', other: 'neutral' };
    default:
      return { you: 'worried', other: 'worried' };
  }
}

/** How the other is left by the decision of chapter 3, once the film has moved on. */
function aftermath(state: StageState): Mood {
  const decision = state.decision;
  if (decision?.phase !== 'outcome') return 'neutral';
  if (decision.choice === 'dont') return state.promised === true ? 'sad' : 'worried';
  return decision.realized.other > 0 ? 'happy' : 'worried';
}

/**
 * The decision's faces. Waiting, the circle is tempted and the square hopes, if it was promised.
 * Then each reacts to what happened, never to why (ADR 0023): keeping a promise is the "kept" face,
 * and breaking one leaves the other betrayed.
 */
function decisionMoods(state: StageState): { readonly you: Mood; readonly other: Mood } {
  const decision = state.decision ?? { phase: 'idle' };
  const hoping: Mood = state.promised === true ? 'happy' : 'worried';
  if (decision.phase === 'idle') return { you: 'tempted', other: hoping };
  if (decision.phase !== 'outcome') return { you: 'worried', other: 'worried' };
  if (decision.choice === 'dont') return { you: 'neutral', other: state.promised === true ? 'sad' : 'worried' };
  return {
    you: state.promised === true ? 'proud' : 'happy',
    other: decision.realized.other > 0 ? 'happy' : 'shock',
  };
}

/** The golden thread: tied once promised, broken if the visitor keeps the money after promising. */
export function threadState(state: StageState): ThreadState {
  if (state.promised !== true) return 'none';
  const decision = state.decision;
  return decision?.phase === 'outcome' && decision.choice === 'dont' ? 'broken' : 'tied';
}

export function stageAt(p: number, state: StageState, portrait: boolean, reduced: boolean): StageView {
  const screens = p * TOTAL_SCREENS;
  // What moves stands at its pose with reduced motion; the light and the moods follow the scroll.
  const m = reduced ? poseAt(screens) : screens;
  const beat = beatAt(screens + LEAD);

  // The day's light keeps the open film's clock, so the lock's state never changes it (./timeline.ts).
  const day = lightAt(screens);
  const light = Object.fromEntries(LIGHT_SURFACES.map((s) => [s, sample(LIGHT[s], day)])) as Record<LightSurface, string>;
  const lamp = easeInOut(progress(day, LAMP_FROM, Math.min(1, LAMP_FROM + 0.05)));
  const stars = easeInOut(progress(day, LAMP_FROM, Math.min(1, LAMP_FROM + 0.06)));

  const rooms = eased(m, INTO_ROOMS) * (1 - eased(m, OUT_OF_ROOMS));
  const boardShown = eased(m, BOARD_DOWN);
  const folded = eased(m, FOLD);
  const boardSeen = boardShown * (1 - folded);
  const table = portrait ? SPREAD.portrait : SPREAD.landscape;
  const apart = portrait ? ROOMS_SPREAD.portrait : ROOMS_SPREAD.landscape;
  // Chapter 6's signs hang over the table until chapter 7 comes.
  const signsDown = eased(m, REAL_IN) * (1 - eased(m, SIGNS_UP));

  const shot: Shot = {
    cx: sample(SHOTS.cx, at(m)),
    cy: sample(SHOTS.cy, at(m)),
    width: sample(SHOTS.width, at(m)),
    widthPortrait: sample(SHOTS.widthPortrait, at(m)),
    // While the board, chapter 6's signs or the lamp's shade hang in view, the view keeps them clear
    // of the spool in the corner; out of sight, each constraint is far away.
    top: Math.min(
      BOARD.card.y - BOARD_MARGIN + (1 - boardSeen) * 2000,
      SIGN.top - SIGNS_MARGIN + (1 - signsDown) * 2000,
      SHADE.top - SHADE_MARGIN + (1 - eased(m, SHADE_DOWN)) * 2000,
    ),
  };

  const columns = state.columns ?? NO_PICKS;
  const inTrap = m >= TRAP[0];
  const board = {
    shown: boardShown,
    folded,
    column: inTrap || boardShown < 0.5 ? null : currentColumn(columns),
    tags: boardShown === 0 ? NO_TAGS : inTrap ? TRAP_TAGS : cellTags(columns),
  };

  // The coins: the round's while its card has the stage, then the decision's once it is made.
  const round = state.round ?? null;
  const decision = state.decision ?? { phase: 'idle' as const };
  const outcome = decision.phase === 'outcome' ? decision : null;
  const coins =
    m < DECIDE[0]
      ? {
          you: round?.payoff.you ?? 0,
          other: round?.payoff.other ?? 0,
          shown: round === null ? 0 : eased(m, [ROUND_COINS[0], ROUND_COINS[0] + 0.2]) * (1 - eased(m, [ROUND_COINS[1] - 0.2, ROUND_COINS[1]])),
        }
      : {
          you: outcome?.realized.you ?? 0,
          other: outcome?.realized.other ?? 0,
          // The decision's coins stay until the voices come.
          shown: outcome === null ? 0 : eased(m, [DECIDE[0], DECIDE[0] + 0.2]) * (1 - eased(m, [VOICES_IN[0], VOICES_IN[0] + 0.4])),
        };

  // The other speaks first, as the chat opens; the visitor's bubble comes with their message. When
  // the visitor receives (chapter 5), the other speaks again: the promise it makes them.
  const talking = eased(m, CHAT) * (1 - eased(m, [OUT_OF_ROOMS[0], OUT_OF_ROOMS[0] + 0.5]));
  const promising = eased(m, RECEIVE_IN) * (1 - eased(m, REVEAL_SWAP));
  const waiting = state.promised == null ? eased(m, WAITING) * (1 - eased(m, [INTO_ROOMS[0], INTO_ROOMS[0] + 0.3])) : 0;
  const bubbles = { you: state.chat ? talking : 0, other: Math.max(talking, promising, waiting) };
  // The die floats over the table in chapter 0 and leaves with the rooms; it comes back out of the
  // board's fold and rests on the table for the decision, until chapter 7's engine takes its place.
  // In chapter 8 the engine goes back up, and the die floats again, showing its face of chapter 0.
  const reborn = m >= (INTO_ROOMS[1] + FOLD[0]) / 2;
  const engineDown = eased(m, ENGINE_IN) * (1 - eased(m, ENGINE_UP));
  const back = eased(m, DIE_BACK);
  const die =
    back > 0
      ? { y: DIE.floats, opacity: back, floating: true, rolling: false, face: RESTING_FACE }
      : {
          y: reborn ? DIE.folds + (DIE.rests - DIE.folds) * eased(m, DIE_DROP) : DIE.floats,
          opacity: reborn ? eased(m, [DIE_DROP[0] - 0.15, DIE_DROP[0] + 0.05]) * (1 - eased(m, [ENGINE_IN[0], ENGINE_IN[0] + 0.3])) : 1 - eased(m, [INTO_ROOMS[0], INTO_ROOMS[0] + 0.4]),
          floating: m < 1.5,
          rolling: decision.phase === 'die',
          face: outcome?.face ?? RESTING_FACE,
        };
  const asked = progress(p, at(0.6), at(1.35));

  const spread = table + (apart - table) * rooms;
  const seats = castPositions(spread);

  // Chapter 5: the square leaves for another table in the dark and the triangle sits down; on the
  // deck, whoever the card on stage says; the table as it was to receive; and the switch again.
  // Chapter 6 brings back the table as it was, and chapter 8's credits the triangle, for the bow.
  const deckAt = state.deck?.at ?? 0;
  const card = DECK[deckAt] ?? DECK[0];
  const asAtTable = tableLayout(seats.other);
  const asSwitched = switchedLayout(seats.other, portrait);
  const onCard = card?.partner === 'same' ? asAtTable : asSwitched;
  const layout = [
    [asSwitched, eased(m, SWAP)],
    [onCard, eased(m, DECK_IN)],
    [asAtTable, eased(m, RECEIVE_IN)],
    [asSwitched, eased(m, REVEAL_SWAP)],
    [asAtTable, eased(m, REAL_IN)],
    [curtainLayout(seats.other, portrait), eased(m, CREDITS_IN)],
  ].reduce<Layout>((from, [to, t]) => mixLayout(from, to as Layout, t as number), asAtTable);
  const cast = { you: seats.you, ...layout };

  // The golden thread: the visitor's own promise, from the circle to the square wherever it stands;
  // on the deck, each card's promise; none while the visitor receives.
  const onDeck = m >= DECK_IN[1] - 0.3 && m < RECEIVE_IN[0];
  const cardChoice = state.deck?.choices[deckAt];
  const thread = {
    state: onDeck ? (card?.partner === 'same' && cardChoice === 'dont' ? 'broken' : 'tied') : threadState(state),
    drawn: onDeck || state.promised === true ? 1 : 0,
    shown: Math.min(1, 1 - eased(m, RECEIVE_IN) + eased(m, REAL_IN)),
  } as const;

  const figures = eased(m, EXPECTED);
  const signs = {
    shown: signsDown,
    x: SIGN_X[portrait ? 'portrait' : 'landscape'],
    same: state.guesses?.same === undefined ? figures : 1,
    switched: state.guesses?.switched === undefined ? figures : 1,
    expected: figures,
  };

  // The lights go out once for the blackout and flicker for the reveal.
  const dark = Math.max(
    0.92 * eased(m, LIGHTS_OUT) * (1 - eased(m, LIGHTS_ON)),
    0.85 * eased(m, FLICKER_OUT) * (1 - eased(m, FLICKER_ON)),
  );

  // The voices float over the circle from chapter 4 on. What the other expects looks at whoever
  // sits across; my word, at the square it was given to, wherever it went. While they disagree about
  // the trick they look at each other, and while the visitor receives both watch the seat.
  const voiceAt = voicePlaces(cast.you, portrait);
  // Whoever sits across the table: the triangle only while it is in the square's seat, not at the bow.
  const partnerSeated = cast.partner.opacity > 0.5 && cast.partner.scale === 1;
  const seated = partnerSeated ? cast.partner.at : cast.other.at;
  const receiving = beat.chapter === 'blackout' && (beat.beat.id === 'receive' || beat.beat.id === 'reveal');
  const arguing = beat.chapter === 'two-voices' && beat.beat.id === 'trick';
  // In chapter 7 both watch the engine once it is on the table.
  const watching = engineDown > 0.5;
  const voices = {
    shown: eased(m, VOICES_IN),
    at: voiceAt,
    look: watching
      ? { expects: ENGINE_AT, word: ENGINE_AT }
      : arguing
        ? { expects: voiceAt.word, word: voiceAt.expects }
        : { expects: seated, word: receiving ? seated : cast.other.at },
    glow: eased(m, CONCLUSION) * (1 - eased(m, RESEARCH_IN)),
    globe: partnerSeated ? ('partner' as const) : ('other' as const),
  };

  const engine = { shown: engineDown, turn: Math.max(0, m - ENGINE_IN[0]) * GEAR_TURN };
  // The envelope opens only where the finding follows it: with the lock open.
  const envelope = LOCKED_BEATS.length > 0 ? eased(m, OPENING) : 0;

  return {
    shot,
    light,
    lamp,
    shade: eased(m, SHADE_DOWN),
    stars,
    beat: { chapter: beat.chapter, id: beat.beat.id },
    spread,
    cast,
    voices,
    dark,
    signs,
    rooms,
    bulbs: rooms * (1 - boardShown),
    table: 1 - rooms,
    die,
    board,
    engine,
    envelope,
    coins,
    bubbles,
    moods: moodsAt({ chapter: beat.chapter, id: beat.beat.id }, state, asked),
    thread,
  };
}

/** Where the circle and the square stand for a given spread (their faces' centres). */
export function castPositions(spread: number): { readonly you: readonly [number, number]; readonly other: readonly [number, number] } {
  return { you: [WORLD.centre - spread, 500], other: [WORLD.centre + spread, 496] };
}

/** Where the thread leaves the circle, and where it reaches the square at a place. */
function threadEnds(you: Point, other: Place): { readonly from: Point; readonly to: Point } {
  return { from: [you[0] + 50, you[1] - 14], to: [other.at[0] - 50 * other.scale, other.at[1] - 14 * other.scale] };
}

/**
 * The broken thread: each end still tied to its character, curling where it snapped (ADR 0027). A
 * square farther off holds a shorter end.
 */
export function brokenBetween(you: Point, other: Place): readonly [string, string] {
  const { from, to } = threadEnds(you, other);
  const reach = Math.min(90, (to[0] - from[0]) * 0.3);
  const curl = ([x, y]: Point, side: 1 | -1, size: number): string => {
    const r = reach * size;
    return [
      `M${x} ${y}`,
      `C${x + side * r * 0.5} ${y - 40 * size} ${x + side * r} ${y - 10 * size} ${x + side * r * 0.8} ${y + 22 * size}`,
      `C${x + side * r * 0.65} ${y + 40 * size} ${x + side * r * 0.35} ${y + 28 * size} ${x + side * r * 0.5} ${y + 12 * size}`,
    ].join(' ');
  };
  return [curl(from, 1, 1), curl(to, -1, other.scale)];
}

/**
 * The golden thread between the circle and the square: it leaves each side and sags upwards. To a
 * square gone to another table it rises higher, over whoever now sits in its seat.
 */
export function threadBetween(you: Point, other: Place): string {
  const { from, to } = threadEnds(you, other);
  const lift = Math.min(96, (to[0] - from[0] + 100) * 0.18) + (1 - other.scale) * 120;
  const pull = (to[0] - from[0]) * 0.3;
  return `M${from[0]} ${from[1]} C${from[0] + pull} ${from[1] - lift} ${to[0] - pull} ${to[1] - lift} ${to[0]} ${to[1]}`;
}

const atSeat = (spread: number): { readonly you: Point; readonly other: Place } => {
  const { you, other } = castPositions(spread);
  return { you, other: { at: other, scale: 1, opacity: 1 } };
};

/** The broken thread between the circle and the square at their seats. */
export function brokenThreadPaths(spread: number): readonly [string, string] {
  const { you, other } = atSeat(spread);
  return brokenBetween(you, other);
}

/** The golden thread between the circle and the square at their seats. */
export function threadPath(spread: number): string {
  const { you, other } = atSeat(spread);
  return threadBetween(you, other);
}

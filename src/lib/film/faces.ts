/**
 * The cast's faces (ADR 0027): mouths and brows for each mood, drawn around the face's centre in a
 * 128-unit character. The same paths serve the build (the storyboard's still frames) and the film's
 * script, so a mood looks the same with and without JavaScript.
 */

export const MOODS = ['neutral', 'happy', 'proud', 'tempted', 'worried', 'shock', 'sad'] as const;
export type Mood = (typeof MOODS)[number];

/** The triangle, the new partner, needs only these (ADR 0027). */
export const TRIANGLE_MOODS = ['neutral', 'happy', 'shock', 'sad'] as const satisfies readonly Mood[];

export interface Face {
  readonly mouth: string;
  readonly brows: readonly [string, string];
  /** Eyes shut in a smile instead of open. */
  readonly closedEyes: boolean;
  /** Where the pupils look, in units. */
  readonly look: readonly [number, number];
  readonly blush: boolean;
  readonly sweat: boolean;
  readonly tear: boolean;
}

export const FACES: Record<Mood, Face> = {
  neutral: { mouth: 'M-16 22 L16 22', brows: ['M-32 -34 L-10 -32', 'M32 -34 L10 -32'], closedEyes: false, look: [0, 0], blush: false, sweat: false, tear: false },
  happy: { mouth: 'M-20 16 Q0 38 20 16', brows: ['M-32 -34 L-10 -37', 'M32 -34 L10 -37'], closedEyes: false, look: [0, 0], blush: false, sweat: false, tear: false },
  proud: { mouth: 'M-22 14 Q0 42 22 14 Z', brows: ['M-32 -36 L-10 -39', 'M32 -36 L10 -39'], closedEyes: true, look: [0, 0], blush: true, sweat: false, tear: false },
  tempted: { mouth: 'M-18 24 Q4 32 20 18', brows: ['M-32 -32 L-10 -32', 'M32 -36 L10 -32'], closedEyes: false, look: [7, 0], blush: false, sweat: true, tear: false },
  worried: { mouth: 'M-20 26 Q-10 18 0 26 Q10 34 20 26', brows: ['M-32 -27 L-10 -37', 'M32 -27 L10 -37'], closedEyes: false, look: [0, 2], blush: false, sweat: false, tear: false },
  shock: { mouth: 'M-9 24 Q0 10 9 24 Q0 40 -9 24 Z', brows: ['M-32 -42 L-10 -45', 'M32 -42 L10 -45'], closedEyes: false, look: [0, 0], blush: false, sweat: false, tear: false },
  sad: { mouth: 'M-18 32 Q0 16 18 32', brows: ['M-32 -28 L-10 -36', 'M32 -28 L10 -36'], closedEyes: false, look: [0, 4], blush: false, sweat: false, tear: true },
};

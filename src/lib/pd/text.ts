/** What the best-reply exercise says at each step, from its state. Pure; the client script only shows it. */
import { fill } from '../template';
import { currentColumn, type Conclusion, type Pick, type State, type Tag } from './bestReply';
import { otherMove, type Move } from './game';
import type { PdStrings } from './strings';

const column = (strings: PdStrings, other: Move) => strings[`pd.col.${other}`];

/** The question for the column being asked about, or null once both are done. */
export function askText(strings: PdStrings, state: State): string | null {
  const other = currentColumn(state);
  return other === null ? null : fill(strings['pd.ask'], { column: column(strings, other) });
}

/** One pick against its alternative, e.g. "The other cooperates and you defect: you get 5. Cooperating would have given you 3." */
export function pickText(strings: PdStrings, pick: Pick): string {
  return fill(strings['pd.result'], {
    column: column(strings, pick.other),
    choice: strings[`pd.choice.${pick.you}`],
    payoff: pick.payoff,
    alternative: strings[`pd.alt.${otherMove(pick.you)}`],
    other: pick.alternative,
  });
}

/** The two sentences of the finished exercise: dominance, then where two players who reason so end up. */
export function conclusionText(strings: PdStrings, conclusion: Conclusion): [string, string] {
  const [first, second] = conclusion.columns;
  return [
    fill(strings['pd.done.dominant'], {
      move: strings[`pd.alt.${conclusion.dominant}`],
      a: first?.dominant ?? '',
      b: first?.alternative ?? '',
      c: second?.dominant ?? '',
      d: second?.alternative ?? '',
    }),
    fill(strings['pd.done.equilibrium'], { eq: conclusion.equilibrium, better: conclusion.better }),
  ];
}

export function tagText(strings: PdStrings, tag: Tag): string {
  return strings[`pd.tag.${tag}`];
}

import { describe, expect, it } from 'vitest';
import en from '../../i18n/en.json';
import es from '../../i18n/es.json';
import { conclusion, reduce, START, type State } from './bestReply';
import { pdStrings } from './strings';
import { askText, conclusionText, pickText } from './text';

const strings = { en: pdStrings((key) => en[key]), es: pdStrings((key) => es[key]) };
const done: State = [
  { type: 'pick', move: 'cooperate' },
  { type: 'pick', move: 'defect' },
].reduce((state, event) => reduce(state, event as Parameters<typeof reduce>[1]), START);

describe('the best-reply exercise, in words', () => {
  it('asks about each column in turn, then nothing', () => {
    expect(askText(strings.en, START)).toBe('The other cooperates. What do you do?');
    expect(askText(strings.es, reduce(START, { type: 'pick', move: 'defect' }))).toBe('El otro traiciona. ¿Qué haces?');
    expect(askText(strings.en, done)).toBeNull();
  });

  it('states each pick against the alternative', () => {
    const [first, second] = done.picks;
    expect(first && pickText(strings.en, first)).toBe('The other cooperates and you cooperate: you get 3. Defecting would have given you 5.');
    expect(second && pickText(strings.es, second)).toBe('El otro traiciona y tú traicionas: te llevas 1. Cooperar te habría dado 0.');
  });

  it('concludes with dominance and with (1, 1) instead of (3, 3)', () => {
    const result = conclusion(done);
    expect(result && conclusionText(strings.en, result)).toEqual([
      'Defecting pays you more in both columns: 5 against 3, and 1 against 0. It is a dominant strategy.',
      'If both reason this way, both end at (1, 1), when cooperating would give both (3, 3).',
    ]);
    expect(result && conclusionText(strings.es, result)[1]).toBe('Si los dos razonan así, terminan en (1, 1), cuando cooperar les daría (3, 3).');
  });
});

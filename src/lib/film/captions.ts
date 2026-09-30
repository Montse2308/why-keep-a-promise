/**
 * A chapter's captions (ADR 0021): its rendered Markdown, split at the marks where each beat's card
 * starts, `<!-- beat:<id> -->`. The chapter declares its beats in src/lib/chapters.ts; the Markdown
 * must mark exactly those, in the same order, with nothing before the first mark.
 *
 * Captions carry no figures of their own: a number they need is a `{name}` placeholder that the
 * build fills from the pure modules, so the film's payoffs always come from the code
 * (docs/content-rules.md, rule (k)).
 */
const MARK = /<!--\s*beat:([a-z-]+)\s*-->/g;

/** The caption of each beat, by id, in order. Throws if the marks and the beats disagree. */
export function splitBeats(html: string, beats: readonly string[]): Map<string, string> {
  const marks = [...html.matchAll(MARK)];
  const found = marks.map((m) => m[1] ?? '');
  if (found.join(',') !== beats.join(',')) {
    throw new Error(`The captions mark the beats [${found.join(', ')}], not [${beats.join(', ')}]`);
  }
  const before = html.slice(0, marks[0]?.index ?? html.length);
  if (before.trim() !== '') throw new Error('The captions have text before their first beat mark');
  return new Map(
    marks.map((m, i) => {
      const start = (m.index ?? 0) + m[0].length;
      const end = marks[i + 1]?.index ?? html.length;
      return [m[1] ?? '', html.slice(start, end).trim()] as const;
    }),
  );
}

const LOCK = /<!--\s*lock\s*-->/g;

/**
 * A chapter's captions split where its lock begins (ADR 0026): chapter 7's finding follows a
 * `<!-- lock -->` mark, and only a build with the lock open renders what comes after it. Every other
 * chapter has no mark, so all of it is open. At most one mark.
 */
export function splitAtLock(html: string): { readonly open: string; readonly locked: string } {
  const marks = [...html.matchAll(LOCK)];
  if (marks.length > 1) throw new Error('A chapter has at most one lock mark');
  const mark = marks[0];
  if (!mark) return { open: html, locked: '' };
  return { open: html.slice(0, mark.index), locked: html.slice(mark.index + mark[0].length) };
}

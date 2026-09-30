/**
 * A subpage's prose, or a home section's (ADR 0019), split where the page inserts a component or
 * where the lock begins (ADR 0026). The Markdown marks those places with HTML comments:
 *
 *   <!-- slot:best-response -->   a component the view renders in place
 *   <!-- lock -->                 everything after it renders only behind the lock
 *
 * The view renders the open part always and the locked part only when `findingUnlocked()` says so,
 * so locked prose never reaches a locked build.
 */

export const SLOTS = ['best-response', 'switch-table', 'guilt-chart', 'author-links'] as const;
export type SlotName = (typeof SLOTS)[number];

export type Segment = { readonly kind: 'html'; readonly html: string } | { readonly kind: 'slot'; readonly name: SlotName };

export interface SubpageParts {
  /** Rendered in every build. */
  readonly open: readonly Segment[];
  /** Rendered only behind the lock; empty when the prose has no lock marker. */
  readonly locked: readonly Segment[];
}

const MARKER = /<!--\s*(lock|slot:([a-z-]+))\s*-->/g;

function isSlot(name: string): name is SlotName {
  return (SLOTS as readonly string[]).includes(name);
}

/** Splits rendered Markdown at its markers. Throws on an unknown slot or a second lock marker. */
export function splitSubpage(html: string): SubpageParts {
  const open: Segment[] = [];
  const locked: Segment[] = [];
  let target = open;
  let last = 0;
  const pushHtml = (end: number) => {
    const chunk = html.slice(last, end);
    if (chunk.trim() !== '') target.push({ kind: 'html', html: chunk });
  };

  for (const match of html.matchAll(MARKER)) {
    pushHtml(match.index);
    last = match.index + match[0].length;
    if (match[1] === 'lock') {
      if (target === locked) throw new Error('A subpage has at most one lock marker');
      target = locked;
      continue;
    }
    const name = match[2] ?? '';
    if (!isSlot(name)) throw new Error(`Unknown subpage slot "${name}"`);
    target.push({ kind: 'slot', name });
  }
  pushHtml(html.length);
  return { open, locked };
}

/** The slots a list of segments uses, in order. */
export function slotsIn(segments: readonly Segment[]): SlotName[] {
  return segments.flatMap((segment) => (segment.kind === 'slot' ? [segment.name] : []));
}

/** Code blocks can scroll sideways on a phone; `tabindex="0"` lets a keyboard reach and scroll them. */
export function focusableCode(html: string): string {
  return html.replace(/<pre(?=[\s>])/g, '<pre tabindex="0"');
}

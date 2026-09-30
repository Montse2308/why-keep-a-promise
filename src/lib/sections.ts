/**
 * The home page's order (ADR 0019): the acts, with a section that is not an act after them. "About"
 * comes after act 6, last. "The research" came after act 4; chapter 7 tells it now (ADR 0021).
 * Section ids share the acts' namespace on `/`.
 */
import { ACTS, type Act } from './acts';
import type { UiKey } from './i18n';
import type { SlotName } from './subpages';

export interface Section {
  /** Section id on `/`; identical in every locale. */
  readonly id: 'about';
  readonly titleKey: UiKey;
  /** The act this section follows. */
  readonly after: Act['id'];
  /** The only slots its prose may use. */
  readonly slots: readonly SlotName[];
}

export const SECTIONS: readonly Section[] = [
  { id: 'about', titleKey: 'section.about.title', after: 'how-its-built', slots: ['author-links'] },
];

export type Block = { readonly kind: 'act'; readonly act: Act } | { readonly kind: 'section'; readonly section: Section };

/** Every block of `/`, in order: each act, then any section that follows it. */
export function homeBlocks(acts: readonly Act[] = ACTS, sections: readonly Section[] = SECTIONS): Block[] {
  for (const section of sections) {
    if (!acts.some((act) => act.id === section.after)) throw new Error(`Section "${section.id}" follows an unknown act "${section.after}"`);
  }
  return acts.flatMap((act): Block[] => [
    { kind: 'act', act },
    ...sections.filter((section) => section.after === act.id).map((section): Block => ({ kind: 'section', section })),
  ]);
}

/** The ids of `/`, in order. */
export function homeIds(blocks: readonly Block[] = homeBlocks()): string[] {
  return blocks.map((block) => (block.kind === 'act' ? block.act.id : block.section.id));
}

export const AUTHOR = {
  github: 'https://github.com/Montse2308',
  linkedin: 'https://www.linkedin.com/in/montserrat-ximena-hern%C3%A1ndez-gallegos-536195276',
  /** The author as a reference names her (APA), and as BibTeX spells her, accents escaped: /finding's «How to cite». */
  cite: 'Hernández Gallegos, M. X.',
  bibtex: "Hern{\\'a}ndez Gallegos, Montserrat Ximena",
} as const;

/**
 * The working paper (ADR 0034): its title, in English in both languages, and its page on SSRN, which
 * holds the PDF. The status sentence shows the title linked to that page on chapter 7's stamp, the
 * notebook's entry for the finding and /finding (docs/content-rules.md, rule (b)). The link is a
 * placeholder until step 3 of docs/launch-checklist.md, and while it is, the lock stays closed
 * (src/lib/lock.ts).
 */
export const WORKING_PAPER = {
  title: 'Promises to whom: Identifying personal guilt and partner-specific commitment across populations',
  ssrn: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218',
  /** Its DOI, which /sources links its reference to (ADR 0035). */
  doi: '10.2139/ssrn.7580218',
  /** The day SSRN made it public, and its year, as /finding cites it (ADR 0037). */
  published: '2026-10-08',
  year: 2026,
} as const;

/**
 * The simulation engine (ADR 0034): its repository and the DOI of its release archived on Zenodo,
 * linked only behind the lock (src/lib/engine.ts). The DOI is a placeholder until step 3 of
 * docs/launch-checklist.md. Its title, version and licence are those of the release's CITATION.cff,
 * as /finding cites it (ADR 0037).
 */
export const ENGINE = {
  repository: 'https://github.com/Montse2308/Dilema-del-Prisionero',
  doi: '10.5281/zenodo.23222610',
  title: 'Promises to whom: Identifying personal guilt and partner-specific commitment across populations',
  version: '1.0.0',
  year: 2026,
  license: 'MIT',
} as const;

export const AUTHOR = {
  github: 'https://github.com/Montse2308',
  linkedin: 'https://www.linkedin.com/in/montserrat-ximena-hern%C3%A1ndez-gallegos-536195276',
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
  ssrn: 'SSRN_URL_PENDING',
} as const;

/**
 * The simulation engine (ADR 0034): its repository and the DOI of its release archived on Zenodo,
 * linked only behind the lock (src/lib/engine.ts). The DOI is a placeholder until step 3 of
 * docs/launch-checklist.md.
 */
export const ENGINE = {
  repository: 'https://github.com/Montse2308/Dilema-del-Prisionero',
  doi: 'ENGINE_DOI_PENDING',
} as const;

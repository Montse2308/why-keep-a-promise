export const AUTHOR = {
  github: 'https://github.com/Montse2308',
  linkedin: 'https://www.linkedin.com/in/montserrat-ximena-hern%C3%A1ndez-gallegos-536195276',
} as const;

/**
 * Manuscript status shown on chapter 7's stamp, the notebook's entry for the finding and /finding
 * (docs/content-rules.md, rule (b)).
 * It switches to 'under-review' only at step 4 of docs/launch-checklist.md.
 */
export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'in-preparation';

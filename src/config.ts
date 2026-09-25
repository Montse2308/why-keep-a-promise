export const AUTHOR = {
  github: 'https://github.com/Montse2308',
  linkedin: 'https://www.linkedin.com/in/montserrat-ximena-hernández-gallegos-536195276',
} as const;

/**
 * Manuscript status shown in act 5 and /finding (see docs/content-rules.md).
 * It switches to 'under-review' only at step 4 of docs/launch-checklist.md.
 */
export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'in-preparation';

export const AUTHOR = {
  github: 'https://github.com/Montse2308',
  // TODO(F1): LinkedIn profile URL, pending from Montse. The link stays hidden while empty.
  linkedin: '',
} as const;

/**
 * Manuscript status shown in act 5 and /finding (see docs/content-rules.md).
 * It switches to 'under-review' only at step 4 of docs/launch-checklist.md.
 */
export const MANUSCRIPT_STATUS: 'in-preparation' | 'under-review' = 'in-preparation';

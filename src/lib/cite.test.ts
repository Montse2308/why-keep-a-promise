import { describe, expect, it } from 'vitest';
import { bibtexKey, engineApa, paperApa, paperBibtex } from './cite';

/** «How to cite» as Montse approved it (2026-10-10), word for word. */
const APPROVED = {
  paper:
    'Hernández Gallegos, M. X. (2026). Promises to whom: Identifying personal guilt and partner-specific commitment across populations [Working paper]. SSRN. https://doi.org/10.2139/ssrn.7580218',
  bibtex: [
    '@misc{hernandezgallegos2026promises,',
    "  author = {Hern{\\'a}ndez Gallegos, Montserrat Ximena},",
    '  title  = {Promises to whom: Identifying personal guilt and partner-specific commitment across populations},',
    '  year   = {2026},',
    '  note   = {SSRN Working Paper},',
    '  doi    = {10.2139/ssrn.7580218},',
    '  url    = {https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7580218}',
    '}',
  ].join('\n'),
  engine:
    'Hernández Gallegos, M. X. (2026). Promises to whom: Identifying personal guilt and partner-specific commitment across populations (Version 1.0.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.23222610',
};

describe("/finding's «How to cite» (ADR 0037)", () => {
  it('cites the working paper as APA, with the kind of document in the page’s language', () => {
    expect(paperApa('Working paper')).toBe(APPROVED.paper);
    expect(paperApa('Documento de trabajo')).toBe(APPROVED.paper.replace('[Working paper]', '[Documento de trabajo]'));
  });

  it('cites it as BibTeX with `note`, never `howpublished`', () => {
    expect(bibtexKey()).toBe('hernandezgallegos2026promises');
    expect(paperBibtex()).toBe(APPROVED.bibtex);
    expect(paperBibtex()).not.toMatch(/howpublished/);
  });

  it('cites the engine’s release as software', () => {
    expect(engineApa()).toBe(APPROVED.engine);
  });
});

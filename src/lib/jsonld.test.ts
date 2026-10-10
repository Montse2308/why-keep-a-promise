import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import { FIGURES } from '../content/figures';
import { AUTHOR, ENGINE, WORKING_PAPER } from '../config';
import { findingGraph, jsonLd } from './jsonld';

describe("/finding's structured data (ADR 0037, E2)", () => {
  const graph = findingGraph(en['author.name']);
  const [paper, engine] = graph['@graph'];

  it('describes the working paper as a ScholarlyArticle, from src/config.ts', () => {
    expect(paper).toMatchObject({
      '@type': 'ScholarlyArticle',
      name: WORKING_PAPER.title,
      datePublished: '2026-10-08',
      identifier: { propertyID: 'DOI', value: WORKING_PAPER.doi },
      url: WORKING_PAPER.ssrn,
      publisher: { '@type': 'Organization', name: 'SSRN' },
      inLanguage: 'en',
    });
    expect(paper?.author).toMatchObject({ '@type': 'Person', name: 'Montserrat Ximena Hernández Gallegos', '@id': 'https://orcid.org/0009-0003-8778-0440' });
    expect(AUTHOR.orcid).toBe('https://orcid.org/0009-0003-8778-0440');
  });

  it('describes the engine as SoftwareSourceCode: its repository, its DOI on Zenodo, TypeScript and MIT', () => {
    expect(engine).toMatchObject({
      '@type': 'SoftwareSourceCode',
      codeRepository: ENGINE.repository,
      identifier: { propertyID: 'DOI', value: ENGINE.doi },
      programmingLanguage: 'TypeScript',
      license: 'https://spdx.org/licenses/MIT.html',
    });
  });

  it('parses back as JSON, with no "<" that could close its script, and names no figure of the finding', () => {
    const text = jsonLd({ ...graph, note: '</script>' });
    expect(text).not.toContain('<');
    expect(JSON.parse(text).note).toBe('</script>');
    const plain = jsonLd(graph);
    const findingFigures = FIGURES.filter((figure) => figure.source === 'curve-finding' || figure.source === 'working-paper-results').map((figure) => figure.value);
    for (const value of ['14.44', '3.55', '4.20', '0.277', '20/3', '10.1', '65.9']) expect(findingFigures).toContain(value);
    for (const value of findingFigures.filter((v) => v.includes('.') || v.includes('/'))) expect(plain, value).not.toContain(value);
  });
});

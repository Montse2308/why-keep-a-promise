/**
 * /finding's structured data (ADR 0037, E2): the working paper as a schema.org `ScholarlyArticle` and
 * the engine as a `SoftwareSourceCode`, both from src/config.ts, so search engines and reference
 * managers read them as what they are. It names no figure of the finding. Rendered only behind the lock
 * (ADR 0034), in /finding's head.
 */
import { AUTHOR, ENGINE, WORKING_PAPER } from '../config';

const doiUrl = (doi: string) => `https://doi.org/${doi}`;

/** The author as schema.org writes a person, identified by her ORCID. */
function person(name: string) {
  return { '@type': 'Person', '@id': AUTHOR.orcid, name, identifier: AUTHOR.orcid, sameAs: [AUTHOR.orcid] };
}

/** The graph of /finding: the working paper and its engine. `author` is her full name, as the page writes it. */
export function findingGraph(author: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ScholarlyArticle',
        '@id': doiUrl(WORKING_PAPER.doi),
        headline: WORKING_PAPER.title,
        name: WORKING_PAPER.title,
        author: person(author),
        datePublished: WORKING_PAPER.published,
        identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: WORKING_PAPER.doi },
        sameAs: doiUrl(WORKING_PAPER.doi),
        url: WORKING_PAPER.ssrn,
        publisher: { '@type': 'Organization', name: 'SSRN' },
        inLanguage: 'en',
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': doiUrl(ENGINE.doi),
        name: ENGINE.title,
        author: person(author),
        codeRepository: ENGINE.repository,
        identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: ENGINE.doi },
        sameAs: doiUrl(ENGINE.doi),
        version: ENGINE.version,
        programmingLanguage: 'TypeScript',
        license: `https://spdx.org/licenses/${ENGINE.license}.html`,
      },
    ],
  };
}

/** JSON for a `<script type="application/ld+json">`: a `<` can never close the element early. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

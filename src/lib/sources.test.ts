import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';
import sourcesDoc from '../../docs/sources.md?raw';
import { CITATIONS, FIGURES, SOURCE_KEYS } from '../content/figures';
import { CHAPTER_IDS } from './chapters';
import { SUBPAGES } from './routes';
import { ENGINE, WORKING_PAPER } from '../config';
import {
  atKey,
  ENTRIES,
  figuresOf,
  FINDING,
  FINDING_ENTRIES,
  FINDING_WORKS,
  findingEntriesOf,
  findingWorksOf,
  referenceHtml,
  RETIRED,
  shownUrl,
  UNVERIFIED,
  whatKey,
  WORKS,
  worksOf,
} from './sources';

const dictionaries: Record<'en' | 'es', Record<string, string>> = { en, es };

/** The register's block for a key in docs/sources.md: its "Cifra" entries. */
const blocks = (key: string) => sourcesDoc.split('- Cifra:').filter((block) => block.includes(`Clave: \`${key}\``));

describe('/sources, from the register of figures (ADR 0024)', () => {
  it('places every key of the register exactly once: on /sources, behind the lock or retired', () => {
    for (const key of SOURCE_KEYS) {
      const places = ENTRIES.filter((entry) => entry.source === key).length + (FINDING.includes(key) ? 1 : 0) + (RETIRED.includes(key) ? 1 : 0);
      expect(places, key).toBe(1);
    }
  });

  it('retires only keys whose figures docs/sources.md says are no longer shown', () => {
    for (const key of RETIRED) {
      expect(blocks(key).length, key).toBeGreaterThan(0);
      for (const block of blocks(key)) expect(block, key).toMatch(/ya no se muestra/);
    }
  });

  it("keeps the finding's sources out of the open part, which looks the same in both states (ADR 0034, ADR 0035)", () => {
    expect([...FINDING].sort()).toEqual(['curve', 'curve-finding', 'kawagoe-narita-2014', 'vanberg-second-order']);
    for (const entry of ENTRIES) {
      for (const place of entry.places) expect('page' in place && place.page === 'finding', entry.source).toBe(false);
      expect(FINDING).not.toContain(entry.source);
    }
    expect(WORKS.map((candidate) => candidate.id)).not.toContain('kawagoe-narita-2014');
    for (const candidate of WORKS) expect(candidate.reference.text).not.toMatch(/Kawagoe/);
  });

  it('says "pages to be verified" exactly for the keys docs/sources.md still has to verify', () => {
    const pending = ENTRIES.map((entry) => entry.source).filter((key) => blocks(key).some((block) => /Por verificar; bloquea el lanzamiento/.test(block)));
    expect(UNVERIFIED).toEqual(pending);
    expect(UNVERIFIED).toEqual([]);
    // A key is either still to be verified or has its place in the source written, never both.
    for (const key of UNVERIFIED) {
      expect(Object.hasOwn(en, `sources.at.${key}`), key).toBe(false);
      expect(Object.hasOwn(es, `sources.at.${key}`), key).toBe(false);
    }
    expect(en['sources.unverified']).toBe('Pages to be verified.');
    expect(es['sources.unverified']).toBe('Páginas por verificar.');
  });

  it('lists the figures the register gives each key, each once, in its order', () => {
    expect(figuresOf('vanberg-rates')).toEqual(['73', '54']);
    expect(figuresOf('vanberg-beliefs')).toEqual(['70', '68', '100']);
    for (const entry of ENTRIES) {
      const registered = FIGURES.filter((figure) => figure.source === entry.source).map((figure) => figure.value);
      expect(figuresOf(entry.source)).toEqual([...new Set(registered)]);
    }
  });

  it('describes every entry in both languages, in words, and says where in the source in both or in neither', () => {
    for (const entry of [...ENTRIES, ...FINDING_ENTRIES]) {
      for (const dictionary of Object.values(dictionaries)) {
        expect(dictionary[whatKey(entry)], entry.source).toBeTruthy();
        // The figures themselves come from the register, never from the description.
        expect(dictionary[whatKey(entry)], entry.source).not.toMatch(/\d/);
      }
      expect(Object.hasOwn(en, atKey(entry)), entry.source).toBe(Object.hasOwn(es, atKey(entry)));
    }
    // And no description is left over for a key that is not on the page.
    const keys = Object.keys(en).filter((key) => key.startsWith('sources.') && key.split('.').length === 2 && !['sources.figures', 'sources.at', 'sources.used', 'sources.supplements', 'sources.engine', 'sources.unverified'].includes(key));
    expect(keys.sort()).toEqual([...ENTRIES, ...FINDING_ENTRIES].map((entry) => whatKey(entry)).sort());
  });

  it('cites each work as the prose does, "Author (year)", with a full reference of that year', () => {
    for (const candidate of WORKS) {
      const citation = CITATIONS.find((c) => c.source === candidate.id);
      expect(citation, candidate.id).toBeDefined();
      expect(candidate.cite).toBe(`${citation?.authors.join(' and ')} (${citation?.year})`);
      expect(candidate.reference.text).toContain(`(${citation?.year}).`);
    }
  });

  it('points only at chapters of the film and pages of the notebook that exist, every entry at one at least', () => {
    for (const entry of [...ENTRIES, ...FINDING_ENTRIES]) {
      expect(entry.places.length, entry.source).toBeGreaterThan(0);
      for (const place of entry.places) {
        if ('chapter' in place) expect(CHAPTER_IDS).toContain(place.chapter);
        else expect(SUBPAGES).toContain(place.page);
      }
    }
  });

  it('meets the works in the order the film does', () => {
    expect(worksOf().map((group) => group.work.id)).toEqual(['axelrod-hamilton-1981', 'case-2017', 'vanberg-2008', 'charness-dufwenberg-2006', 'battigalli-dufwenberg-2007']);
    expect(worksOf().flatMap((group) => group.entries)).toHaveLength(ENTRIES.length);
  });

  it("lists the finding's sources behind the lock, each with its figures and where it is used (ADR 0035)", () => {
    // Vanberg's (2008) belief the curve holds fixed goes under Vanberg (2008); the rest under works of their own.
    expect(findingEntriesOf('vanberg-2008').map((entry) => entry.source)).toEqual(['vanberg-second-order']);
    for (const candidate of WORKS) if (candidate.id !== 'vanberg-2008') expect(findingEntriesOf(candidate.id), candidate.id).toEqual([]);
    expect(findingWorksOf().map((group) => [group.work.id, group.entries.map((entry) => entry.source)])).toEqual([
      ['kawagoe-narita-2014', ['kawagoe-narita-2014']],
      ['working-paper', ['curve', 'curve-finding']],
    ]);
    // Every finding entry leads to chapter 7's finding or to /finding, and nowhere else.
    for (const entry of FINDING_ENTRIES) {
      for (const place of entry.places) expect('chapter' in place ? place.chapter : place.page, entry.source).toMatch(/^(my-research|finding)$/);
    }
    expect(figuresOf('vanberg-second-order')).toEqual(['76']);
    expect(figuresOf('curve')).toEqual(['0', '100', '15', '65', '10', '5', '38']);
  });

  it('names θ and c on /sources but never gives their values, which only /finding shows (ADR 0035)', () => {
    const parameters = FIGURES.filter((figure) => figure.parameter);
    expect(parameters.map((figure) => [figure.source, figure.value, figure.what.slice(0, 2)])).toEqual([
      ['curve-finding', '0.6', 'θ,'],
      ['curve-finding', '5', 'c,'],
    ]);
    expect(figuresOf('curve-finding')).toEqual(['14.44', '4', '20/3', '6.67', '10.1', '65.9', '70', '10', '76', '100']);
    expect(en['sources.curve-finding']).toMatch(/θ and c are given, and explained, only on that page\.$/);
    expect(es['sources.curve-finding']).toMatch(/θ y c se dan, y se explican, solo en esa página\.$/);
  });

  it("cites the finding's own works in full: Kawagoe and Narita (2014) as the prose does, and the working paper with its engine", () => {
    const [kawagoe, paper] = FINDING_WORKS;
    const citation = CITATIONS.find((c) => c.source === 'kawagoe-narita-2014');
    expect(kawagoe?.cite).toBe(`${citation?.authors.join(' and ')} (${citation?.year})`);
    expect(kawagoe?.reference.text).toContain(`(${citation?.year}).`);
    // The working paper: its title and link from src/config.ts, the same as the status sentence's.
    expect(paper?.reference.text).toContain(`*${WORKING_PAPER.title}*`);
    expect(paper?.reference.url).toBe(WORKING_PAPER.ssrn);
    expect(paper?.parts?.map((item) => item.url)).toEqual([ENGINE.repository, `https://doi.org/${ENGINE.doi}`]);
    expect(paper?.partsKey).toBe('sources.engine');
    // Neither is a work of the open part.
    for (const candidate of FINDING_WORKS) expect(WORKS.map((open) => open.id)).not.toContain(candidate.id);
  });

  it('writes a reference as escaped HTML, with its titles in italics, and a URL as a reader does', () => {
    expect(referenceHtml('Name, A. (2014). Title. *Journal of Behavior & Organization*, 102.')).toBe(
      'Name, A. (2014). Title. <i>Journal of Behavior &amp; Organization</i>, 102.',
    );
    expect(referenceHtml('<b>*A*</b>')).toBe('&lt;b&gt;<i>A</i>&lt;/b&gt;');
    expect(shownUrl('https://ncase.me/trust/')).toBe('ncase.me/trust');
    expect(shownUrl('https://doi.org/10.3982/ECTA7673SUPPA')).toBe('doi.org/10.3982/ECTA7673SUPPA');
  });
});

import { describe, expect, it } from 'vitest';
import { TAIL, externalAttrs, externalLinks, externalMark, externalRel, externalText, isExternal, withMark } from './external';
import { href } from './routes';

const MARK_EN =
  '<span class="link-out"><span aria-hidden="true">↗</span><span class="visually-hidden" lang="en"> (opens in a new tab)</span></span>';
const MARK_ES =
  '<span class="link-out"><span aria-hidden="true">↗</span><span class="visually-hidden" lang="es"> (se abre en otra pestaña)</span></span>';

describe('external links (step 8.3)', () => {
  it('tells a link that leaves the site from one inside it', () => {
    expect(isExternal('https://ncase.me/trust/')).toBe(true);
    expect(isExternal('http://example.org')).toBe(true);
    expect(isExternal('//example.org/x')).toBe(true);
    expect(isExternal(href('en', 'sources'))).toBe(false);
    expect(isExternal(href('es', 'home', 'two-rooms'))).toBe(false);
    expect(isExternal('#main')).toBe(false);
    // The working paper's link while it is a placeholder (ADR 0034).
    expect(isExternal('SSRN_URL_PENDING')).toBe(false);
  });

  it('adds noopener and noreferrer to what rel already says, once each', () => {
    expect(externalRel()).toBe('noopener noreferrer');
    expect(externalRel('me')).toBe('me noopener noreferrer');
    expect(externalRel('noopener me')).toBe('noopener me noreferrer');
  });

  it('gives a component an external link’s attributes, and an internal one none', () => {
    expect(externalAttrs('https://github.com/Montse2308', 'me')).toEqual({ target: '_blank', rel: 'me noopener noreferrer' });
    expect(externalAttrs('https://doi.org/10.1126/science.7466396')).toEqual({ target: '_blank', rel: 'noopener noreferrer' });
    expect(externalAttrs(href('en', 'about'))).toEqual({});
    expect(externalAttrs(href('en', 'about'), 'me')).toEqual({ rel: 'me' });
  });

  it('ends an external link with the arrow, hidden, and the notice in the page’s language', () => {
    expect(externalMark('https://ncase.me/trust/', 'en')).toBe(MARK_EN);
    expect(externalMark('https://ncase.me/trust/', 'es')).toBe(MARK_ES);
    expect(externalMark(href('en', 'home'), 'en')).toBe('');
  });

  it('opens the prose’s external links in a new tab, and leaves the rest as written', () => {
    const html = `<p>See <a href="https://ncase.me/trust/"><em>The Evolution of Trust</em></a>, or <a href="${href('en', 'dilemma')}">the dilemma</a> and <a href="#x">here</a>.</p>`;
    expect(externalLinks(html, 'en')).toBe(
      `<p>See <a href="https://ncase.me/trust/" target="_blank" rel="noopener noreferrer"><em>The Evolution of <span class="link-end">Trust${MARK_EN}</span></em></a>, or <a href="${href('en', 'dilemma')}">the dilemma</a> and <a href="#x">here</a>.</p>`,
    );
    expect(externalLinks('<p>No links.</p>', 'es')).toBe('<p>No links.</p>');
  });

  it('keeps a link’s other attributes and merges its rel', () => {
    expect(externalLinks('<a class="x" rel="me" href="https://github.com/Montse2308">GitHub</a>', 'es')).toBe(
      `<a class="x" href="https://github.com/Montse2308" target="_blank" rel="me noopener noreferrer"><span class="link-end">GitHub${MARK_ES}</span></a>`,
    );
  });

  it('can run twice: a link that already says where it opens is left as it is', () => {
    const once = externalLinks('<a href="https://doi.org/10.1/x">10.1/x</a> (<a href="https://doi.org/10.2/y">y</a>)', 'en');
    expect(externalLinks(once, 'en')).toBe(once);
    expect(once.match(/target="_blank"/g)).toHaveLength(2);
    expect(once.split('↗')).toHaveLength(3);
  });

  it('glues the arrow to the last characters of the link, so it never wraps alone (step 9.10)', () => {
    const doi = 'https://doi.org/10.1016/j.econlet.2022.110931';
    expect(TAIL).toBe(6);
    // A long address keeps only its last characters with the arrow, and may break before them.
    expect(externalText('doi.org/10.1016/j.econlet.2022.110931', doi, 'en')).toBe(
      `doi.org/10.1016/j.econlet.2022.<span class="link-end">110931${MARK_EN}</span>`,
    );
    // A short last word goes whole; the text is escaped, and a reference counts as one character.
    expect(externalText('Read the paper', doi, 'es')).toBe(`Read the <span class="link-end">paper${MARK_ES}</span>`);
    expect(externalText('A & B', doi, 'en')).toBe(`A &amp; <span class="link-end">B${MARK_EN}</span>`);
    expect(withMark('xx&amp;Jerry', doi, 'en')).toBe(`xx<span class="link-end">&amp;Jerry${MARK_EN}</span>`);
    // Inside the element the text ends in, as the working paper's title in its <cite>.
    expect(withMark('<cite lang="en">Promises to whom</cite>', doi, 'en')).toBe(
      `<cite lang="en">Promises to <span class="link-end">whom${MARK_EN}</span></cite>`,
    );
    // Nothing to glue to: the mark at the end, as before. A link inside the site is left as written.
    expect(withMark('text ', doi, 'en')).toBe(`text ${MARK_EN}`);
    expect(externalText('About & me', href('en', 'about'), 'en')).toBe('About &amp; me');
  });
});

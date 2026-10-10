import { describe, expect, it } from 'vitest';
import { externalAttrs, externalLinks, externalMark, externalRel, isExternal } from './external';
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
      `<p>See <a href="https://ncase.me/trust/" target="_blank" rel="noopener noreferrer"><em>The Evolution of Trust</em>${MARK_EN}</a>, or <a href="${href('en', 'dilemma')}">the dilemma</a> and <a href="#x">here</a>.</p>`,
    );
    expect(externalLinks('<p>No links.</p>', 'es')).toBe('<p>No links.</p>');
  });

  it('keeps a link’s other attributes and merges its rel', () => {
    expect(externalLinks('<a class="x" rel="me" href="https://github.com/Montse2308">GitHub</a>', 'es')).toBe(
      `<a class="x" href="https://github.com/Montse2308" target="_blank" rel="me noopener noreferrer">GitHub${MARK_ES}</a>`,
    );
  });

  it('can run twice: a link that already says where it opens is left as it is', () => {
    const once = externalLinks('<a href="https://doi.org/10.1/x">10.1/x</a> (<a href="https://doi.org/10.2/y">y</a>)', 'en');
    expect(externalLinks(once, 'en')).toBe(once);
    expect(once.match(/target="_blank"/g)).toHaveLength(2);
    expect(once.split('↗')).toHaveLength(3);
  });
});

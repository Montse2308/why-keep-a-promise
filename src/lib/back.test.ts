import { describe, expect, it } from 'vitest';
import { goesBack } from './back';

const site = 'https://montse2308.github.io/why-keep-a-promise';

describe('the way back to the film', () => {
  it('goes back when the page came from the film the link leads to', () => {
    expect(goesBack(`${site}/`, `${site}/#two-rooms`, 3)).toBe(true);
    expect(goesBack(`${site}/es/`, `${site}/es/`, 2)).toBe(true);
  });

  it('is a plain link from anywhere else', () => {
    expect(goesBack(`${site}/dilemma/`, `${site}/`, 3)).toBe(false);
    expect(goesBack(`${site}/`, `${site}/es/`, 3)).toBe(false);
    expect(goesBack('https://www.linkedin.com/', `${site}/`, 3)).toBe(false);
    expect(goesBack('', `${site}/`, 3)).toBe(false);
  });

  it('is a plain link when there is no entry to go back to, as in a new tab', () => {
    expect(goesBack(`${site}/`, `${site}/`, 1)).toBe(false);
  });

  it('is a plain link when an address cannot be read', () => {
    expect(goesBack('not a url', `${site}/`, 3)).toBe(false);
  });
});

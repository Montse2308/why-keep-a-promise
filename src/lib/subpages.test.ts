import { describe, expect, it } from 'vitest';
import { focusableCode, slotsIn, splitSubpage } from './subpages';

describe('splitSubpage', () => {
  it('keeps prose without markers open', () => {
    expect(splitSubpage('<p>One.</p>')).toEqual({ open: [{ kind: 'html', html: '<p>One.</p>' }], locked: [] });
  });

  it('puts a slot in place, between the prose around it', () => {
    const { open } = splitSubpage('<p>Before.</p>\n<!-- slot:best-response -->\n<p>After.</p>');
    expect(open.map((segment) => segment.kind)).toEqual(['html', 'slot', 'html']);
    expect(slotsIn(open)).toEqual(['best-response']);
  });

  it('moves everything after the lock marker to the locked part, slots included', () => {
    const parts = splitSubpage('<p>Open.</p><!-- lock --><p>Locked.</p><!--slot:guilt-chart--><p>More.</p>');
    expect(parts.open).toEqual([{ kind: 'html', html: '<p>Open.</p>' }]);
    expect(parts.locked.map((segment) => segment.kind)).toEqual(['html', 'slot', 'html']);
    expect(slotsIn(parts.locked)).toEqual(['guilt-chart']);
  });

  it('locks a whole page when the marker comes first', () => {
    const parts = splitSubpage('<!-- lock -->\n<p>All of it.</p>');
    expect(parts.open).toEqual([]);
    expect(parts.locked).toHaveLength(1);
  });

  it('rejects an unknown slot and a second lock marker', () => {
    expect(() => splitSubpage('<!-- slot:chart -->')).toThrow(/Unknown subpage slot/);
    expect(() => splitSubpage('<!-- lock --><p>x</p><!-- lock -->')).toThrow(/at most one/);
  });
});

describe('focusableCode', () => {
  it('makes every code block reachable from the keyboard, and nothing else', () => {
    expect(focusableCode('<pre><code>x</code></pre><pre class="a">y</pre><p>pre</p><preview>')).toBe(
      '<pre tabindex="0"><code>x</code></pre><pre tabindex="0" class="a">y</pre><p>pre</p><preview>',
    );
  });
});

// The portrait /about serves (ADR 0045): a square working file, no EXIF, drawn as a rounded rectangle.
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import author from '../src/components/notebook/Author.astro?raw';

const file = 'src/assets/about/montse.jpg';

describe('the portrait on /about (ADR 0045)', () => {
  it('is a square of at most 640 px and carries no EXIF, ICC, IPTC or XMP', async () => {
    const meta = await sharp(file).metadata();
    expect(meta.width).toBe(meta.height);
    expect(meta.width).toBeLessThanOrEqual(640);
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toBeUndefined();
    expect(meta.iptc).toBeUndefined();
    expect(meta.xmp).toBeUndefined();
  });

  it('draws a rounded rectangle, with an empty alt', () => {
    expect(author).not.toContain('data-shape');
    expect(author).toContain('border-radius: var(--radius-lg)');
    expect(author).toContain('alt=""');
    expect(author).toContain("formats={['avif', 'webp']}");
    expect(author).toContain('densities={[1, 2]}');
    expect(author).toContain('width={160}');
    expect(author).toContain('loading="eager"');
    expect(author).toContain('display: inline-flex');
    expect(author).toContain('align-items: center');
  });
});

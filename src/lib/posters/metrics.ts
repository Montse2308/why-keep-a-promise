/**
 * Advance widths from a TrueType font, enough to break a poster's title into lines that fit
 * (./poster.ts): the renderer draws text but does not wrap it. Reads only `head` (units per em),
 * `hhea` and `hmtx` (advances) and `cmap` (characters to glyphs, formats 4 and 12). Kerning is left
 * out: it narrows a line by a few units at most, so a line measured without it never overflows.
 */

export interface FontMetrics {
  readonly unitsPerEm: number;
  /** Advance of a character, in font units; the missing glyph's advance for one the font lacks. */
  advance(char: string): number;
}

function tables(view: DataView): Map<string, { offset: number; length: number }> {
  const found = new Map<string, { offset: number; length: number }>();
  const count = view.getUint16(4);
  for (let i = 0; i < count; i++) {
    const at = 12 + i * 16;
    const tag = String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3));
    found.set(tag, { offset: view.getUint32(at + 8), length: view.getUint32(at + 12) });
  }
  return found;
}

/** A cmap subtable as a lookup from code point to glyph id. */
function cmapLookup(view: DataView, offset: number): (point: number) => number {
  const format = view.getUint16(offset);
  if (format === 4) {
    const segments = view.getUint16(offset + 6) / 2;
    const ends = offset + 14;
    const starts = ends + segments * 2 + 2;
    const deltas = starts + segments * 2;
    const ranges = deltas + segments * 2;
    return (point) => {
      if (point > 0xffff) return 0;
      for (let i = 0; i < segments; i++) {
        if (point > view.getUint16(ends + i * 2)) continue;
        const start = view.getUint16(starts + i * 2);
        if (point < start) return 0;
        const delta = view.getInt16(deltas + i * 2);
        const rangeOffset = view.getUint16(ranges + i * 2);
        if (rangeOffset === 0) return (point + delta) & 0xffff;
        const glyph = view.getUint16(ranges + i * 2 + rangeOffset + (point - start) * 2);
        return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
      }
      return 0;
    };
  }
  if (format === 12) {
    const groups = view.getUint32(offset + 12);
    return (point) => {
      for (let i = 0; i < groups; i++) {
        const at = offset + 16 + i * 12;
        const start = view.getUint32(at);
        if (point >= start && point <= view.getUint32(at + 4)) return view.getUint32(at + 8) + (point - start);
      }
      return 0;
    };
  }
  throw new Error(`cmap format ${format} is not read`);
}

/** Reads the advance widths of a TrueType or OpenType (glyf or CFF) font. */
export function readMetrics(bytes: Uint8Array): FontMetrics {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const found = tables(view);
  const head = found.get('head');
  const hhea = found.get('hhea');
  const hmtx = found.get('hmtx');
  const cmap = found.get('cmap');
  if (!head || !hhea || !hmtx || !cmap) throw new Error('Not a TrueType font: head, hhea, hmtx or cmap is missing');

  const unitsPerEm = view.getUint16(head.offset + 18);
  const longMetrics = view.getUint16(hhea.offset + 34);
  // Prefer the full Unicode subtable (3, 10), then the BMP one (3, 1), then Unicode platform 0.
  const subtables = Array.from({ length: view.getUint16(cmap.offset + 2) }, (_, i) => {
    const at = cmap.offset + 4 + i * 8;
    return { platform: view.getUint16(at), encoding: view.getUint16(at + 2), offset: cmap.offset + view.getUint32(at + 4) };
  });
  const rank = (s: { platform: number; encoding: number }) =>
    s.platform === 3 && s.encoding === 10 ? 0 : s.platform === 3 && s.encoding === 1 ? 1 : s.platform === 0 ? 2 : 9;
  const chosen = subtables.filter((s) => rank(s) < 9).sort((a, b) => rank(a) - rank(b))[0];
  if (!chosen) throw new Error('No Unicode cmap subtable');
  const glyphOf = cmapLookup(view, chosen.offset);

  const advanceOf = (glyph: number) => view.getUint16(hmtx.offset + Math.min(glyph, longMetrics - 1) * 4);
  const cache = new Map<string, number>();
  return {
    unitsPerEm,
    advance(char) {
      let width = cache.get(char);
      if (width === undefined) {
        width = advanceOf(glyphOf(char.codePointAt(0) ?? 0));
        cache.set(char, width);
      }
      return width;
    },
  };
}

/** Whether the font has a glyph of its own for the character (not the missing glyph). */
export function hasGlyph(bytes: Uint8Array, char: string): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const cmap = tables(view).get('cmap');
  if (!cmap) return false;
  const count = view.getUint16(cmap.offset + 2);
  for (let i = 0; i < count; i++) {
    const at = cmap.offset + 4 + i * 8;
    const platform = view.getUint16(at);
    const encoding = view.getUint16(at + 2);
    if ((platform === 3 && (encoding === 1 || encoding === 10)) || platform === 0) {
      if (cmapLookup(view, cmap.offset + view.getUint32(at + 4))(char.codePointAt(0) ?? 0) !== 0) return true;
    }
  }
  return false;
}

/** The width of a line of text at a font size, in pixels, with letter spacing after every character. */
export function lineWidth(text: string, metrics: FontMetrics, size: number, letterSpacing = 0): number {
  let units = 0;
  let chars = 0;
  for (const char of text) {
    units += metrics.advance(char);
    chars++;
  }
  return (units / metrics.unitsPerEm) * size + letterSpacing * Math.max(0, chars - 1);
}

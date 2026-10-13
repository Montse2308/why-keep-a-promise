/**
 * An ICO whose images are complete PNG files, which current browsers and Google read.
 * Little-endian: reserved 0, type 1, then one 16-byte directory entry per image, then the PNGs.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngSize(png: Uint8Array): { width: number; height: number } {
  if (png.length < 24 || !PNG_SIGNATURE.every((byte, index) => png[index] === byte)) throw new Error('an ICO image has to be a PNG');
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Packs PNG files into one ICO, in the order given. A side of 256 or more is stored as 0. */
export function pngIco(pngs: readonly Uint8Array[]): Uint8Array {
  if (pngs.length < 1 || pngs.length > 0xffff) throw new Error('an ICO holds from 1 to 65535 images');
  const images = pngs.map((png) => ({ png, ...pngSize(png) }));
  const header = 6 + 16 * images.length;
  const total = header + images.reduce((sum, image) => sum + image.png.byteLength, 0);
  const bytes = new Uint8Array(total);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = header;
  for (const [index, image] of images.entries()) {
    const entry = 6 + index * 16;
    view.setUint8(entry, image.width >= 256 ? 0 : image.width);
    view.setUint8(entry + 1, image.height >= 256 ? 0 : image.height);
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, image.png.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    bytes.set(image.png, offset);
    offset += image.png.byteLength;
  }
  return bytes;
}

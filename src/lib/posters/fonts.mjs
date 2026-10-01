// The posters' font files, read from disk at build time. Plain JavaScript, as the scripts in
// scripts/ are: the project carries no Node type definitions, and only this file needs Node's API.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The posters' fonts, from the project's root (where Astro and Vitest run). */
export const POSTER_FONT_DIR = join(process.cwd(), 'src', 'assets', 'fonts', 'posters');

/**
 * @param {string} file a file name in POSTER_FONT_DIR
 * @returns {string}
 */
export function posterFontPath(file) {
  return join(POSTER_FONT_DIR, file);
}

/**
 * @param {string} file a file name in POSTER_FONT_DIR
 * @returns {Uint8Array}
 */
export function readPosterFont(file) {
  return new Uint8Array(readFileSync(posterFontPath(file)));
}

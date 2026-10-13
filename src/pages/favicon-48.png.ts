/**
 * The tab's icon at 48 px, rendered to PNG at build time (src/lib/posters/icon.ts): /favicon-48.png.
 * The page names the SVG first; this is the square a search engine can read.
 */
import type { APIRoute } from 'astro';
import { FAVICON_PNG } from '../lib/posters/icon';
import { iconPng } from '../lib/posters/render';

const size = FAVICON_PNG[0];

export const GET: APIRoute = () => new Response(new Uint8Array(iconPng(size)), { headers: { 'Content-Type': 'image/png' } });

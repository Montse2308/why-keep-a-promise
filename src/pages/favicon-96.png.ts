/**
 * The tab's icon at 96 px, rendered to PNG at build time (src/lib/posters/icon.ts): /favicon-96.png.
 * The same drawing as /favicon-48.png, twice the side.
 */
import type { APIRoute } from 'astro';
import { FAVICON_PNG } from '../lib/posters/icon';
import { iconPng } from '../lib/posters/render';

const size = FAVICON_PNG[1];

export const GET: APIRoute = () => new Response(new Uint8Array(iconPng(size)), { headers: { 'Content-Type': 'image/png' } });

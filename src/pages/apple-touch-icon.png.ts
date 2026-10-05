/**
 * The icon a phone keeps for the page on its home screen, rendered to PNG at build time
 * (src/lib/posters/icon.ts): /apple-touch-icon.png, which every page names in its head.
 */
import type { APIRoute } from 'astro';
import { touchIconPng } from '../lib/posters/render';

export const GET: APIRoute = () => new Response(new Uint8Array(touchIconPng()), { headers: { 'Content-Type': 'image/png' } });

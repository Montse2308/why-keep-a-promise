/**
 * /favicon.ico, for a crawler or an old browser that asks the root for an icon the page does not
 * name. It carries the 48 px PNG (src/lib/posters/icon.ts).
 */
import type { APIRoute } from 'astro';
import { FAVICON_PNG } from '../lib/posters/icon';
import { pngIco } from '../lib/posters/ico';
import { iconPng } from '../lib/posters/render';

export const GET: APIRoute = () => new Response(new Uint8Array(pngIco([iconPng(FAVICON_PNG[0])])), { headers: { 'Content-Type': 'image/x-icon' } });

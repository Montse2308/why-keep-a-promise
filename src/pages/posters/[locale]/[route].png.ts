/**
 * One poster per page and per language (ADR 0025), rendered to PNG at build time:
 * /posters/<locale>/<route>.png, which each page names in its Open Graph tags (BaseLayout.astro).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { LOCALES, type Locale } from '../../../lib/locales';
import { posterPng } from '../../../lib/posters/render';
import { ROUTES, type Route } from '../../../lib/routes';

export const getStaticPaths = (() => LOCALES.flatMap((locale) => ROUTES.map((route) => ({ params: { locale, route } })))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const png = new Uint8Array(posterPng(params.locale as Locale, params.route as Route));
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};

/**
 * The sitemap, written at build time to /sitemap.xml (src/lib/sitemap.ts): our own endpoint, with no
 * dependency (ADR 0025).
 */
import type { APIRoute } from 'astro';
import { MANUSCRIPT_STATUS } from '../config';
import { findingUnlocked } from '../lib/lock';
import { sitemapXml } from '../lib/sitemap';

export const GET: APIRoute = ({ site }) => {
  const xml = sitemapXml(site ?? 'https://montse2308.github.io', import.meta.env.BASE_URL, findingUnlocked(MANUSCRIPT_STATUS, import.meta.env.DEV));
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

/**
 * Reading prose as a visitor meets it, for the tests of the site's text: the acts, the notebook's
 * subpages, the home sections and the film's captions.
 */
import { CURVE_VALUES } from '../src/lib/curve/values';
import { ENGINE_TOKEN } from '../src/lib/engine';
import { splitAtLock } from '../src/lib/film/captions';
import { FILM_VALUES } from '../src/lib/film/values';
import { fill } from '../src/lib/template';

/**
 * A chapter's captions as the visitor reads them, the way the build fills them: the placeholders of
 * the open part from the film's values, and those of chapter 7's finding, after its lock mark, from
 * the curve's (ADR 0034). The engine's links, where the finding writes `{engine}`, are left out: they
 * are addresses, not prose, as `readable` leaves out link targets.
 */
export function filledCaptions(body: string): string {
  const { open, locked } = splitAtLock(body);
  return `${fill(open, FILM_VALUES)}${fill(locked.replaceAll(ENGINE_TOKEN, ''), CURVE_VALUES)}`;
}

/**
 * The prose a reader sees: no TODO markers, no HTML comments (slot, lock and beat marks), no code
 * blocks, no link targets (the engine's links included), no list numbers, no table rules.
 */
export function readable(body: string, { tables = true } = {}): string {
  return body
    .replaceAll(ENGINE_TOKEN, ' ')
    .replace(/<(span|p) class="todo">[\s\S]*?<\/\1>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^```[\s\S]*?^```/gm, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/^\s*\d+\.\s/gm, ' ')
    .split('\n')
    .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line))
    .filter((line) => tables || !line.trim().startsWith('|'))
    .join('\n');
}

/** "Author (year)", or "Author (year, §3.2(ii))" with a section. */
export const CITATION = /(\p{Lu}[\p{L}'-]+(?:\s+(?:and|y)\s+\p{Lu}[\p{L}'-]+)*)\s+\((\d{4})(?:,\s*§\d+(?:\.\d+)*(?:\([ivx]+\))?)?\)/gu;
const NUMBER = /\d+(?:[/.,]\d+)*/g;

export function citationsIn(text: string): string[] {
  return [...text.matchAll(CITATION)].map((m) => `${(m[1] ?? '').split(/\s+(?:and|y)\s+/).join('+')} ${m[2]}`);
}

export function numbersIn(text: string): string[] {
  return [...text.replace(CITATION, ' ').matchAll(NUMBER)].map((m) => m[0]);
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

/** Whole sentences as a reader meets them: no Markdown marks, quotes or case, one space between words. */
export function sentences(body: string): string[] {
  return readable(body, { tables: false })
    .replace(/^#+\s*(.*)$/gm, '$1.')
    .replace(/^\s*[-*]\s+/gm, ' ')
    .replace(/[*_`"«»“”]/g, '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim().toLocaleLowerCase('und'))
    .filter((sentence) => /\p{L}/u.test(sentence));
}

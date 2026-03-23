/**
 * Natural language date parsing using chrono-node.
 *
 * parseNaturalDate scans free-form text for date expressions (e.g. "next
 * Friday", "tomorrow", "in 3 days") and returns the ISO date string together
 * with the original text stripped of the matched date phrase.
 *
 * forwardDate: true means ambiguous references like "Friday" always resolve to
 * a future date rather than the most recent past occurrence.
 */

import * as chrono from 'chrono-node';

export interface ParsedDate {
  /** ISO 8601 date string (YYYY-MM-DD), or null when no date was detected. */
  date: string | null;
  /**
   * The original text with the matched date phrase removed and trimmed.
   * Falls back to the original text when no date was found.
   */
  cleanText: string;
}

/**
 * Parse a free-form task title for an embedded natural language date.
 *
 * @example
 * parseNaturalDate('Buy groceries next Friday')
 * // => { date: '2026-03-27', cleanText: 'Buy groceries' }
 *
 * parseNaturalDate('Quarterly review')
 * // => { date: null, cleanText: 'Quarterly review' }
 */
export function parseNaturalDate(text: string): ParsedDate {
  if (!text.trim()) {
    return { date: null, cleanText: text };
  }

  const results = chrono.parse(text, new Date(), { forwardDate: true });

  if (results.length === 0) {
    return { date: null, cleanText: text };
  }

  const parsed = results[0];
  const date = parsed.start.date().toISOString().split('T')[0];

  // Remove the matched date phrase from the title, then tidy up whitespace.
  const cleanText = text
    .replace(parsed.text, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { date, cleanText: cleanText || text };
}

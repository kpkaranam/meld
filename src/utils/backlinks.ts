/**
 * Utility functions for wiki-style [[double bracket]] note linking.
 */

/**
 * Extract all [[note title]] references from a plain-text string.
 * Deduplicates results so each referenced title appears only once.
 *
 * @param plainText - The plain-text content of a note (content_plain column)
 * @returns Array of unique note titles referenced via [[title]] syntax
 *
 * @example
 * extractBacklinks("See [[Project Alpha]] and [[Meeting Notes]]")
 * // => ["Project Alpha", "Meeting Notes"]
 */
export function extractBacklinks(plainText: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(plainText)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)]; // deduplicate
}

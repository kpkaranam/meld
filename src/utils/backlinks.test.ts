import { describe, it, expect } from 'vitest';
import { extractBacklinks } from './backlinks';

describe('extractBacklinks', () => {
  it('returns an empty array when no wiki-links are present', () => {
    expect(extractBacklinks('Just plain text with no links.')).toEqual([]);
  });

  it('returns an empty array for an empty string', () => {
    expect(extractBacklinks('')).toEqual([]);
  });

  it('extracts a single [[wiki-link]]', () => {
    expect(extractBacklinks('See [[Project Alpha]] for details.')).toEqual([
      'Project Alpha',
    ]);
  });

  it('extracts multiple [[wiki-links]] from the same text', () => {
    const text = 'Related to [[Meeting Notes]] and [[Project Alpha]].';
    expect(extractBacklinks(text)).toEqual(['Meeting Notes', 'Project Alpha']);
  });

  it('deduplicates identical links that appear more than once', () => {
    const text = '[[Project Alpha]] is mentioned again in [[Project Alpha]].';
    expect(extractBacklinks(text)).toEqual(['Project Alpha']);
  });

  it('trims whitespace inside the brackets', () => {
    expect(extractBacklinks('See [[ Spaced Title ]].')).toEqual([
      'Spaced Title',
    ]);
  });

  it('preserves case of the title', () => {
    expect(extractBacklinks('[[My Note Title]]')).toEqual(['My Note Title']);
  });

  it('handles links at the very start and end of the string', () => {
    const text = '[[First]] in the middle [[Last]]';
    expect(extractBacklinks(text)).toEqual(['First', 'Last']);
  });

  it('ignores unclosed or malformed brackets', () => {
    // Single bracket — not a wiki-link
    expect(extractBacklinks('[Not a link]')).toEqual([]);
  });

  it('handles text with only wiki-links and no surrounding content', () => {
    expect(extractBacklinks('[[Solo Link]]')).toEqual(['Solo Link']);
  });
});

/**
 * Unit tests for the natural language date parser utility.
 *
 * Uses a fixed reference date of 2026-03-23 (Monday) so that relative
 * expressions like "next Friday" resolve deterministically.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseNaturalDate } from './dateParser';

// Fix the current date to 2026-03-23 (Monday) for stable assertions.
const FIXED_NOW = new Date('2026-03-23T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('parseNaturalDate', () => {
  it('returns null date and original text when no date phrase is present', () => {
    const result = parseNaturalDate('Buy groceries');
    expect(result.date).toBeNull();
    expect(result.cleanText).toBe('Buy groceries');
  });

  it('parses "tomorrow" correctly', () => {
    const result = parseNaturalDate('Call doctor tomorrow');
    expect(result.date).toBe('2026-03-24');
    expect(result.cleanText).toBe('Call doctor');
  });

  it('parses "next Friday" and strips it from the title', () => {
    const result = parseNaturalDate('Team lunch next Friday');
    // chrono-node interprets "next Friday" from Monday 2026-03-23 as the
    // Friday of the following week: 2026-04-03.
    expect(result.date).toBe('2026-04-03');
    expect(result.cleanText).toBe('Team lunch');
  });

  it('parses an explicit date like "March 30"', () => {
    const result = parseNaturalDate('Submit report March 30');
    expect(result.date).toBe('2026-03-30');
    expect(result.cleanText).toBe('Submit report');
  });

  it('falls back to original text when clean title would be empty', () => {
    // Input is entirely a date phrase
    const result = parseNaturalDate('tomorrow');
    expect(result.date).toBe('2026-03-24');
    // cleanText falls back to original text when stripping leaves nothing
    expect(result.cleanText).toBe('tomorrow');
  });

  it('returns null date and original text for an empty string', () => {
    const result = parseNaturalDate('');
    expect(result.date).toBeNull();
    expect(result.cleanText).toBe('');
  });

  it('returns null date for whitespace-only input', () => {
    const result = parseNaturalDate('   ');
    expect(result.date).toBeNull();
  });

  it('does not strip unrelated numeric text', () => {
    const result = parseNaturalDate('Buy 3 apples');
    // "3 apples" should not parse as a date
    expect(result.date).toBeNull();
    expect(result.cleanText).toBe('Buy 3 apples');
  });
});

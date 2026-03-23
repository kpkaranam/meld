import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate, formatRelativeDate, isOverdue } from './dates';

describe('formatDate', () => {
  it('formats a Date object', () => {
    expect(formatDate(new Date('2024-03-15'))).toBe('Mar 15, 2024');
  });

  it('formats a date string', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
  });
});

describe('formatRelativeDate', () => {
  it('returns a relative string with suffix', () => {
    const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
    expect(formatRelativeDate(pastDate)).toMatch(/ago$/);
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    // Fix "now" to 2024-06-15 noon UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for a date in the past', () => {
    expect(isOverdue('2024-06-14')).toBe(true);
  });

  it('returns false for today', () => {
    expect(isOverdue('2024-06-15')).toBe(false);
  });

  it('returns false for a future date', () => {
    expect(isOverdue('2024-06-16')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_SORT_ORDER,
} from './priorities';

describe('PRIORITY_LABELS', () => {
  it('has a label for every priority', () => {
    expect(PRIORITY_LABELS.none).toBe('None');
    expect(PRIORITY_LABELS.low).toBe('Low');
    expect(PRIORITY_LABELS.medium).toBe('Medium');
    expect(PRIORITY_LABELS.high).toBe('High');
  });
});

describe('PRIORITY_COLORS', () => {
  it('has a color class for every priority', () => {
    expect(PRIORITY_COLORS.none).toContain('text-gray');
    expect(PRIORITY_COLORS.low).toContain('text-blue');
    expect(PRIORITY_COLORS.medium).toContain('text-yellow');
    expect(PRIORITY_COLORS.high).toContain('text-red');
  });
});

describe('PRIORITY_SORT_ORDER', () => {
  it('sorts high before medium before low before none', () => {
    const priorities = ['none', 'low', 'medium', 'high'] as const;
    const sorted = [...priorities].sort(
      (a, b) => PRIORITY_SORT_ORDER[a] - PRIORITY_SORT_ORDER[b]
    );
    expect(sorted).toEqual(['high', 'medium', 'low', 'none']);
  });
});

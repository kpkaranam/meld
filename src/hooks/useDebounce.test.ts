import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebounce', () => {
  it('returns the initial value immediately without waiting for the delay', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('returns the debounced value only after the specified delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change the value — debounced output should not change immediately
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    // Advance time past the delay — debounced output should now reflect the new value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('resets the debounce timer when the value changes before the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    // First change — advance only partway
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('first');

    // Second change before the timer fires — should restart the clock
    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // Still only 300ms since the last change, so debounced value stays as 'first'
    expect(result.current).toBe('first');

    // Now advance past the full delay since the last change
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('third');
  });
});

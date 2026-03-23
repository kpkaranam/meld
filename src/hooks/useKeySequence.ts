/**
 * Hook for two-key sequential shortcuts (e.g. "g" then "i").
 *
 * Each sequence is an ordered list of keys. When all keys in a sequence are
 * pressed in order within `timeoutMs` milliseconds of one another, the
 * associated handler is called.
 *
 * Key matching is case-insensitive and ignores modifier keys.
 *
 * @example
 * useKeySequence([
 *   { keys: ['g', 'i'], handler: () => navigate('/inbox') },
 *   { keys: ['g', 't'], handler: () => navigate('/today') },
 * ]);
 */

import { useEffect, useRef } from 'react';

export interface KeySequence {
  /** Ordered list of keys that form the sequence. */
  keys: string[];
  /** Callback invoked when the full sequence is matched. */
  handler: () => void;
}

/**
 * @param sequences - Array of key sequences to listen for.
 * @param timeoutMs - Milliseconds after first key before the sequence resets.
 *                   Defaults to 1000ms.
 */
export function useKeySequence(
  sequences: KeySequence[],
  timeoutMs = 1000
): void {
  // Track keys pressed so far
  const pressedRef = useRef<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetSequence() {
      pressedRef.current = [];
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore events while focus is in a text field so we don't interfere with typing
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isEditable) {
        resetSequence();
        return;
      }

      // Ignore modifier-only keystrokes
      if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) return;
      // Skip if any modifier is held — those belong to useKeyboardShortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const next = [...pressedRef.current, key];

      // Check if any sequence starts with the current pressed keys
      const potentialMatches = sequences.filter((seq) =>
        seq.keys
          .slice(0, next.length)
          .every((k, i) => k.toLowerCase() === next[i])
      );

      if (potentialMatches.length === 0) {
        // No sequences can match — reset
        resetSequence();
        return;
      }

      // Reset existing timer; start a new one
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      pressedRef.current = next;

      // Check for complete matches
      const completeMatch = potentialMatches.find(
        (seq) => seq.keys.length === next.length
      );

      if (completeMatch) {
        e.preventDefault();
        resetSequence();
        completeMatch.handler();
        return;
      }

      // Still waiting for more keys — set timeout to reset
      timerRef.current = setTimeout(resetSequence, timeoutMs);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetSequence();
    };
  }, [sequences, timeoutMs]);
}

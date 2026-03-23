/**
 * Hook for registering global keyboard shortcuts on the window object.
 *
 * Shortcuts are matched against keydown events. Each shortcut may optionally
 * require a Ctrl/Cmd modifier and/or a Shift modifier. Key matching is
 * case-insensitive.
 *
 * The event listener is re-registered whenever the `shortcuts` array
 * reference changes, so callers should memoize the array (e.g. with
 * `useMemo`) if it is defined inline to avoid unnecessary re-subscriptions.
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', ctrl: true, handler: () => setSearchOpen(true) },
 *   { key: 'Escape', handler: () => setSearchOpen(false) },
 * ]);
 */

import { useEffect } from 'react';

/** Definition for a single keyboard shortcut. */
export interface Shortcut {
  /** The key to match (e.g. 'k', 'Escape', '/').  Case-insensitive. */
  key: string;
  /** Require Ctrl (Windows/Linux) or Cmd (macOS) to be held. */
  ctrl?: boolean;
  /** Alias for `ctrl` — either field activates the Ctrl/Cmd check. */
  meta?: boolean;
  /** Require Shift to be held. */
  shift?: boolean;
  /** Callback invoked when the shortcut matches. */
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const requiresCtrlOrMeta =
          shortcut.ctrl === true || shortcut.meta === true;
        const isCtrlOrMetaHeld = e.ctrlKey || e.metaKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!requiresCtrlOrMeta || isCtrlOrMetaHeld) &&
          (!shortcut.shift || e.shiftKey)
        ) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

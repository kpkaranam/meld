import { useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { MobileNav } from './MobileNav';
import { MobileSidebarOverlay } from './MobileSidebarOverlay';
import { useThemeSync } from '../../hooks/useThemeSync';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useKeySequence } from '../../hooks/useKeySequence';
import { KeyboardShortcutsHelp } from '../shared/KeyboardShortcutsHelp';
import { useCreateNote } from '../../hooks/useNotes';
import { useTimerInterval } from '../../hooks/useTimerInterval';
import toast from 'react-hot-toast';

/**
 * Top-level authenticated layout:
 *   - Desktop (>=768px): collapsible sidebar on the left + scrollable main content
 *   - Mobile (<768px): full-width main content + fixed bottom MobileNav
 *                      + hamburger-triggered sidebar slide-over overlay
 *
 * The Sidebar itself is hidden on mobile via CSS (hidden md:flex).
 * MobileNav is hidden on desktop via CSS (md:hidden).
 * MobileSidebarOverlay is only rendered on mobile when the hamburger is tapped.
 *
 * Global keyboard shortcuts registered here:
 *   Ctrl+N           — focus the quick-add task input (dispatches custom event)
 *   Ctrl+Shift+N     — create a new Inbox note and navigate to inbox
 *   ?                — open keyboard shortcuts help modal
 *   G then I         — navigate to /inbox
 *   G then T         — navigate to /today
 *   G then S         — navigate to /settings
 */
export function AppShell() {
  useThemeSync();
  useTimerInterval(); // global 1-second tick for the Pomodoro timer
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Ctrl+N: focus the quick-add task input via a custom DOM event.
  // Individual pages/components that contain a QuickAddTask input listen for
  // the 'meld:focus-quick-add' event and focus their input accordingly.
  const handleFocusQuickAdd = useCallback(() => {
    window.dispatchEvent(new CustomEvent('meld:focus-quick-add'));
  }, []);

  // Ctrl+Shift+N: create a new Inbox note and navigate to inbox so the user
  // lands in context.
  const handleNewNote = useCallback(async () => {
    try {
      await createNote.mutateAsync({ title: 'Untitled Note', projectId: null });
      navigate('/inbox');
    } catch {
      // Error already surfaced by useCreateNote's onError toast
      toast.error('Failed to create note');
    }
  }, [createNote, navigate]);

  const shortcuts = useMemo(
    () => [
      { key: 'n', ctrl: true, handler: handleFocusQuickAdd },
      { key: 'n', ctrl: true, shift: true, handler: handleNewNote },
      { key: '?', handler: () => setShortcutsOpen(true) },
    ],
    [handleFocusQuickAdd, handleNewNote]
  );

  useKeyboardShortcuts(shortcuts);

  // Two-key navigation sequences: G then I/T/S
  const sequences = useMemo(
    () => [
      { keys: ['g', 'i'], handler: () => navigate('/inbox') },
      { keys: ['g', 't'], handler: () => navigate('/today') },
      { keys: ['g', 's'], handler: () => navigate('/settings') },
    ],
    [navigate]
  );

  useKeySequence(sequences);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Skip to main content link — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar slide-over overlay */}
      <MobileSidebarOverlay />

      {/* Main content (header + page outlet) */}
      <MainContent />

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Keyboard shortcuts help modal */}
      <KeyboardShortcutsHelp
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

// Re-export Outlet for the route tree — AppShell itself wraps a nested <Route>
// so React Router will render child routes into the Outlet inside MainContent.
export { Outlet };

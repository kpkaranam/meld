/**
 * KeyboardShortcutsHelp — modal that lists all global keyboard shortcuts.
 *
 * Triggered by pressing `?` from anywhere in the app (when not typing in an
 * input field). The modal can be closed with Escape or by clicking the
 * backdrop.
 */

import { Modal } from './Modal';

interface ShortcutRow {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  heading: string;
  rows: ShortcutRow[];
}

const sections: ShortcutSection[] = [
  {
    heading: 'Navigation',
    rows: [
      { keys: ['G', 'then', 'I'], description: 'Go to Inbox' },
      { keys: ['G', 'then', 'T'], description: 'Go to Today' },
      { keys: ['G', 'then', 'S'], description: 'Go to Settings' },
    ],
  },
  {
    heading: 'Tasks',
    rows: [{ keys: ['Ctrl', 'N'], description: 'Focus quick-add task input' }],
  },
  {
    heading: 'Notes',
    rows: [{ keys: ['Ctrl', 'Shift', 'N'], description: 'Create new note' }],
  },
  {
    heading: 'General',
    rows: [
      { keys: ['Ctrl', 'K'], description: 'Open search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Escape'], description: 'Close current panel / modal' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      className="max-w-2xl"
    >
      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        aria-label="Keyboard shortcuts reference"
      >
        {sections.map((section) => (
          <section
            key={section.heading}
            aria-labelledby={`ks-${section.heading}`}
          >
            <h3
              id={`ks-${section.heading}`}
              className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
              {section.heading}
            </h3>

            <dl className="space-y-2">
              {section.rows.map((row) => (
                <div
                  key={row.description}
                  className="flex items-center justify-between gap-4"
                >
                  {/* Description */}
                  <dt className="text-sm text-gray-700 dark:text-gray-300">
                    {row.description}
                  </dt>

                  {/* Keys */}
                  <dd className="flex items-center gap-1 shrink-0">
                    {row.keys.map((k, i) =>
                      k === 'then' ? (
                        <span
                          key={i}
                          className="text-xs text-gray-400 dark:text-gray-500 px-0.5"
                          aria-hidden="true"
                        >
                          then
                        </span>
                      ) : (
                        <kbd
                          key={i}
                          className="inline-flex items-center justify-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 min-w-[1.5rem]"
                        >
                          {k}
                        </kbd>
                      )
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        Shortcuts are disabled when focus is inside a text field.
      </p>
    </Modal>
  );
}

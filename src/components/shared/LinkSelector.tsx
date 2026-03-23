/**
 * LinkSelector — a searchable dropdown for selecting tasks or notes to link.
 *
 * Rendered inline as a popover triggered by any ReactNode passed as `trigger`.
 * Already-linked items are excluded from the list via `excludeIds`.
 */

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTasks } from '@/hooks/useTasks';
import { useNotes } from '@/hooks/useNotes';

export interface LinkSelectorProps {
  /** Whether to list tasks or notes in the dropdown. */
  type: 'task' | 'note';
  /** IDs of already-linked items to exclude from the list. */
  excludeIds: string[];
  /** Called with the selected item's UUID. */
  onSelect: (id: string) => void;
  /** The element that opens the dropdown when clicked. */
  trigger: React.ReactNode;
}

export function LinkSelector({
  type,
  excludeIds,
  onSelect,
  trigger,
}: LinkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all user tasks or notes (no project filter = all items)
  const tasksQuery = useTasks(undefined);
  const notesQuery = useNotes(undefined);

  const rawItems =
    type === 'task'
      ? (tasksQuery.data ?? []).map((t) => ({
          id: t.id as string,
          label: (t as { title: string }).title,
          sub: (t as { status: string }).status,
        }))
      : (notesQuery.data ?? []).map((n) => ({
          id: n.id as string,
          label: (n as { title: string }).title,
          sub: undefined,
        }));

  const excludeSet = new Set(excludeIds);
  const filtered = rawItems.filter(
    (item) =>
      !excludeSet.has(item.id) &&
      item.label.toLowerCase().includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  function handleSelect(id: string) {
    onSelect(id);
    setIsOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger element */}
      <span
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="cursor-pointer"
      >
        {trigger}
      </span>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={`Select a ${type} to link`}
          className={cn(
            'absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
            <Search
              className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type}s...`}
              aria-label={`Search ${type}s`}
              className={cn(
                'flex-1 bg-transparent text-sm text-gray-900 outline-none',
                'placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500'
              )}
            />
          </div>

          {/* Results */}
          <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                {query ? `No ${type}s found` : `No ${type}s available to link`}
              </li>
            ) : (
              filtered.map((item) => (
                <li key={item.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      'flex w-full flex-col px-3 py-2 text-left transition-colors',
                      'hover:bg-indigo-50 hover:text-indigo-700',
                      'dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300'
                    )}
                  >
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      {item.label}
                    </span>
                    {item.sub && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                        {item.sub}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

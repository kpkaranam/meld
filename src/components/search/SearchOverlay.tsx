import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import {
  Search,
  X,
  Terminal,
  Plus,
  FileText,
  FolderPlus,
  Inbox,
  CalendarDays,
  Settings,
  Sun,
  Moon,
  Download,
  Keyboard,
  Navigation,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';
import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/stores/themeStore';
import { useCreateNote } from '@/hooks/useNotes';
import type { SearchResult, SearchItemType } from '@/types/search';
import { SearchResultItem } from './SearchResultItem';
import { CommandItem } from './CommandItem';
import type { Command } from './CommandItem';

/** UI filter tab values. 'all' is mapped to no filter server-side. */
type SearchFilter = 'all' | SearchItemType;

/** Raw snake_case row returned by the Supabase RPC before mapping. */
interface SearchRawRow {
  id: string;
  type: string;
  title: string;
  snippet: string;
  project_id: string | null;
  rank: number;
  created_at: string;
  updated_at: string;
}

function mapRawRow(row: SearchRawRow): SearchResult {
  return {
    id: row.id,
    type: row.type as SearchItemType,
    title: row.title,
    snippet: row.snippet,
    projectId: row.project_id,
    rank: row.rank,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Return true when the query string signals command-palette mode.
 * A query is in command mode when it starts with ">".
 */
function isCommandMode(query: string): boolean {
  return query.trimStart().startsWith('>');
}

/** Extract the search term for command filtering (strip leading "> "). */
function commandSearchTerm(query: string): string {
  return query.trimStart().replace(/^>/, '').trimStart();
}

/** Simple substring/keyword fuzzy match for commands (case-insensitive). */
function matchesCommand(cmd: Command, term: string): boolean {
  if (!term) return true;
  const lower = term.toLowerCase();
  if (cmd.label.toLowerCase().includes(lower)) return true;
  return cmd.keywords.some((kw) => kw.toLowerCase().includes(lower));
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const createNote = useCreateNote();
  const inputRef = useRef<HTMLInputElement>(null);
  // Remember the element that opened the overlay so focus can be returned
  const triggerRef = useRef<Element | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  // --- Command palette definitions ---
  // Defined with useMemo so they always have current closures over navigate, theme, etc.
  const commands: Command[] = useMemo(
    () => [
      {
        id: 'new-task',
        label: 'New Task',
        description: 'Focus the quick-add task input',
        icon: <Plus size={14} aria-hidden="true" />,
        keywords: ['create', 'add', 'task', 'todo'],
        shortcut: 'Ctrl+N',
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('meld:focus-quick-add'));
        },
      },
      {
        id: 'new-note',
        label: 'New Note',
        description: 'Create a new note in your Inbox',
        icon: <FileText size={14} aria-hidden="true" />,
        keywords: ['create', 'add', 'note', 'write'],
        shortcut: 'Ctrl+Shift+N',
        action: async () => {
          onClose();
          try {
            await createNote.mutateAsync({
              title: 'Untitled Note',
              projectId: null,
            });
            navigate('/inbox');
          } catch {
            // error handled by hook toast
          }
        },
      },
      {
        id: 'new-project',
        label: 'New Project',
        description: 'Open the new project form',
        icon: <FolderPlus size={14} aria-hidden="true" />,
        keywords: ['create', 'add', 'project', 'folder'],
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('meld:open-new-project'));
        },
      },
      {
        id: 'go-inbox',
        label: 'Go to Inbox',
        description: 'Navigate to the Inbox page',
        icon: <Inbox size={14} aria-hidden="true" />,
        keywords: ['inbox', 'navigate', 'go', 'home'],
        shortcut: 'G then I',
        action: () => {
          onClose();
          navigate('/inbox');
        },
      },
      {
        id: 'go-today',
        label: 'Go to Today',
        description: "Navigate to today's tasks",
        icon: <CalendarDays size={14} aria-hidden="true" />,
        keywords: ['today', 'navigate', 'go', 'calendar', 'date'],
        shortcut: 'G then T',
        action: () => {
          onClose();
          navigate('/today');
        },
      },
      {
        id: 'go-settings',
        label: 'Go to Settings',
        description: 'Open the settings page',
        icon: <Settings size={14} aria-hidden="true" />,
        keywords: ['settings', 'navigate', 'go', 'preferences', 'config'],
        shortcut: 'G then S',
        action: () => {
          onClose();
          navigate('/settings');
        },
      },
      {
        id: 'toggle-theme',
        label:
          resolvedTheme === 'dark'
            ? 'Switch to Light Mode'
            : 'Switch to Dark Mode',
        description: 'Toggle between light and dark theme',
        icon:
          resolvedTheme === 'dark' ? (
            <Sun size={14} aria-hidden="true" />
          ) : (
            <Moon size={14} aria-hidden="true" />
          ),
        keywords: [
          'theme',
          'dark',
          'light',
          'mode',
          'toggle',
          'appearance',
          'color',
        ],
        action: () => {
          onClose();
          // Cycle: light -> dark -> system -> light
          if (theme === 'light') setTheme('dark');
          else if (theme === 'dark') setTheme('system');
          else setTheme('light');
        },
      },
      {
        id: 'export-data',
        label: 'Export Data',
        description: 'Download your notes and tasks as JSON',
        icon: <Download size={14} aria-hidden="true" />,
        keywords: ['export', 'download', 'backup', 'data', 'json'],
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('meld:export-data'));
        },
      },
      {
        id: 'keyboard-shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'Open the keyboard shortcuts help modal',
        icon: <Keyboard size={14} aria-hidden="true" />,
        keywords: ['keyboard', 'shortcuts', 'help', 'keybindings', 'hotkeys'],
        shortcut: '?',
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('meld:open-shortcuts'));
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, onClose, theme, resolvedTheme, setTheme]
  );

  // Detect mode
  const commandMode = isCommandMode(query);
  const cmdTerm = commandSearchTerm(query);
  const filteredCommands = commandMode
    ? commands.filter((cmd) => matchesCommand(cmd, cmdTerm))
    : [];

  // Run search when debounced query or filter changes (only in search mode)
  useEffect(() => {
    if (commandMode) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    supabase
      .rpc('search_items', {
        query: debouncedQuery.trim(),
        item_type: filter !== 'all' ? filter : undefined,
        max_results: 20,
      })
      .then(({ data, error }) => {
        if (!error && data) {
          setResults((data as SearchRawRow[]).map(mapRawRow));
        } else if (!error) {
          setResults([]);
        }
        setIsSearching(false);
      });
  }, [debouncedQuery, filter, commandMode]);

  // Reset state when overlay opens, capture trigger element
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      setQuery('');
      setResults([]);
      setFilter('all');
      setSelectedIndex(0);
      // Autofocus with a small delay to ensure the element is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      // Return focus to the element that triggered the overlay
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset selected index when results or commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results, filteredCommands.length]);

  const handleNavigateToResult = useCallback(
    (result: SearchResult) => {
      // Navigate to the project page or inbox depending on result's projectId
      const path = result.projectId
        ? `/projects/${result.projectId}`
        : '/inbox';
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (commandMode) {
      const list = filteredCommands;
      if (list.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < list.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : list.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = list[selectedIndex];
        if (selected) {
          selected.action();
        }
      }
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < orderedResults.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : orderedResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = orderedResults[selectedIndex];
      if (selected) {
        handleNavigateToResult(selected);
      }
    }
  }

  // Split results into groups for display
  const taskResults = results.filter((r) => r.type === 'task');
  const noteResults = results.filter((r) => r.type === 'note');
  const showResults = !commandMode && debouncedQuery.trim().length > 0;

  // Build flat ordered list matching what's displayed (tasks first, then notes)
  // so keyboard navigation index maps correctly to displayed rows.
  const orderedResults =
    filter === 'note'
      ? noteResults
      : filter === 'task'
        ? taskResults
        : [...taskResults, ...noteResults];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label={commandMode ? 'Command palette' : 'Search'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-xl rounded-xl bg-white shadow-2xl',
          'dark:bg-gray-900 dark:shadow-black/60',
          'flex flex-col overflow-hidden',
          'max-h-[70vh]',
          // Subtle border colour shift for command mode
          commandMode
            ? 'border border-indigo-300 dark:border-indigo-700'
            : 'border border-gray-200 dark:border-gray-700'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input row */}
        <div
          className={cn(
            'flex items-center gap-3 border-b px-4 py-3',
            commandMode
              ? 'border-indigo-200 dark:border-indigo-800'
              : 'border-gray-200 dark:border-gray-700'
          )}
        >
          {/* Icon changes with mode */}
          {commandMode ? (
            <Terminal
              size={18}
              className="shrink-0 text-indigo-500 dark:text-indigo-400"
              aria-hidden="true"
            />
          ) : (
            <Search
              size={18}
              className="shrink-0 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
          )}

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              commandMode ? 'Type a command...' : 'Search tasks and notes...'
            }
            aria-label={
              commandMode ? 'Command palette input' : 'Search tasks and notes'
            }
            aria-autocomplete="list"
            aria-expanded={
              commandMode ? filteredCommands.length > 0 : results.length > 0
            }
            className={cn(
              'flex-1 bg-transparent text-base outline-none',
              commandMode
                ? 'text-indigo-900 placeholder-indigo-300 dark:text-indigo-100 dark:placeholder-indigo-700'
                : 'text-gray-900 placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500'
            )}
          />
          {isSearching && !commandMode && (
            <LoadingSpinner
              size="sm"
              className="shrink-0 text-gray-400 dark:text-gray-500"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              'shrink-0 rounded p-1 transition-colors',
              'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
              'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Filter tabs — only shown in search mode */}
        {!commandMode && (
          <div
            role="tablist"
            aria-label="Filter search results"
            className="flex border-b border-gray-200 dark:border-gray-700 px-4"
          >
            {(
              [
                { value: 'all' as const, label: 'All' },
                { value: 'task' as const, label: 'Tasks' },
                { value: 'note' as const, label: 'Notes' },
              ] satisfies { value: SearchFilter; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'px-3 py-2 text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                  filter === value
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Command mode header bar */}
        {commandMode && (
          <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50/50 px-4 py-1.5 dark:border-indigo-900 dark:bg-indigo-950/20">
            <Navigation
              size={11}
              className="text-indigo-400 dark:text-indigo-500"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
              Command mode — type a command or use arrow keys
            </span>
          </div>
        )}

        {/* Results / Commands area */}
        <div
          className="flex-1 overflow-y-auto p-2"
          role="listbox"
          aria-label={commandMode ? 'Commands' : 'Search results'}
        >
          {/* ---- Command mode content ---- */}
          {commandMode && (
            <>
              {filteredCommands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                  <Terminal
                    size={28}
                    className="mb-2 text-indigo-300 dark:text-indigo-700"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">No commands matched</p>
                  <p className="mt-1 text-xs">
                    Try a different term — e.g. "new note" or "settings"
                  </p>
                </div>
              ) : (
                <section aria-label="Available commands">
                  <h3 className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 dark:text-indigo-600">
                    Commands
                  </h3>
                  {filteredCommands.map((cmd, idx) => (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={selectedIndex === idx}
                      onExecute={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    />
                  ))}
                </section>
              )}
            </>
          )}

          {/* ---- Search mode content ---- */}
          {!commandMode && (
            <>
              {/* Initial state — no query */}
              {!showResults && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                  <Search
                    size={32}
                    className="mb-2 opacity-30"
                    aria-hidden="true"
                  />
                  <p className="text-sm">Type to search tasks and notes</p>
                </div>
              )}

              {/* Searching indicator */}
              {showResults && isSearching && results.length === 0 && (
                <div className="flex items-center justify-center py-10">
                  <LoadingSpinner
                    size="md"
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
              )}

              {/* No results */}
              {showResults && !isSearching && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                  <p className="text-sm font-medium">No results found</p>
                  <p className="mt-1 text-xs">
                    Try a different search term or filter
                  </p>
                </div>
              )}

              {/* Results grouped by type */}
              {showResults && orderedResults.length > 0 && (
                <>
                  {/* Tasks group */}
                  {filter !== 'note' && taskResults.length > 0 && (
                    <section aria-label="Task results">
                      <h3 className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Tasks
                      </h3>
                      {taskResults.map((result) => {
                        const flatIndex = orderedResults.indexOf(result);
                        return (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            isSelected={selectedIndex === flatIndex}
                            onClick={() => handleNavigateToResult(result)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                          />
                        );
                      })}
                    </section>
                  )}

                  {/* Notes group */}
                  {filter !== 'task' && noteResults.length > 0 && (
                    <section aria-label="Note results">
                      <h3 className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Notes
                      </h3>
                      {noteResults.map((result) => {
                        const flatIndex = orderedResults.indexOf(result);
                        return (
                          <SearchResultItem
                            key={result.id}
                            result={result}
                            isSelected={selectedIndex === flatIndex}
                            onClick={() => handleNavigateToResult(result)}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                          />
                        );
                      })}
                    </section>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-between border-t px-4 py-2',
            commandMode
              ? 'border-indigo-100 dark:border-indigo-900'
              : 'border-gray-200 dark:border-gray-700'
          )}
        >
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-600">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">
                ↵
              </kbd>
              {commandMode ? 'run' : 'open'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">
                Esc
              </kbd>
              close
            </span>
          </div>

          {/* Right side: hint for command mode toggle */}
          {!commandMode ? (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Type{' '}
              <kbd className="rounded border border-gray-300 dark:border-gray-600 px-1 font-mono text-[10px]">
                &gt;
              </kbd>{' '}
              for commands
            </span>
          ) : (
            <span className="text-xs text-indigo-400 dark:text-indigo-600">
              {filteredCommands.length} command
              {filteredCommands.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

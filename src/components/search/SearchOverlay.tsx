import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';
import { supabase } from '@/lib/supabase';
import type { SearchResult, SearchItemType } from '@/types/search';
import { SearchResultItem } from './SearchResultItem';

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

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  // Remember the element that opened the overlay so focus can be returned
  const triggerRef = useRef<Element | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  // Run search when debounced query or filter changes
  useEffect(() => {
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
  }, [debouncedQuery, filter]);

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

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

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
  const showResults = debouncedQuery.trim().length > 0;

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
      aria-label="Search"
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
          'border border-gray-200 dark:border-gray-700',
          'flex flex-col overflow-hidden',
          'max-h-[70vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <Search
            size={18}
            className="shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks and notes..."
            aria-label="Search tasks and notes"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            className={cn(
              'flex-1 bg-transparent text-base text-gray-900 outline-none',
              'placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500'
            )}
          />
          {isSearching && (
            <LoadingSpinner
              size="sm"
              className="shrink-0 text-gray-400 dark:text-gray-500"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className={cn(
              'shrink-0 rounded p-1 text-gray-400 transition-colors',
              'hover:bg-gray-100 hover:text-gray-600',
              'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Filter tabs */}
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

        {/* Results area */}
        <div
          className="flex-1 overflow-y-auto p-2"
          role="listbox"
          aria-label="Search results"
        >
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
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-2">
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
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">
                  Esc
                </kbd>
                close
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-600">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

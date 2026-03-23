import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/utils/cn';
import { TagBadge } from './TagBadge';

interface TagOption {
  id: string;
  name: string;
  color: string | null;
}

interface TagSelectorProps {
  selectedTags: TagOption[];
  availableTags: TagOption[];
  onAddTag: (tag: TagOption) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag?: (name: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagSelector({
  selectedTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  placeholder = 'Add tag...',
  className,
}: TagSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const filtered = availableTags.filter(
    (tag) =>
      !selectedIds.has(tag.id) &&
      tag.name.toLowerCase().includes(query.toLowerCase())
  );

  const trimmedQuery = query.trim();
  const exactMatch = availableTags.some(
    (t) => t.name.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const showCreate = !!onCreateTag && trimmedQuery.length > 0 && !exactMatch;

  const dropdownItems = showCreate
    ? [...filtered, { id: '__create__', name: trimmedQuery, color: null }]
    : filtered;

  // Reset highlight when items change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  function selectItem(item: TagOption & { id: string }) {
    if (item.id === '__create__') {
      onCreateTag?.(item.name);
    } else {
      onAddTag(item);
    }
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => (i < dropdownItems.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : dropdownItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (dropdownItems[highlightedIndex]) {
          selectItem(
            dropdownItems[highlightedIndex] as TagOption & { id: string }
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      case 'Backspace':
        if (query === '' && selectedTags.length > 0) {
          onRemoveTag(selectedTags[selectedTags.length - 1].id);
        }
        break;
    }
  }

  return (
    <div className={cn('relative flex flex-col gap-1.5', className)}>
      {/* Selected tags + input row */}
      <div
        className={cn(
          'flex flex-wrap gap-1.5 rounded-lg border border-gray-300 px-2 py-1.5',
          'bg-white dark:bg-gray-900 dark:border-gray-700',
          'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2',
          'dark:focus-within:ring-offset-gray-950'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => onRemoveTag(tag.id)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          aria-label="Search or create tags"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'min-w-[80px] flex-1 bg-transparent text-sm text-gray-900 outline-none',
            'placeholder-gray-400 dark:text-gray-100 dark:placeholder-gray-500'
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && dropdownItems.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Available tags"
          className={cn(
            'absolute top-full left-0 z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          {dropdownItems.map((item, idx) => {
            const isCreate = item.id === '__create__';
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => selectItem(item as TagOption & { id: string })}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  isHighlighted
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                )}
              >
                {isCreate ? (
                  <>
                    <span className="text-indigo-500 dark:text-indigo-400">
                      +
                    </span>
                    <span>
                      Create &ldquo;<strong>{item.name}</strong>&rdquo;
                    </span>
                  </>
                ) : (
                  <TagBadge tag={item} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state when user is typing but no results */}
      {isOpen && query.trim().length > 0 && dropdownItems.length === 0 && (
        <div
          className={cn(
            'absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
          )}
        >
          No matching tags
        </div>
      )}
    </div>
  );
}

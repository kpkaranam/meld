import { CheckSquare, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SearchResult } from '@/types/search';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

export function SearchResultItem({
  result,
  isSelected,
  onClick,
  onMouseEnter,
}: SearchResultItemProps) {
  const isTask = result.type === 'task';
  const Icon = isTask ? CheckSquare : FileText;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/40'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
      )}
    >
      {/* Type icon */}
      <span
        className={cn(
          'mt-0.5 shrink-0',
          isTask
            ? 'text-indigo-500 dark:text-indigo-400'
            : 'text-amber-500 dark:text-amber-400'
        )}
        aria-hidden="true"
      >
        <Icon size={16} />
      </span>

      {/* Content */}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-sm font-semibold',
            isSelected
              ? 'text-indigo-700 dark:text-indigo-300'
              : 'text-gray-900 dark:text-gray-100'
          )}
        >
          {result.title}
        </span>

        {result.snippet && (
          <span
            className={cn(
              'mt-0.5 block truncate text-xs',
              isSelected
                ? 'text-indigo-600/70 dark:text-indigo-400/70'
                : 'text-gray-500 dark:text-gray-400'
            )}
            // snippet contains <mark> tags from Postgres ts_headline — safe, server-generated HTML
            dangerouslySetInnerHTML={{ __html: result.snippet }}
          />
        )}
      </span>

      {/* Type label */}
      <span
        className={cn(
          'mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
          isTask
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300'
        )}
      >
        {isTask ? 'Task' : 'Note'}
      </span>
    </button>
  );
}

import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  /** Called when the user clicks the trigger button to open the search overlay. */
  onOpen: () => void;
}

export function SearchBar({ onOpen }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm w-56',
        'text-gray-500 dark:text-gray-400',
        'bg-gray-100 dark:bg-gray-800',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      )}
      aria-label="Open search (Ctrl+K)"
    >
      <Search size={15} className="shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-1">
        Ctrl+K
      </kbd>
    </button>
  );
}

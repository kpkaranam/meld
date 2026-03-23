import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

interface CalendarHeaderProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  month,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {format(month, 'MMMM yyyy')}
      </h2>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToday}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            'text-gray-700 dark:text-gray-300',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
          aria-label="Go to current month"
        >
          Today
        </button>

        <button
          type="button"
          onClick={onPrev}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-gray-500 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onNext}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-gray-500 dark:text-gray-400',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          )}
          aria-label="Next month"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

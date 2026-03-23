import { useState, useMemo } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTasks } from '@/hooks/useTasks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { formatDate } from '@/utils/dates';
import type { TaskRow } from '@/components/tasks/TaskItem';
import { cn } from '@/utils/cn';

const PRIORITY_DOT_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
  none: 'bg-gray-300 dark:bg-gray-600',
};

export default function CalendarPage() {
  useDocumentTitle('Calendar');

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: allTasks, isLoading, isError } = useTasks();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Group tasks by due_date (only tasks that have a due date)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    (allTasks ?? []).forEach((task: TaskRow) => {
      if (task.due_date) {
        const existing = map.get(task.due_date) ?? [];
        existing.push(task);
        map.set(task.due_date, [...existing]);
      }
    });
    return map;
  }, [allTasks]);

  const selectedDateTasks = selectedDate
    ? (tasksByDate.get(selectedDate) ?? [])
    : [];

  function handleSelectDate(dateStr: string) {
    // Toggle off if same date is clicked; empty string means deselect
    setSelectedDate(dateStr === '' ? null : dateStr);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Calendar grid area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <CalendarHeader
          month={currentMonth}
          onPrev={() => setCurrentMonth((prev) => subMonths(prev, 1))}
          onNext={() => setCurrentMonth((prev) => addMonths(prev, 1))}
          onToday={() => setCurrentMonth(new Date())}
        />

        {isLoading && (
          <div
            className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500"
            role="status"
            aria-live="polite"
          >
            Loading tasks...
          </div>
        )}

        {isError && (
          <div
            className="flex items-center justify-center py-16 text-red-500 dark:text-red-400"
            role="alert"
          >
            Failed to load tasks. Please try refreshing.
          </div>
        )}

        {!isLoading && !isError && (
          <CalendarGrid
            month={currentMonth}
            tasksByDate={tasksByDate}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}

        {/* Mobile: tasks for selected date shown below the grid */}
        {!isDesktop && selectedDate && selectedDateTasks.length > 0 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {formatDate(selectedDate)}
            </h3>
            <ul
              className="space-y-1"
              aria-label={`Tasks for ${formatDate(selectedDate)}`}
            >
              {selectedDateTasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  task.status !== 'done' &&
                  new Date(task.due_date) < new Date(new Date().toDateString());

                return (
                  <li
                    key={task.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                      isOverdue
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-gray-50 dark:bg-gray-800'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full flex-shrink-0',
                        PRIORITY_DOT_COLORS[task.priority] ??
                          PRIORITY_DOT_COLORS['none']
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'truncate flex-1',
                        task.status === 'done'
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : isOverdue
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-800 dark:text-gray-200'
                      )}
                    >
                      {task.title}
                    </span>
                    {task.status === 'done' && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        Done
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!isDesktop && selectedDate && selectedDateTasks.length === 0 && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No tasks due on this day.
            </p>
          </div>
        )}
      </div>

      {/* Desktop: right panel showing tasks for selected date */}
      {isDesktop && selectedDate && (
        <aside
          className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto p-4"
          aria-label={`Tasks for ${formatDate(selectedDate)}`}
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {formatDate(selectedDate)}
          </h3>

          {selectedDateTasks.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No tasks due on this day.
            </p>
          ) : (
            <ul className="space-y-1">
              {selectedDateTasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  task.status !== 'done' &&
                  new Date(task.due_date) < new Date(new Date().toDateString());

                return (
                  <li
                    key={task.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                      isOverdue
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-gray-50 dark:bg-gray-800'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full flex-shrink-0',
                        PRIORITY_DOT_COLORS[task.priority] ??
                          PRIORITY_DOT_COLORS['none']
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'truncate flex-1',
                        task.status === 'done'
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : isOverdue
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-gray-800 dark:text-gray-200'
                      )}
                    >
                      {task.title}
                    </span>
                    {task.status === 'done' && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                        Done
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}

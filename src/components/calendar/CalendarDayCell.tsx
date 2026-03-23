import { cn } from '@/utils/cn';
import type { TaskRow } from '@/components/tasks/TaskItem';

const PRIORITY_DOT_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
  none: 'bg-gray-300 dark:bg-gray-600',
};

interface CalendarDayCellProps {
  date: Date;
  tasks: TaskRow[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const MAX_VISIBLE_TASKS = 3;

export function CalendarDayCell({
  date,
  tasks,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
  const overflowCount = tasks.length - MAX_VISIBLE_TASKS;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${tasks.length > 0 ? `, ${tasks.length} task${tasks.length > 1 ? 's' : ''}` : ''}`}
      aria-pressed={isSelected}
      className={cn(
        'relative min-h-[80px] p-1.5 cursor-pointer rounded-lg border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        // Base
        isCurrentMonth
          ? 'bg-white dark:bg-gray-900'
          : 'bg-gray-50 dark:bg-gray-950',
        // Border
        isSelected
          ? 'border-indigo-500 dark:border-indigo-400'
          : 'border-gray-100 dark:border-gray-800',
        // Hover (only when not selected)
        !isSelected && 'hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      {/* Day number */}
      <div className="flex justify-start mb-1">
        <span
          className={cn(
            'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
            isToday
              ? 'bg-indigo-600 text-white'
              : isCurrentMonth
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400 dark:text-gray-600'
          )}
        >
          {dayNumber}
        </span>
      </div>

      {/* Task pills */}
      <div className="space-y-0.5">
        {visibleTasks.map((task) => {
          const isOverdue =
            task.due_date &&
            task.status !== 'done' &&
            new Date(task.due_date) < new Date(new Date().toDateString());

          return (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-1 rounded px-1 py-0.5',
                isOverdue
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-gray-50 dark:bg-gray-800'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full flex-shrink-0',
                  PRIORITY_DOT_COLORS[task.priority] ??
                    PRIORITY_DOT_COLORS['none']
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs truncate leading-none py-0.5',
                  task.status === 'done'
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : isOverdue
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {task.title}
              </span>
            </div>
          );
        })}

        {overflowCount > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 pl-1">
            +{overflowCount} more
          </p>
        )}
      </div>
    </div>
  );
}

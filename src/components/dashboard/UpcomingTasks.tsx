import { useNavigate } from 'react-router-dom';
import { useUpcomingTasks } from '@/hooks/useStats';
import { cn } from '@/utils/cn';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-400',
  low: 'bg-blue-400',
  none: 'bg-gray-300 dark:bg-gray-600',
};

function groupLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr < today) return 'Overdue';
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface TaskRow {
  id: string;
  title: string;
  due_date: string;
  priority: string;
}

export function UpcomingTasks() {
  const { data: tasks, isLoading } = useUpcomingTasks(7);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Group tasks by date label
  const groups: Map<string, TaskRow[]> = new Map();

  if (tasks) {
    // Overdue first
    const overdue = tasks.filter((t) => t.due_date < today);
    if (overdue.length > 0) groups.set('Overdue', overdue);

    // Then by date
    tasks
      .filter((t) => t.due_date >= today)
      .forEach((t) => {
        const label = groupLabel(t.due_date);
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(t);
      });
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Upcoming
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Next 7 days
        </p>
      </div>

      {isLoading && (
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 h-3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && groups.size === 0 && (
        <div className="p-5 text-center text-sm text-gray-400 dark:text-gray-500">
          Nothing due in the next 7 days
        </div>
      )}

      {!isLoading && groups.size > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from(groups.entries()).map(([label, groupTasks]) => (
            <div key={label}>
              {/* Group header */}
              <div
                className={cn(
                  'px-5 py-2 text-xs font-semibold',
                  label === 'Overdue'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
                )}
              >
                {label}
              </div>

              {/* Tasks in group */}
              <ul>
                {groupTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => navigate('/today')}
                      className={cn(
                        'w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors',
                        'hover:bg-gray-50 dark:hover:bg-gray-800/60',
                        task.due_date < today &&
                          'text-red-700 dark:text-red-300'
                      )}
                    >
                      {/* Priority dot */}
                      <span
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          PRIORITY_COLORS[task.priority] ??
                            PRIORITY_COLORS['none']
                        )}
                        aria-label={`Priority: ${task.priority}`}
                      />

                      {/* Title */}
                      <span
                        className={cn(
                          'flex-1 min-w-0 text-sm truncate',
                          task.due_date < today
                            ? 'text-red-700 dark:text-red-300 font-medium'
                            : 'text-gray-800 dark:text-gray-200'
                        )}
                      >
                        {task.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

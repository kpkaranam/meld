import { useState } from 'react';
import { ArrowLeft, CalendarCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTodayTasks } from '@/hooks/useTasks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { TaskItem } from '@/components/tasks/TaskItem';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function TodayPage() {
  useDocumentTitle('Today');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { data: tasks, isLoading, isError } = useTodayTasks();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const hasDetail = !!selectedTaskId;

  function handleCloseDetail() {
    setSelectedTaskId(null);
  }

  function renderDetailContent() {
    if (selectedTaskId) {
      return <TaskDetail taskId={selectedTaskId} onClose={handleCloseDetail} />;
    }
    return (
      <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
        <p className="text-sm">Select a task to view details</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: list */}
      <div
        className={cn(
          'flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden',
          'w-full md:w-1/2 lg:w-2/5',
          hasDetail && !isDesktop ? 'hidden' : 'flex'
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 px-4 py-4 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Today
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Tasks due today or overdue
          </p>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div
              className="flex items-center justify-center py-16"
              role="status"
              aria-label="Loading tasks"
            >
              <LoadingSpinner size="md" className="text-indigo-500" />
            </div>
          )}

          {isError && (
            <div
              className="py-8 text-center text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              Failed to load tasks. Please try again.
            </div>
          )}

          {!isLoading && !isError && tasks && tasks.length === 0 && (
            <EmptyState
              icon={<CalendarCheck className="h-8 w-8" aria-hidden="true" />}
              title="All clear!"
              description="No tasks due today. Enjoy your day."
            />
          )}

          {!isLoading && !isError && tasks && tasks.length > 0 && (
            <div role="table" aria-label="Today's tasks">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onSelect={setSelectedTaskId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: full-screen detail overlay */}
      {!isDesktop && hasDetail && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
          {/* Back bar */}
          <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950 shrink-0">
            <button
              type="button"
              onClick={handleCloseDetail}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Back to list"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Task Details
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">{renderDetailContent()}</div>
        </div>
      )}

      {/* Desktop: right panel */}
      {isDesktop && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderDetailContent()}
        </div>
      )}
    </div>
  );
}

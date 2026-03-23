import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { TaskItem, type TaskRow } from './TaskItem';
import { QuickAddTask } from './QuickAddTask';

interface TaskListProps {
  projectId?: string | null;
  onSelectTask: (taskId: string) => void;
  showCompleted?: boolean;
}

export function TaskList({
  projectId,
  onSelectTask,
  showCompleted: showCompletedProp,
}: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks(projectId);
  // Allow external control of showCompleted, falling back to internal state
  const [internalShowCompleted, setInternalShowCompleted] = useState(false);
  const showCompleted = showCompletedProp ?? internalShowCompleted;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="Loading tasks"
      >
        <LoadingSpinner size="md" className="text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-400"
        role="alert"
      >
        Failed to load tasks. Please try again.
      </div>
    );
  }

  const allTasks = (tasks ?? []) as TaskRow[];
  const activeTasks = allTasks.filter((t) => t.status !== 'done');
  const completedTasks = allTasks.filter((t) => t.status === 'done');
  const displayTasks = showCompleted ? allTasks : activeTasks;

  return (
    <div className="flex flex-col">
      {/* Quick add */}
      <QuickAddTask projectId={projectId} />

      {/* Divider */}
      <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

      {/* Task rows */}
      {displayTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8" aria-hidden="true" />}
          title="No tasks yet"
          description="No tasks yet. Create one above!"
        />
      ) : (
        <div role="table" aria-label="Task list">
          {displayTasks.map((task) => (
            <TaskItem key={task.id} task={task} onSelect={onSelectTask} />
          ))}
        </div>
      )}

      {/* Toggle completed */}
      {showCompletedProp === undefined && completedTasks.length > 0 && (
        <button
          type="button"
          onClick={() => setInternalShowCompleted((prev) => !prev)}
          className="mt-2 px-3 py-1.5 text-left text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-expanded={internalShowCompleted}
        >
          {internalShowCompleted
            ? `Hide ${completedTasks.length} completed`
            : `Show ${completedTasks.length} completed`}
        </button>
      )}
    </div>
  );
}

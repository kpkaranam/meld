import { useState } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import { useTask, useDeleteTask } from '@/hooks/useTasks';
import { useTags, useCreateTag, useAddTagToTask, useRemoveTagFromTask } from '@/hooks/useTags';
import { Button, ConfirmDialog, LoadingSpinner } from '@/components/shared';
import { TaskForm } from './TaskForm';
import { TagSelector } from '@/components/tags/TagSelector';

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const { data: task, isLoading, isError, error } = useTask(taskId);
  const deleteTask = useDeleteTask();
  const { data: allTags } = useTags();
  const createTag = useCreateTag();
  const addTagToTask = useAddTagToTask();
  const removeTagFromTask = useRemoveTagFromTask();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Extract tags currently on this task
  const taskTags: Array<{ id: string; name: string; color: string | null }> =
    ((task as any)?.task_tags ?? []).map((tt: any) => tt.tags).filter(Boolean);

  const availableTags: Array<{ id: string; name: string; color: string | null }> =
    ((allTags ?? []) as any[]).filter(
      (t) => !taskTags.some((tt) => tt.id === t.id)
    );

  function handleConfirmDelete() {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">
          {error instanceof Error ? error.message : 'Failed to load task.'}
        </p>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col bg-white dark:bg-gray-950">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="mr-auto text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
            Task Details
          </h2>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete task"
            disabled={deleteTask.isPending}
            className={cn(
              'rounded p-1.5 transition-colors',
              'text-gray-400 hover:bg-red-100 hover:text-red-600',
              'dark:text-gray-500 dark:hover:bg-red-900/40 dark:hover:text-red-400',
              'disabled:opacity-50'
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task detail"
            className={cn(
              'rounded p-1.5 transition-colors',
              'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
              'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <TaskForm task={task} onSave={onClose} onCancel={onClose} />

          {/* Tags section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </label>
            <TagSelector
              selectedTags={taskTags}
              availableTags={availableTags}
              onAddTag={(tag) => addTagToTask.mutate({ taskId, tagId: tag.id })}
              onRemoveTag={(tagId) => removeTagFromTask.mutate({ taskId, tagId })}
              onCreateTag={(name) => {
                createTag.mutate({ name }, {
                  onSuccess: (newTag: any) => {
                    addTagToTask.mutate({ taskId, tagId: newTag.id });
                  },
                });
              }}
            />
          </div>
        </div>

        {/* Footer: timestamps */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-2 dark:border-gray-800">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-600">
            <Clock className="h-3 w-3" aria-hidden="true" />
            Created{' '}
            <time dateTime={task.created_at}>
              {formatDate(task.created_at)}
            </time>
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-600">
            Updated{' '}
            <time dateTime={task.updated_at}>
              {formatDate(task.updated_at)}
            </time>
          </span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

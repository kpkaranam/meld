import { useState } from 'react';
import { X, Trash2, Clock, FileText, Link2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import { useTask, useDeleteTask } from '@/hooks/useTasks';
import {
  useTags,
  useCreateTag,
  useAddTagToTask,
  useRemoveTagFromTask,
} from '@/hooks/useTags';
import {
  useLinkedNotes,
  useLinkTaskToNote,
  useUnlinkTaskFromNote,
} from '@/hooks/useLinks';
import {
  Button,
  ConfirmDialog,
  LoadingSpinner,
  LinkSelector,
} from '@/components/shared';
import { TaskForm } from './TaskForm';
import type { TaskRow } from './TaskItem';
import { TagSelector } from '@/components/tags/TagSelector';
import { SubtaskList } from './SubtaskList';

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const navigate = useNavigate();
  const { data: task, isLoading, isError, error } = useTask(taskId);
  const deleteTask = useDeleteTask();
  const { data: allTags } = useTags();
  const createTag = useCreateTag();
  const addTagToTask = useAddTagToTask();
  const removeTagFromTask = useRemoveTagFromTask();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Linked notes
  const { data: linkedNotes = [] } = useLinkedNotes(taskId);
  const linkTaskToNote = useLinkTaskToNote();
  const unlinkTaskFromNote = useUnlinkTaskFromNote();

  // Extract tags currently on this task.
  // task_tags is a nested join result; cast through unknown to avoid strict typing on Supabase generics.
  type TaskTagRow = {
    tags: { id: string; name: string; color: string | null } | null;
  };
  type TagShape = { id: string; name: string; color: string | null };

  const taskTags: TagShape[] = (
    (task as unknown as { task_tags?: TaskTagRow[] })?.task_tags ?? []
  )
    .map((tt) => tt.tags)
    .filter((t): t is TagShape => t !== null);

  const availableTags: TagShape[] = (
    (allTags ?? []) as unknown as TagShape[]
  ).filter((t) => !taskTags.some((tt) => tt.id === t.id));

  function handleConfirmDelete() {
    deleteTask.mutate(
      { id: taskId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
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
          <TaskForm
            task={task as unknown as TaskRow}
            onSave={onClose}
            onCancel={onClose}
          />

          {/* Tags section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </label>
            <TagSelector
              selectedTags={taskTags}
              availableTags={availableTags}
              onAddTag={(tag) => addTagToTask.mutate({ taskId, tagId: tag.id })}
              onRemoveTag={(tagId) =>
                removeTagFromTask.mutate({ taskId, tagId })
              }
              onCreateTag={(name) => {
                createTag.mutate(
                  { name },
                  {
                    onSuccess: (newTag) => {
                      addTagToTask.mutate({
                        taskId,
                        tagId: (newTag as { id: string }).id,
                      });
                    },
                  }
                );
              }}
            />
          </div>

          {/* Subtasks section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Subtasks
            </label>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              <SubtaskList
                parentId={taskId}
                projectId={(task as unknown as TaskRow).project_id ?? null}
              />
            </div>
          </div>

          {/* Linked Notes section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Linked Notes
              </label>
              <LinkSelector
                type="note"
                excludeIds={linkedNotes.map((n) => n.id)}
                onSelect={(noteId) => linkTaskToNote.mutate({ taskId, noteId })}
                trigger={
                  <span
                    className={cn(
                      'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium',
                      'text-indigo-600 hover:bg-indigo-50',
                      'dark:text-indigo-400 dark:hover:bg-indigo-950/40',
                      'transition-colors'
                    )}
                  >
                    <Link2 className="h-3 w-3" aria-hidden="true" />
                    Link a note
                  </span>
                }
              />
            </div>

            {linkedNotes.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-600 py-1">
                No linked notes yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {linkedNotes.map((note) => (
                  <li
                    key={note.id}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-lg px-3 py-2',
                      'border border-gray-200 dark:border-gray-800',
                      'bg-gray-50 dark:bg-gray-900'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/notes/${note.id}`)}
                      className={cn(
                        'flex min-w-0 items-center gap-2 text-left',
                        'text-sm text-gray-700 dark:text-gray-300',
                        'hover:text-indigo-600 dark:hover:text-indigo-400',
                        'transition-colors'
                      )}
                    >
                      <FileText
                        className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 dark:text-gray-600"
                        aria-hidden="true"
                      />
                      <span className="truncate">{note.title}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Unlink note "${note.title}"`}
                      onClick={() =>
                        unlinkTaskFromNote.mutate({ taskId, noteId: note.id })
                      }
                      className={cn(
                        'flex-shrink-0 rounded p-0.5',
                        'text-gray-300 hover:text-red-500',
                        'dark:text-gray-700 dark:hover:text-red-400',
                        'transition-colors'
                      )}
                    >
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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

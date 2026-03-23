/**
 * SubtaskList — shows subtasks for a given parent task.
 *
 * Features:
 * - Quick-add input for new subtasks (Enter to submit)
 * - Each subtask shows a checkbox + title in compact form
 * - Delete subtask via trash icon on hover
 * - Max one level of nesting (subtasks cannot have their own children)
 */

import { useState, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  useSubtasks,
  useCreateSubtask,
  useDeleteTask,
  useToggleTaskStatus,
} from '@/hooks/useTasks';
import { LoadingSpinner } from '@/components/shared';

export interface SubtaskListProps {
  parentId: string;
  projectId?: string | null;
  /** Called when a subtask row is clicked to open its detail panel. */
  onSelectSubtask?: (subtaskId: string) => void;
}

interface SubtaskRowProps {
  subtask: {
    id: string;
    title: string;
    status: string;
    parent_id: string | null;
  };
  onSelect?: (id: string) => void;
}

function SubtaskRow({ subtask, onSelect }: SubtaskRowProps) {
  const toggleStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();
  const isDone = subtask.status === 'done';

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    toggleStatus.mutate({
      id: subtask.id,
      currentStatus: subtask.status,
      parentId: subtask.parent_id ?? undefined,
    });
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    deleteTask.mutate({
      id: subtask.id,
      parentId: subtask.parent_id ?? undefined,
    });
  }

  function handleRowClick() {
    onSelect?.(subtask.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(subtask.id);
    }
  }

  return (
    <div
      role="row"
      className={cn(
        'group flex min-h-[36px] cursor-pointer items-center gap-2 rounded-md px-2 py-1',
        'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60',
        isDone && 'opacity-50'
      )}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Subtask: ${subtask.title}${isDone ? ' (completed)' : ''}`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isDone}
          onChange={handleCheckboxChange}
          disabled={toggleStatus.isPending}
          aria-label={`Mark subtask "${subtask.title}" as ${isDone ? 'incomplete' : 'complete'}`}
          className={cn(
            'h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-indigo-600 transition-colors',
            'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-indigo-500',
            'dark:focus-visible:ring-offset-gray-950',
            toggleStatus.isPending && 'cursor-wait opacity-50'
          )}
        />
      </div>

      {/* Title */}
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-xs text-gray-700 dark:text-gray-300',
          isDone && 'line-through text-gray-400 dark:text-gray-500'
        )}
      >
        {subtask.title}
      </span>

      {/* Delete on hover */}
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={deleteTask.isPending}
        aria-label={`Delete subtask "${subtask.title}"`}
        className={cn(
          'flex-shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity',
          'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          deleteTask.isPending && 'cursor-wait'
        )}
      >
        <Trash2 className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}

export function SubtaskList({
  parentId,
  projectId,
  onSelectSubtask,
}: SubtaskListProps) {
  const { data: subtasks, isLoading, error } = useSubtasks(parentId);
  const createSubtask = useCreateSubtask();
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const title = newTitle.trim();
    if (!title) return;

    createSubtask.mutate(
      { parentId, input: { title, projectId: projectId ?? null } },
      {
        onSuccess: () => {
          setNewTitle('');
          inputRef.current?.focus();
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <LoadingSpinner size="sm" className="text-indigo-400" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-2 py-1 text-xs text-red-500 dark:text-red-400">
        Failed to load subtasks.
      </p>
    );
  }

  const rows = (subtasks ?? []) as unknown as Array<{
    id: string;
    title: string;
    status: string;
    parent_id: string | null;
  }>;

  return (
    <div className="flex flex-col py-1">
      {/* Existing subtasks */}
      {rows.length > 0 && (
        <div role="table" aria-label="Subtasks">
          {rows.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onSelect={onSelectSubtask}
            />
          ))}
        </div>
      )}

      {/* Quick-add input */}
      <div className="flex items-center gap-1.5 px-2 py-1">
        <Plus
          className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={createSubtask.isPending}
          placeholder="Add a subtask..."
          aria-label="Quick add subtask"
          className={cn(
            'flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-300 outline-none',
            'dark:text-gray-300 dark:placeholder-gray-600',
            createSubtask.isPending && 'opacity-50 cursor-wait'
          )}
        />
        {createSubtask.isPending && (
          <span
            className="text-xs text-gray-400 dark:text-gray-500"
            aria-live="polite"
          >
            Adding...
          </span>
        )}
      </div>
    </div>
  );
}

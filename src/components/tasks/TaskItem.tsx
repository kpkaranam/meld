import { useState } from 'react';
import { Trash2, FolderInput, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ProjectSelector } from '@/components/shared/ProjectSelector';
import {
  useToggleTaskStatus,
  useDeleteTask,
  useUpdateTask,
} from '@/hooks/useTasks';
import type { TaskPriority } from '@/utils/priorities';
import { PriorityBadge } from './PriorityBadge';
import { DueDateBadge } from './DueDateBadge';
import { RecurrenceBadge } from './RecurrenceBadge';
import { SubtaskList } from './SubtaskList';

// Raw DB row shape returned by the task service (snake_case).
export interface TaskRow {
  id: string;
  user_id: string;
  project_id: string | null;
  parent_id: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  recurrence_rule: string | null;
}

interface TaskItemProps {
  task: TaskRow;
  onSelect: (taskId: string) => void;
}

export function TaskItem({ task, onSelect }: TaskItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);
  const toggleStatus = useToggleTaskStatus();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const isDone = task.status === 'done';

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    toggleStatus.mutate({
      id: task.id,
      currentStatus: task.status,
      isRecurring: !!task.recurrence_rule,
    });
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function handleConfirmDelete() {
    deleteTask.mutate({ id: task.id });
  }

  function handleRowClick() {
    onSelect(task.id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(task.id);
    }
  }

  function handleMoveToProject(projectId: string | null) {
    updateTask.mutate({
      id: task.id,
      input: { projectId },
    });
  }

  function handleToggleSubtasks(e: React.MouseEvent) {
    e.stopPropagation();
    setSubtasksExpanded((prev) => !prev);
  }

  function handleAddSubtaskClick(e: React.MouseEvent) {
    e.stopPropagation();
    setSubtasksExpanded(true);
  }

  return (
    <>
      <div>
        {/* Main task row */}
        <div
          role="row"
          className={cn(
            'group flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
            'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60',
            isDone && 'opacity-50'
          )}
          onClick={handleRowClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label={`Task: ${task.title}${isDone ? ' (completed)' : ''}`}
          aria-expanded={subtasksExpanded}
        >
          {/* Expand/collapse chevron */}
          <button
            type="button"
            onClick={handleToggleSubtasks}
            aria-label={
              subtasksExpanded ? 'Collapse subtasks' : 'Expand subtasks'
            }
            className={cn(
              'flex-shrink-0 rounded p-0.5 text-gray-300 transition-all duration-150',
              'hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              subtasksExpanded && 'rotate-90 text-gray-500 dark:text-gray-400'
            )}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {/* Checkbox */}
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isDone}
              onChange={handleCheckboxChange}
              disabled={toggleStatus.isPending}
              aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'complete'}`}
              className={cn(
                'h-4 w-4 cursor-pointer rounded border-gray-300 text-indigo-600 transition-colors',
                'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                'dark:border-gray-600 dark:bg-gray-900 dark:checked:bg-indigo-500',
                'dark:focus-visible:ring-offset-gray-950',
                toggleStatus.isPending && 'opacity-50 cursor-wait'
              )}
            />
          </div>

          {/* Title */}
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-gray-100',
              isDone && 'line-through text-gray-400 dark:text-gray-500'
            )}
          >
            {task.title}
          </span>

          {/* Meta badges */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {task.priority !== 'none' && (
              <PriorityBadge priority={task.priority as TaskPriority} />
            )}
            {task.recurrence_rule && (
              <RecurrenceBadge rule={task.recurrence_rule} />
            )}
            {task.due_date && <DueDateBadge dueDate={task.due_date} />}
          </div>

          {/* Hover actions */}
          <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {/* Add subtask */}
            <button
              type="button"
              onClick={handleAddSubtaskClick}
              aria-label={`Add subtask to "${task.title}"`}
              className={cn(
                'rounded p-1 text-gray-400 transition-colors',
                'hover:bg-green-50 hover:text-green-600',
                'dark:hover:bg-green-900/30 dark:hover:text-green-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Move to project */}
            <ProjectSelector
              currentProjectId={task.project_id}
              onSelect={handleMoveToProject}
              trigger={
                <button
                  type="button"
                  aria-label={`Move task "${task.title}" to a project`}
                  disabled={updateTask.isPending}
                  className={cn(
                    'rounded p-1 text-gray-400 transition-colors',
                    'hover:bg-blue-50 hover:text-blue-600',
                    'dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    updateTask.isPending && 'cursor-wait opacity-50'
                  )}
                >
                  <FolderInput className="h-4 w-4" aria-hidden="true" />
                </button>
              }
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteTask.isPending}
              aria-label={`Delete task "${task.title}"`}
              className={cn(
                'rounded p-1 text-gray-400 transition-opacity',
                'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                deleteTask.isPending && 'cursor-wait'
              )}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Subtask panel — indented below parent */}
        {subtasksExpanded && (
          <div className="ml-8 border-l-2 border-gray-100 pl-3 dark:border-gray-800">
            <SubtaskList
              parentId={task.id}
              projectId={task.project_id}
              onSelectSubtask={onSelect}
            />
          </div>
        )}
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

import { useState, FormEvent } from 'react';
import { Repeat } from 'lucide-react';
import { Button, Input } from '@/components/shared';
import { cn } from '@/utils/cn';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types/project';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type TaskPriority,
} from '@/utils/priorities';
import type { RecurrenceRule } from '@/types/task';
import type { TaskRow } from './TaskItem';
import { TemplatePicker } from '@/components/templates/TemplatePicker';
import type { Template } from '@/types/template';

interface TaskFormProps {
  task?: TaskRow;
  projectId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

const PRIORITIES: TaskPriority[] = ['none', 'low', 'medium', 'high'];

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: null, label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekdays', label: 'Weekdays' },
];

export function TaskForm({ task, projectId, onSave, onCancel }: TaskFormProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(
    (task?.priority as TaskPriority) ?? 'none'
  );
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(
    (task?.recurrence_rule as RecurrenceRule) ?? null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    task?.project_id ?? projectId ?? null
  );
  const [titleError, setTitleError] = useState('');

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projectsRaw } = useProjects();
  const projects = (projectsRaw ?? []) as unknown as Project[];

  const isPending = createTask.isPending || updateTask.isPending;

  function validate(): boolean {
    if (!title.trim()) {
      setTitleError('Title is required.');
      return false;
    }
    setTitleError('');
    return true;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateTask.mutate(
        {
          id: task.id,
          input: {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: dueDate || null,
            projectId: selectedProjectId,
            recurrenceRule,
          },
        },
        { onSuccess: onSave }
      );
    } else {
      createTask.mutate(
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || null,
          projectId: selectedProjectId,
          recurrenceRule,
        },
        { onSuccess: onSave }
      );
    }
  }

  function applyTemplate(template: Template) {
    if (template.type !== 'task') return;
    if (template.title) setTitle(template.title);
    if (template.description) setDescription(template.description);
    if (template.priority) setPriority(template.priority as TaskPriority);
    if (template.recurrenceRule)
      setRecurrenceRule(template.recurrenceRule as RecurrenceRule);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Title row with template picker (new tasks only) */}
      {!isEditing && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Task
          </span>
          <TemplatePicker type="task" onSelect={applyTemplate} />
        </div>
      )}

      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (titleError) setTitleError('');
        }}
        placeholder="Task title"
        required
        error={titleError}
        disabled={isPending}
        autoFocus
      />

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
          disabled={isPending}
          className={cn(
            'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
            'bg-white transition-colors dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'dark:border-gray-700 dark:focus-visible:ring-offset-gray-950',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none'
          )}
        />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Priority
        </span>
        <div className="flex gap-2" role="group" aria-label="Task priority">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              disabled={isPending}
              aria-pressed={priority === p}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                'dark:focus-visible:ring-offset-gray-950',
                priority === p
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
                p !== 'none' && priority === p && PRIORITY_COLORS[p]
              )}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="task-due-date"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Due date
        </label>
        <input
          id="task-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isPending}
          className={cn(
            'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900',
            'bg-white transition-colors dark:bg-gray-900 dark:text-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'dark:border-gray-700 dark:focus-visible:ring-offset-gray-950',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>

      {/* Recurrence selector */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="task-recurrence"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          <Repeat className="h-3.5 w-3.5" aria-hidden="true" />
          Repeat
        </label>
        <select
          id="task-recurrence"
          value={recurrenceRule ?? ''}
          onChange={(e) =>
            setRecurrenceRule((e.target.value || null) as RecurrenceRule)
          }
          disabled={isPending}
          className={cn(
            'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900',
            'bg-white transition-colors dark:bg-gray-900 dark:text-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'dark:border-gray-700 dark:focus-visible:ring-offset-gray-950',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {RECURRENCE_OPTIONS.map((opt) => (
            <option key={opt.value ?? 'none'} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Project selector */}
      {projects && projects.length > 0 && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="task-project"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Project
          </label>
          <select
            id="task-project"
            value={selectedProjectId ?? ''}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            disabled={isPending}
            className={cn(
              'rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900',
              'bg-white transition-colors dark:bg-gray-900 dark:text-gray-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              'dark:border-gray-700 dark:focus-visible:ring-offset-gray-950',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <option value="">No project (Inbox)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {isEditing ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}

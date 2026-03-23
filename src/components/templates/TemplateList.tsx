/**
 * TemplateList — displays all templates grouped by type.
 * Used in SettingsPage under the "Templates" section.
 */

import { Trash2, FileText, CheckSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Template } from '@/types/template';

function TypeBadge({ type }: { type: 'task' | 'note' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        type === 'task'
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
      )}
    >
      {type === 'task' ? (
        <CheckSquare className="h-3 w-3" aria-hidden="true" />
      ) : (
        <FileText className="h-3 w-3" aria-hidden="true" />
      )}
      {type === 'task' ? 'Task' : 'Note'}
    </span>
  );
}

function TemplateRow({ template }: { template: Template }) {
  const deleteTemplate = useDeleteTemplate();

  const preview =
    template.type === 'task'
      ? (template.description?.slice(0, 80) ?? '')
      : (template.contentPlain?.slice(0, 80) ?? '');

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {template.name}
          </span>
          <TypeBadge type={template.type} />
          {template.isDefault && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              starter
            </span>
          )}
        </div>
        {preview && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 whitespace-pre-line">
            {preview}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label={`Delete template "${template.name}"`}
        disabled={deleteTemplate.isPending}
        onClick={() => deleteTemplate.mutate(template.id)}
        className={cn(
          'flex-shrink-0 rounded p-1.5 transition-colors',
          'text-gray-400 hover:bg-red-100 hover:text-red-600',
          'dark:text-gray-600 dark:hover:bg-red-900/40 dark:hover:text-red-400',
          'disabled:opacity-50'
        )}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

export function TemplateList() {
  const { data: templates = [], isLoading, isError } = useTemplates();

  const taskTemplates = templates.filter(
    (t) => t.type === 'task'
  ) as Template[];
  const noteTemplates = templates.filter(
    (t) => t.type === 'note'
  ) as Template[];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
        <LoadingSpinner size="sm" />
        Loading templates…
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-2 text-sm text-red-500 dark:text-red-400">
        Failed to load templates.
      </p>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
        No templates yet. Open a task or note and use "Save as template" to
        create one.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {taskTemplates.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Task Templates
          </h3>
          <ul className="space-y-2">
            {taskTemplates.map((t) => (
              <TemplateRow key={t.id} template={t} />
            ))}
          </ul>
        </div>
      )}

      {noteTemplates.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Note Templates
          </h3>
          <ul className="space-y-2">
            {noteTemplates.map((t) => (
              <TemplateRow key={t.id} template={t} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

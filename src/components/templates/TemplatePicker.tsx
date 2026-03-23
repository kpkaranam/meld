/**
 * TemplatePicker — a dropdown for selecting a task or note template.
 *
 * Renders a custom trigger element. On click, shows a floating dropdown
 * listing available templates for the given type.
 */

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  FileText,
  CheckSquare,
  LayoutTemplate,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTemplates } from '@/hooks/useTemplates';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Template, TemplateType } from '@/types/template';

export interface TemplatePickerProps {
  type: TemplateType;
  onSelect: (template: Template) => void;
  /** Custom trigger element. Defaults to a "Use template" button. */
  trigger?: React.ReactNode;
}

export function TemplatePicker({
  type,
  onSelect,
  trigger,
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: allTemplates = [], isLoading } = useTemplates(type);

  const templates = allTemplates as Template[];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function handleSelect(template: Template) {
    onSelect(template);
    setOpen(false);
  }

  const defaultTrigger = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
        'border border-gray-200 dark:border-gray-700',
        'text-gray-600 dark:text-gray-400',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
      )}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <LayoutTemplate className="h-3.5 w-3.5" aria-hidden="true" />
      Use template
      <ChevronDown className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="cursor-pointer"
      >
        {trigger ?? defaultTrigger}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute left-0 top-full z-50 mt-1',
            'w-64 rounded-xl border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40'
          )}
          role="listbox"
          aria-label={`${type} templates`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              <LoadingSpinner size="sm" />
              Loading…
            </div>
          ) : templates.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              <p>No {type} templates yet.</p>
              <p className="mt-1 text-xs">
                Open a {type} and use "Save as template" to create one.
              </p>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(template)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-2.5 text-left',
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      'transition-colors',
                      'focus-visible:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-800'
                    )}
                  >
                    <span className="mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-600">
                      {type === 'task' ? (
                        <CheckSquare className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {template.name}
                      </p>
                      {(template.type === 'task'
                        ? template.description
                        : template.contentPlain) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 whitespace-pre-line">
                          {template.type === 'task'
                            ? template.description
                            : template.contentPlain}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

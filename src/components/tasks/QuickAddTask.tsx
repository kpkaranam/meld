/**
 * QuickAddTask — inline task creation with natural language date parsing.
 *
 * When the user types a task title that contains a recognisable date phrase
 * (e.g. "Buy groceries next Friday") the component:
 *   1. Parses the date with chrono-node via parseNaturalDate
 *   2. Shows a "Due: <date>" preview badge below the input
 *   3. On Enter, creates the task with the cleaned title and parsed due_date
 */

import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import { useCreateTask } from '@/hooks/useTasks';
import { parseNaturalDate } from '@/utils/dateParser';

interface QuickAddTaskProps {
  projectId?: string | null;
}

export function QuickAddTask({ projectId }: QuickAddTaskProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();

  // Re-parse on every render so the preview is always in sync.
  const { date: parsedDate, cleanText } = parseNaturalDate(value);

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const title = cleanText.trim() || value.trim();
    if (!title) return;

    createTask.mutate(
      {
        title,
        projectId: projectId ?? null,
        dueDate: parsedDate ?? undefined,
      },
      {
        onSuccess: () => {
          setValue('');
          inputRef.current?.focus();
        },
      }
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2">
        <Plus
          className="h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={createTask.isPending}
          placeholder="Add a task..."
          aria-label="Quick add task"
          className={cn(
            'flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none',
            'dark:text-gray-100 dark:placeholder-gray-500',
            createTask.isPending && 'opacity-50 cursor-wait'
          )}
        />
        {createTask.isPending && (
          <span
            className="text-xs text-gray-400 dark:text-gray-500"
            aria-live="polite"
          >
            Adding...
          </span>
        )}
      </div>

      {/* Natural language date preview */}
      {parsedDate && value.trim() && (
        <div
          className="px-3 pb-1.5 text-xs text-indigo-600 dark:text-indigo-400"
          aria-live="polite"
          role="status"
        >
          Due: {formatDate(parsedDate)}
        </div>
      )}
    </div>
  );
}

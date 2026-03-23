import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCreateTask } from '@/hooks/useTasks';

interface QuickAddTaskProps {
  projectId?: string | null;
}

export function QuickAddTask({ projectId }: QuickAddTaskProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const title = value.trim();
    if (!title) return;

    createTask.mutate(
      { title, projectId: projectId ?? null },
      {
        onSuccess: () => {
          setValue('');
          inputRef.current?.focus();
        },
      }
    );
  }

  return (
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
  );
}

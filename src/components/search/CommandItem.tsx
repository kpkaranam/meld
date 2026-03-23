import { cn } from '@/utils/cn';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  /** Words used for fuzzy matching in addition to the label. */
  keywords: string[];
  /** Optional keyboard shortcut label shown on the right (e.g. "Ctrl+N"). */
  shortcut?: string;
}

interface CommandItemProps {
  command: Command;
  isSelected: boolean;
  onExecute: () => void;
  onMouseEnter: () => void;
}

export function CommandItem({
  command,
  isSelected,
  onExecute,
  onMouseEnter,
}: CommandItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onExecute}
      onMouseEnter={onMouseEnter}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/40'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
      )}
    >
      {/* Icon */}
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isSelected
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        )}
        aria-hidden="true"
      >
        {command.icon}
      </span>

      {/* Label + description */}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-sm font-semibold',
            isSelected
              ? 'text-indigo-700 dark:text-indigo-300'
              : 'text-gray-900 dark:text-gray-100'
          )}
        >
          {command.label}
        </span>
        {command.description && (
          <span
            className={cn(
              'mt-0.5 block truncate text-xs',
              isSelected
                ? 'text-indigo-500/80 dark:text-indigo-400/70'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {command.description}
          </span>
        )}
      </span>

      {/* Keyboard shortcut badge */}
      {command.shortcut && (
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-xs font-medium',
            isSelected
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}
          aria-label={`Keyboard shortcut: ${command.shortcut}`}
        >
          {command.shortcut}
        </span>
      )}
    </button>
  );
}

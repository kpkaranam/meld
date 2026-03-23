import { Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate, isOverdue } from '@/utils/dates';

interface DueDateBadgeProps {
  dueDate: string;
  className?: string;
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  const overdue = isOverdue(dueDate);
  const today = isToday(dueDate);

  let label: string;
  if (today) {
    label = 'Today';
  } else if (overdue) {
    label = `Overdue · ${formatDate(dueDate)}`;
  } else {
    label = formatDate(dueDate);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        overdue
          ? 'text-red-600 dark:text-red-400'
          : today
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-gray-500 dark:text-gray-400',
        className
      )}
      aria-label={`Due date: ${label}`}
    >
      <Calendar className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
}

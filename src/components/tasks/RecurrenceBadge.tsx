import { Repeat } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RecurrenceBadgeProps {
  rule: string;
  className?: string;
}

const labels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  weekdays: 'Weekdays',
};

/**
 * Small pill showing the recurrence pattern of a task.
 * Displays a Repeat icon and a human-readable label.
 */
export function RecurrenceBadge({ rule, className }: RecurrenceBadgeProps) {
  const label = labels[rule] ?? rule;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        'text-xs font-medium',
        className
      )}
      title={`Repeats ${label.toLowerCase()}`}
      aria-label={`Recurring: ${label}`}
    >
      <Repeat className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

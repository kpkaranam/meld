import { Flag } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type TaskPriority,
} from '@/utils/priorities';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === 'none') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        PRIORITY_COLORS[priority],
        className
      )}
      aria-label={`Priority: ${PRIORITY_LABELS[priority]}`}
    >
      <Flag className="h-3 w-3" aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

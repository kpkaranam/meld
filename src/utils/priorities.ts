// Local definition until the shared task types (S1-003) are merged.
// TODO: replace with `import type { TaskPriority } from '@/types/task'` after S1-003 merges.
type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export type { TaskPriority };

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  none: 'text-gray-400 dark:text-gray-500',
  low: 'text-blue-500 dark:text-blue-400',
  medium: 'text-yellow-500 dark:text-yellow-400',
  high: 'text-red-500 dark:text-red-400',
};

export const PRIORITY_SORT_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

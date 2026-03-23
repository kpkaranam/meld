/**
 * Domain types for tasks.
 * Maps from database snake_case rows to camelCase application types.
 */

import type { Tag } from './tag';

/** Allowed task statuses matching the database CHECK constraint. */
export type TaskStatus = 'todo' | 'done';

/** Allowed task priority levels matching the database CHECK constraint. */
export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  projectId: string | null;
  /** Parent task id for subtasks. Null for top-level tasks. */
  parentId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO 8601 date string (YYYY-MM-DD). Null when no due date is set. */
  dueDate: string | null;
  /** ISO 8601 timestamp. Null when the task is not yet completed. */
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Eagerly loaded tags. Present only when fetched with tag join. */
  tags?: Tag[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: string | null;
  /** Set to create a subtask under the given parent task. */
  parentId?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  projectId?: string | null;
  /** Move to a different parent (or promote to top-level with null). */
  parentId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  completedAt?: string | null;
  sortOrder?: number;
}

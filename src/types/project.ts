/**
 * Domain types for projects.
 * Projects are containers for organizing tasks and notes, scoped to a user.
 */

export interface Project {
  id: string;
  userId: string;
  name: string;
  /** Hex color string, e.g. "#6366f1". Must match /^#[0-9a-fA-F]{6}$/. */
  color: string;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  isArchived?: boolean;
  sortOrder?: number;
}

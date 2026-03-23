/**
 * Domain types for tags.
 * Tags are user-scoped and shared across tasks and notes.
 * Tag names are case-insensitive (enforced by the database unique index).
 */

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: string;
}

export interface CreateTagInput {
  name: string;
  color?: string | null;
}

export interface UpdateTagInput {
  name?: string;
  color?: string | null;
}

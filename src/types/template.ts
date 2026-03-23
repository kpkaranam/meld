/**
 * Domain types for templates.
 * Templates capture the structure of a task or note so it can be reused.
 */

export type TemplateType = 'task' | 'note';

export interface Template {
  id: string;
  userId: string;
  name: string;
  type: TemplateType;
  /** Pre-filled title (task templates). Null when not set. */
  title: string | null;
  /** Pre-filled description / body text (task templates). Null when not set. */
  description: string | null;
  /** Pre-filled priority (task templates). Defaults to 'none'. */
  priority: string;
  /** Pre-filled recurrence rule (task templates). Null when not set. */
  recurrenceRule: string | null;
  /** TipTap document JSON (note templates). */
  content: unknown;
  /** Plaintext mirror of content (note templates). */
  contentPlain: string;
  /** Whether this is a built-in starter template. */
  isDefault: boolean;
  /** Display order within the list. */
  sortOrder: number;
  createdAt: string;
}

export interface CreateTemplateInput {
  name: string;
  type: TemplateType;
  title?: string;
  description?: string;
  priority?: string;
  recurrenceRule?: string;
  content?: unknown;
  contentPlain?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  title?: string;
  description?: string;
  priority?: string;
  recurrenceRule?: string;
  content?: unknown;
  contentPlain?: string;
}

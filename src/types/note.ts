/**
 * Domain types for notes.
 * Notes store TipTap document JSON in `content` and a plaintext mirror in
 * `contentPlain` that is used for full-text search.
 */

import type { Json } from './database';
import type { Tag } from './tag';

export interface Note {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  /** TipTap JSON document (stored as jsonb in PostgreSQL). */
  content: Json;
  /** Plaintext extraction of content used for PostgreSQL full-text search. */
  contentPlain: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  /** Eagerly loaded tags. Present only when fetched with tag join. */
  tags?: Tag[];
}

export interface CreateNoteInput {
  title: string;
  content?: Json;
  contentPlain?: string;
  projectId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: Json;
  contentPlain?: string;
  projectId?: string | null;
  isPinned?: boolean;
}

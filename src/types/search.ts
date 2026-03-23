/**
 * Domain types for full-text search results.
 * Returned by the `search_items` PostgreSQL function via the service layer.
 */

export type SearchItemType = 'task' | 'note';

export interface SearchResult {
  id: string;
  type: SearchItemType;
  title: string;
  /** Short excerpt from the matching content with search terms highlighted. */
  snippet: string;
  projectId: string | null;
  /** PostgreSQL ts_rank score. Higher values indicate better matches. */
  rank: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search service — sole gateway for full-text search operations.
 *
 * Calls the `search_items` PostgreSQL RPC function via Supabase and maps
 * the snake_case database response to the camelCase domain type.
 *
 * No component or hook may call Supabase directly for search.
 * All reads go through this module.
 */

import { supabase } from '../lib/supabase';
import type { SearchResult } from '../types/search';

/**
 * Filter parameter for the search RPC.
 * - 'all'   — search both tasks and notes (default)
 * - 'tasks' — restrict results to tasks only
 * - 'notes' — restrict results to notes only
 */
export type SearchItemType = 'all' | 'tasks' | 'notes';

export const searchService = {
  /**
   * Execute a full-text search across tasks and/or notes.
   *
   * Returns an empty array immediately when `query` is blank to avoid
   * unnecessary RPC calls.
   *
   * Results are ordered by PostgreSQL `ts_rank` descending (best matches
   * first), limited to `maxResults` rows.
   *
   * @param query      - Raw search string entered by the user
   * @param itemType   - Which item types to include (default: 'all')
   * @param maxResults - Upper bound on result count (default: 20)
   */
  async search(
    query: string,
    itemType: SearchItemType = 'all',
    maxResults = 20
  ): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase.rpc('search_items', {
      query: query.trim(),
      item_type: itemType,
      max_results: maxResults,
    });

    if (error) {
      console.error('[searchService.search] Supabase error:', error.message);
      throw error;
    }

    // Map snake_case DB response to the camelCase domain type
    return (data ?? []).map((row) => ({
      id: row.id,
      type: row.type as SearchResult['type'],
      title: row.title,
      snippet: row.snippet,
      projectId: row.project_id,
      rank: row.rank,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};

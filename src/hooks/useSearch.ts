/**
 * TanStack Query hook for full-text search.
 *
 * Debounces the raw query string before issuing the RPC so that keystrokes
 * do not trigger a new fetch on every character typed.
 *
 * The query is only enabled when the debounced string is non-empty so that
 * an idle search bar produces no network traffic.
 */

import { useQuery } from '@tanstack/react-query';
import { searchService, type SearchItemType } from '../services/searchService';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_MS } from '../utils/constants';

/** Structured query-key factory for search queries. */
export const searchKeys = {
  all: ['search'] as const,
  query: (q: string, type: SearchItemType) =>
    [...searchKeys.all, q, type] as const,
};

/**
 * Execute a debounced full-text search and return the TanStack Query result.
 *
 * @param query    - Raw query string from the search input
 * @param itemType - Item type filter passed to the search service (default: 'all')
 */
export function useSearch(query: string, itemType: SearchItemType = 'all') {
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  return useQuery({
    queryKey: searchKeys.query(debouncedQuery, itemType),
    queryFn: () => searchService.search(debouncedQuery, itemType),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute — search results do not need to be refetched aggressively
  });
}

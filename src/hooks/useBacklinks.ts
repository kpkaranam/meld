/**
 * Hook to find notes that reference a given note title via [[wiki-link]] syntax.
 *
 * Queries the `content_plain` column for occurrences of [[noteTitle]] using a
 * case-insensitive ILIKE match. Returns a lightweight list of notes (id, title,
 * updated_at) suitable for rendering in a backlinks panel.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface BacklinkNote {
  id: string;
  title: string;
  updated_at: string;
}

export function useBacklinks(noteTitle: string) {
  return useQuery<BacklinkNote[]>({
    queryKey: ['backlinks', noteTitle],
    queryFn: async () => {
      if (!noteTitle) return [];

      // Search for notes containing [[noteTitle]] in their content_plain.
      // We escape square brackets for the ILIKE pattern; Postgres ILIKE does not
      // interpret brackets as special characters, so no escaping is needed beyond
      // the literal text.
      const searchTerm = `[[${noteTitle}]]`;

      const { data, error } = await supabase
        .from('notes')
        .select('id, title, updated_at')
        .ilike('content_plain', `%${searchTerm}%`);

      if (error) throw error;
      return (data ?? []) as BacklinkNote[];
    },
    enabled: !!noteTitle,
  });
}

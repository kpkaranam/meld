/**
 * Note service — single gateway for all note-related database operations.
 *
 * Notes store TipTap document JSON in `content` (PostgreSQL jsonb) and a
 * plaintext mirror in `content_plain` for full-text search.
 *
 * Query semantics for getNotes:
 *   getNotes(undefined) — all notes for the authenticated user
 *   getNotes(null)      — Inbox: notes with no project assigned
 *   getNotes(id)        — notes belonging to the given project
 *
 * All functions throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type { CreateNoteInput, UpdateNoteInput } from '../types/note';

export const noteService = {
  /**
   * Fetch notes, optionally filtered by project.
   * Results are ordered: pinned notes first, then by most recently updated.
   *
   * @param projectId - undefined = all, null = Inbox, string = specific project
   */
  async getNotes(projectId?: string | null) {
    let query = supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (projectId === null) {
      // Inbox: notes with no project
      query = query.is('project_id', null);
    } else if (projectId !== undefined) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[noteService.getNotes] Supabase error:', error.message, error.details, error.hint, error.code);
      throw error;
    }
    return data;
  },

  /**
   * Fetch a single note by its primary key, including eager-loaded tags.
   *
   * @param id - UUID of the note
   */
  async getNoteById(id: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*, note_tags(tag_id, tags(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Create a new note owned by the currently authenticated user.
   * Throws if no session exists.
   *
   * @param input - Note creation payload
   */
  async createNote(input: CreateNoteInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: input.title,
        content: input.content ?? {},
        content_plain: input.contentPlain ?? '',
        project_id: input.projectId ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Partially update an existing note.
   * Only fields present in the input object are written — undefined fields
   * are left unchanged in the database.
   *
   * @param id    - UUID of the note to update
   * @param input - Fields to update (all optional)
   */
  async updateNote(id: string, input: UpdateNoteInput) {
    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.contentPlain !== undefined)
      updateData.content_plain = input.contentPlain;
    if (input.projectId !== undefined) updateData.project_id = input.projectId;
    if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete a note by its primary key.
   *
   * @param id - UUID of the note to delete
   */
  async deleteNote(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Toggle the pinned state of a note.
   * Convenience wrapper around updateNote.
   *
   * @param id             - UUID of the note
   * @param currentPinned  - The note's current is_pinned value
   */
  async togglePin(id: string, currentPinned: boolean) {
    return this.updateNote(id, { isPinned: !currentPinned });
  },
};

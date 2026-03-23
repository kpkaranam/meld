/**
 * Tag service — sole gateway for all tag data operations.
 *
 * No component or hook may call Supabase directly for tag data.
 * All reads and writes go through this module.
 *
 * Tags are user-scoped and shared across tasks and notes.
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type { CreateTagInput, UpdateTagInput } from '../types/tag';

export const tagService = {
  /**
   * Fetch all tags for the authenticated user, ordered alphabetically.
   */
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Create a new tag for the currently authenticated user.
   * Throws if no user session exists.
   *
   * Defaults color to #6b7280 (gray) if not provided.
   */
  async createTag(input: CreateTagInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.id,
        name: input.name,
        color: input.color ?? '#6b7280',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Apply a partial update to an existing tag.
   *
   * Supports updating name and color.
   * Returns the updated row.
   */
  async updateTag(id: string, input: UpdateTagInput) {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) updateData.color = input.color;

    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete a tag by primary key.
   * Related task_tags and note_tags rows are removed by ON DELETE CASCADE.
   */
  async deleteTag(id: string) {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Associate a tag with a task.
   * No-ops silently if the association already exists (database unique constraint).
   */
  async addTagToTask(taskId: string, tagId: string) {
    const { error } = await supabase
      .from('task_tags')
      .insert({ task_id: taskId, tag_id: tagId });
    if (error) throw error;
  },

  /**
   * Remove a tag association from a task.
   */
  async removeTagFromTask(taskId: string, tagId: string) {
    const { error } = await supabase
      .from('task_tags')
      .delete()
      .eq('task_id', taskId)
      .eq('tag_id', tagId);
    if (error) throw error;
  },

  /**
   * Associate a tag with a note.
   * No-ops silently if the association already exists (database unique constraint).
   */
  async addTagToNote(noteId: string, tagId: string) {
    const { error } = await supabase
      .from('note_tags')
      .insert({ note_id: noteId, tag_id: tagId });
    if (error) throw error;
  },

  /**
   * Remove a tag association from a note.
   */
  async removeTagFromNote(noteId: string, tagId: string) {
    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag_id', tagId);
    if (error) throw error;
  },

  /**
   * Fetch all tasks that have the given tag applied.
   * Returns join rows with the full task record nested.
   */
  async getTasksByTag(tagId: string) {
    const { data, error } = await supabase
      .from('task_tags')
      .select('task_id, tasks(*)')
      .eq('tag_id', tagId);
    if (error) throw error;
    return data;
  },

  /**
   * Fetch all notes that have the given tag applied.
   * Returns join rows with the full note record nested.
   */
  async getNotesByTag(tagId: string) {
    const { data, error } = await supabase
      .from('note_tags')
      .select('note_id, notes(*)')
      .eq('tag_id', tagId);
    if (error) throw error;
    return data;
  },
};

/**
 * Link service — sole gateway for task-note bidirectional link operations.
 *
 * Manages the task_note_links join table which forms the core Meld
 * differentiator: any task can be linked to any note owned by the same user.
 *
 * All functions throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';

/** A note summary returned when fetching links from a task. */
export interface LinkedNote {
  id: string;
  title: string;
  updated_at: string;
}

/** A task summary returned when fetching links from a note. */
export interface LinkedTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
}

export const linkService = {
  /**
   * Fetch all notes linked to a given task.
   *
   * @param taskId - UUID of the task
   */
  async getLinkedNotes(taskId: string): Promise<LinkedNote[]> {
    const { data, error } = await supabase
      .from('task_note_links')
      .select('note_id, notes(id, title, updated_at)')
      .eq('task_id', taskId);
    if (error) throw error;
    return (data ?? [])
      .map((d: unknown) => (d as { notes: LinkedNote | null }).notes)
      .filter((n): n is LinkedNote => n !== null);
  },

  /**
   * Fetch all tasks linked to a given note.
   *
   * @param noteId - UUID of the note
   */
  async getLinkedTasks(noteId: string): Promise<LinkedTask[]> {
    const { data, error } = await supabase
      .from('task_note_links')
      .select('task_id, tasks(id, title, status, priority, due_date)')
      .eq('note_id', noteId);
    if (error) throw error;
    return (data ?? [])
      .map((d: unknown) => (d as { tasks: LinkedTask | null }).tasks)
      .filter((t): t is LinkedTask => t !== null);
  },

  /**
   * Create a link between a task and a note.
   * No-ops if the link already exists (primary key conflict is silently ignored
   * by checking for duplicate key code '23505').
   *
   * @param taskId - UUID of the task
   * @param noteId - UUID of the note
   */
  async linkTaskToNote(taskId: string, noteId: string): Promise<void> {
    const { error } = await supabase
      .from('task_note_links')
      .insert({ task_id: taskId, note_id: noteId });
    if (error && error.code !== '23505') throw error;
  },

  /**
   * Remove the link between a task and a note.
   *
   * @param taskId - UUID of the task
   * @param noteId - UUID of the note
   */
  async unlinkTaskFromNote(taskId: string, noteId: string): Promise<void> {
    const { error } = await supabase
      .from('task_note_links')
      .delete()
      .eq('task_id', taskId)
      .eq('note_id', noteId);
    if (error) throw error;
  },
};

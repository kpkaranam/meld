/**
 * Task service — sole gateway for all task data operations.
 *
 * No component or hook may call Supabase directly for task data.
 * All reads and writes go through this module.
 *
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task';

export const taskService = {
  /**
   * Fetch tasks, optionally filtered by project.
   *
   * - `getTasks(undefined)` — returns all tasks for the authenticated user.
   * - `getTasks(null)`      — returns Inbox tasks (project_id IS NULL).
   * - `getTasks(id)`        — returns tasks belonging to the given project.
   *
   * Results are ordered by sort_order ascending.
   * Tags are eagerly loaded via the task_tags join.
   */
  async getTasks(projectId?: string | null) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('sort_order', { ascending: true });

    if (projectId === null) {
      // Inbox: tasks with no project assigned
      query = query.is('project_id', null);
    } else if (projectId !== undefined) {
      query = query.eq('project_id', projectId);
    }
    // projectId === undefined → no filter, return all tasks

    const { data, error } = await query;
    if (error) {
      console.error('[taskService.getTasks] Supabase error:', error.message, error.details, error.hint, error.code);
      throw error;
    }
    return data;
  },

  /**
   * Fetch a single task by primary key.
   * Tags are eagerly loaded via the task_tags join.
   * Throws if the task does not exist.
   */
  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_tags(tag_id, tags(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetch tasks due today or earlier that are still in "todo" status.
   * Used by the Today view.
   *
   * Results are ordered by due_date ascending, then priority ascending.
   */
  async getTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lte('due_date', today)
      .eq('status', 'todo')
      .order('due_date', { ascending: true })
      .order('priority', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Create a new task for the currently authenticated user.
   * Throws if no user session exists.
   *
   * Returns the created row with tags eagerly loaded.
   */
  async createTask(input: CreateTaskInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? '',
        project_id: input.projectId ?? null,
        priority: input.priority ?? 'none',
        due_date: input.dueDate ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Apply a partial update to an existing task.
   *
   * When `status` is set to 'done', `completed_at` is automatically set to
   * the current timestamp. When `status` is reverted to 'todo', `completed_at`
   * is cleared to null.
   *
   * Returns the updated row with tags eagerly loaded.
   */
  async updateTask(id: string, input: UpdateTaskInput) {
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.status !== undefined) {
      updateData.status = input.status;
      updateData.completed_at =
        input.status === 'done' ? new Date().toISOString() : null;
    }
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.projectId !== undefined) updateData.project_id = input.projectId;
    if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete a task by primary key.
   * Related task_tags rows are removed by the ON DELETE CASCADE constraint.
   */
  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  /**
   * Toggle a task between 'todo' and 'done' statuses.
   * Convenience wrapper around updateTask.
   *
   * Returns the updated row with tags eagerly loaded.
   */
  async toggleTaskStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    return this.updateTask(id, {
      status: newStatus as 'todo' | 'done',
    });
  },
};

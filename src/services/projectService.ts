/**
 * Project service — sole gateway for all project data operations.
 *
 * No component or hook may call Supabase directly for project data.
 * All reads and writes go through this module.
 *
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project';

export const projectService = {
  /**
   * Fetch all projects for the authenticated user.
   *
   * - `getProjects(false)` — returns only active (non-archived) projects.
   * - `getProjects(true)`  — returns all projects including archived ones.
   *
   * Results are ordered by sort_order ascending.
   */
  async getProjects(includeArchived = false) {
    let query = supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single project by primary key.
   * Throws if the project does not exist.
   */
  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Create a new project for the currently authenticated user.
   * Throws if no user session exists.
   *
   * Defaults color to #6366f1 (indigo) if not provided.
   */
  async createProject(input: CreateProjectInput) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: input.name,
        color: input.color ?? '#6366f1',
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Apply a partial update to an existing project.
   *
   * Supports updating name, color, archived state, and sort order.
   * Returns the updated row.
   */
  async updateProject(id: string, input: UpdateProjectInput) {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.isArchived !== undefined)
      updateData.is_archived = input.isArchived;
    if (input.sortOrder !== undefined) updateData.sort_order = input.sortOrder;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Permanently delete a project by primary key.
   * Tasks and notes assigned to this project are handled by the database
   * (project_id set to NULL via ON DELETE SET NULL).
   */
  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};

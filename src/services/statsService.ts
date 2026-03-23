/**
 * Stats service — aggregation queries for the productivity dashboard.
 *
 * All functions are async and throw on error so callers can use try/catch.
 * Components must never import supabase directly — always use this service.
 */

import { supabase } from '../lib/supabase';

export const statsService = {
  /**
   * Returns a Map of ISO date string → count of tasks completed on that date,
   * for the last N days (default 30).
   */
  async getTaskCompletionStats(
    days: number = 30
  ): Promise<Map<string, number>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('status', 'done')
      .gte('completed_at', since.toISOString())
      .order('completed_at', { ascending: true });
    if (error) throw error;

    const byDate = new Map<string, number>();
    (data ?? []).forEach((t) => {
      if (t.completed_at) {
        const date = (t.completed_at as string).split('T')[0];
        byDate.set(date, (byDate.get(date) ?? 0) + 1);
      }
    });
    return byDate;
  },

  /**
   * Returns overview counts: total tasks, active tasks, completed tasks,
   * total notes, total projects, and completion rate (0–100).
   */
  async getOverviewStats() {
    const [tasks, notes, projects] = await Promise.all([
      supabase.from('tasks').select('id, status', { count: 'exact' }),
      supabase.from('notes').select('id', { count: 'exact' }),
      supabase.from('projects').select('id', { count: 'exact' }),
    ]);

    if (tasks.error) throw tasks.error;
    if (notes.error) throw notes.error;
    if (projects.error) throw projects.error;

    const totalTasks = tasks.count ?? 0;
    const completedTasks = (tasks.data ?? []).filter(
      (t: { status: string }) => t.status === 'done'
    ).length;
    const activeTasks = totalTasks - completedTasks;

    return {
      totalTasks,
      activeTasks,
      completedTasks,
      totalNotes: notes.count ?? 0,
      totalProjects: projects.count ?? 0,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  },

  /**
   * Returns the number of tasks that are overdue (due_date < today, status = 'todo').
   */
  async getOverdueCount(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .lt('due_date', today)
      .eq('status', 'todo');
    if (error) throw error;
    return count ?? 0;
  },

  /**
   * Returns the 10 most-recently completed tasks (status = 'done'), sorted by
   * completed_at descending.
   */
  async getRecentCompletedTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, completed_at')
      .eq('status', 'done')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data ?? []) as Array<{
      id: string;
      title: string;
      completed_at: string;
    }>;
  },

  /**
   * Returns the 10 most-recently created notes, sorted by created_at descending.
   */
  async getRecentNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data ?? []) as Array<{
      id: string;
      title: string;
      created_at: string;
    }>;
  },

  /**
   * Returns tasks due in the next N days (default 7), ordered by due_date
   * ascending, including overdue tasks (due_date < today, status = 'todo').
   */
  async getUpcomingTasks(days: number = 7) {
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureDate = future.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, due_date, priority')
      .eq('status', 'todo')
      .not('due_date', 'is', null)
      .lte('due_date', futureDate)
      .order('due_date', { ascending: true });
    if (error) throw error;

    return (data ?? []) as Array<{
      id: string;
      title: string;
      due_date: string;
      priority: string;
    }>;
  },
};

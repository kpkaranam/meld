/**
 * Habit service — sole gateway for all habit data operations.
 *
 * No component or hook may call Supabase directly for habit data.
 * All reads and writes go through this module.
 *
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';
import type {
  Habit,
  HabitCompletion,
  CreateHabitInput,
  UpdateHabitInput,
  HabitStreaks,
} from '../types/habit';

/** Map a raw database row to the Habit application type. */
function mapHabit(row: Record<string, unknown>): Habit {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: (row.description as string) ?? '',
    color: (row.color as string) ?? '#6366f1',
    frequency: row.frequency as Habit['frequency'],
    targetCount: row.target_count as number,
    isArchived: row.is_archived as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Map a raw database row to the HabitCompletion application type. */
function mapCompletion(row: Record<string, unknown>): HabitCompletion {
  return {
    id: row.id as string,
    habitId: row.habit_id as string,
    userId: row.user_id as string,
    completedDate: row.completed_date as string,
    count: row.count as number,
    createdAt: row.created_at as string,
  };
}

/**
 * Calculate current and best streaks from a sorted list of completion dates.
 *
 * @param sortedDates - Array of ISO date strings sorted ascending.
 * @param frequency   - Habit frequency to determine expected gap between days.
 * @returns Current streak and best streak counts.
 */
function calculateStreaksFromDates(
  sortedDates: string[],
  frequency: Habit['frequency']
): HabitStreaks {
  if (sortedDates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /** Check if two consecutive dates satisfy the frequency gap. */
  function isConsecutive(prev: Date, next: Date): boolean {
    const diff = Math.round(
      (next.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (frequency === 'daily') return diff === 1;
    if (frequency === 'weekly') return diff === 7;
    if (frequency === 'weekdays') {
      // Allow gaps of 1 (Mon–Fri) or 3 (Fri→Mon)
      return diff === 1 || diff === 3;
    }
    return false;
  }

  let bestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    if (isConsecutive(prev, curr)) {
      runningStreak++;
      if (runningStreak > bestStreak) bestStreak = runningStreak;
    } else {
      runningStreak = 1;
    }
  }

  // Determine current streak: walk backward from today
  let currentStreak = 0;
  const descDates = [...sortedDates].reverse().map((d) => new Date(d));

  // The latest completion must be today or yesterday (for daily/weekdays)
  // or within the expected window for the frequency
  const latest = descDates[0];
  latest.setHours(0, 0, 0, 0);

  const diffFromToday = Math.round(
    (today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24)
  );

  let withinWindow = false;
  if (frequency === 'daily') withinWindow = diffFromToday <= 1;
  else if (frequency === 'weekdays') withinWindow = diffFromToday <= 3;
  else if (frequency === 'weekly') withinWindow = diffFromToday <= 7;

  if (withinWindow) {
    currentStreak = 1;
    for (let i = 1; i < descDates.length; i++) {
      const curr = descDates[i - 1];
      const prev = descDates[i];
      if (isConsecutive(prev, curr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak };
}

export const habitService = {
  /**
   * Fetch all non-archived habits for the authenticated user.
   * Results are ordered by created_at ascending.
   */
  async getHabits(): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[habitService.getHabits] Supabase error:', error.message);
      throw error;
    }
    return (data as Record<string, unknown>[]).map(mapHabit);
  },

  /**
   * Create a new habit for the authenticated user.
   * Throws if no user session exists.
   */
  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description ?? '',
        color: input.color ?? '#6366f1',
        frequency: input.frequency ?? 'daily',
        target_count: input.targetCount ?? 1,
      })
      .select('*')
      .single();

    if (error) {
      console.error(
        '[habitService.createHabit] Supabase error:',
        error.message
      );
      throw error;
    }
    return mapHabit(data as Record<string, unknown>);
  },

  /**
   * Apply a partial update to an existing habit.
   * Returns the updated habit.
   */
  async updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;
    if (input.targetCount !== undefined)
      updateData.target_count = input.targetCount;
    if (input.isArchived !== undefined)
      updateData.is_archived = input.isArchived;

    const { data, error } = await supabase
      .from('habits')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error(
        '[habitService.updateHabit] Supabase error:',
        error.message
      );
      throw error;
    }
    return mapHabit(data as Record<string, unknown>);
  },

  /**
   * Permanently delete a habit by primary key.
   * Related habit_completions rows are removed by ON DELETE CASCADE.
   */
  async deleteHabit(id: string): Promise<void> {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      console.error(
        '[habitService.deleteHabit] Supabase error:',
        error.message
      );
      throw error;
    }
  },

  /**
   * Fetch completions for a habit within an inclusive date range.
   *
   * @param habitId   - The habit to fetch completions for.
   * @param startDate - ISO date string (YYYY-MM-DD) inclusive start.
   * @param endDate   - ISO date string (YYYY-MM-DD) inclusive end.
   */
  async getCompletions(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<HabitCompletion[]> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .gte('completed_date', startDate)
      .lte('completed_date', endDate)
      .order('completed_date', { ascending: true });

    if (error) {
      console.error(
        '[habitService.getCompletions] Supabase error:',
        error.message
      );
      throw error;
    }
    return (data as Record<string, unknown>[]).map(mapCompletion);
  },

  /**
   * Toggle a completion for a habit on a given date.
   *
   * - If a completion exists for that date, it is deleted.
   * - If no completion exists, one is inserted.
   *
   * @param habitId - The habit to toggle.
   * @param date    - ISO date string (YYYY-MM-DD).
   * @returns The created completion, or null if a completion was removed.
   */
  async toggleCompletion(
    habitId: string,
    date: string
  ): Promise<HabitCompletion | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for existing completion
    const { data: existing, error: fetchError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('completed_date', date)
      .maybeSingle();

    if (fetchError) {
      console.error(
        '[habitService.toggleCompletion] fetch error:',
        fetchError.message
      );
      throw fetchError;
    }

    if (existing) {
      // Delete the existing completion
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', (existing as Record<string, unknown>).id as string);

      if (deleteError) {
        console.error(
          '[habitService.toggleCompletion] delete error:',
          deleteError.message
        );
        throw deleteError;
      }
      return null;
    }

    // Insert a new completion
    const { data: created, error: insertError } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        completed_date: date,
        count: 1,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error(
        '[habitService.toggleCompletion] insert error:',
        insertError.message
      );
      throw insertError;
    }
    return mapCompletion(created as Record<string, unknown>);
  },

  /**
   * Calculate current and best streaks for a habit.
   *
   * Fetches all completions for the habit, then computes streaks
   * based on the habit's frequency.
   *
   * @param habitId   - The habit to calculate streaks for.
   * @param frequency - The habit's frequency setting.
   */
  async getStreaks(
    habitId: string,
    frequency: Habit['frequency']
  ): Promise<HabitStreaks> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('completed_date')
      .eq('habit_id', habitId)
      .order('completed_date', { ascending: true });

    if (error) {
      console.error('[habitService.getStreaks] Supabase error:', error.message);
      throw error;
    }

    const dates = (data as { completed_date: string }[]).map(
      (r) => r.completed_date
    );
    return calculateStreaksFromDates(dates, frequency);
  },
};

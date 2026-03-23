/**
 * Domain types for habits.
 * Maps from database snake_case rows to camelCase application types.
 */

export type HabitFrequency = 'daily' | 'weekdays' | 'weekly';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  frequency: HabitFrequency;
  targetCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedDate: string;
  count: number;
  createdAt: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  color?: string;
  frequency?: HabitFrequency;
  targetCount?: number;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  color?: string;
  frequency?: HabitFrequency;
  targetCount?: number;
  isArchived?: boolean;
}

export interface HabitStreaks {
  currentStreak: number;
  bestStreak: number;
}

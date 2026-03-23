import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitService } from '../services/habitService';
import type { CreateHabitInput, UpdateHabitInput } from '../types/habit';
import toast from 'react-hot-toast';

// Query key factory
export const habitKeys = {
  all: ['habits'] as const,
  lists: () => [...habitKeys.all, 'list'] as const,
  list: () => [...habitKeys.lists()] as const,
  completions: (habitId: string, startDate: string, endDate: string) =>
    [...habitKeys.all, 'completions', habitId, startDate, endDate] as const,
  streaks: (habitId: string) => [...habitKeys.all, 'streaks', habitId] as const,
};

/** Fetch all non-archived habits for the authenticated user. */
export function useHabits() {
  return useQuery({
    queryKey: habitKeys.list(),
    queryFn: () => habitService.getHabits(),
  });
}

/** Create a new habit. */
export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHabitInput) => habitService.createHabit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success('Habit created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create habit');
    },
  });
}

/** Update an existing habit. */
export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateHabitInput }) =>
      habitService.updateHabit(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success('Habit updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update habit');
    },
  });
}

/** Delete a habit. */
export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => habitService.deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.lists() });
      toast.success('Habit deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete habit');
    },
  });
}

/** Fetch completions for a habit within a date range. */
export function useHabitCompletions(
  habitId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: habitKeys.completions(habitId, startDate, endDate),
    queryFn: () => habitService.getCompletions(habitId, startDate, endDate),
    enabled: !!habitId && !!startDate && !!endDate,
  });
}

/** Toggle a completion for a habit on a given date. */
export function useToggleHabitCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      habitService.toggleCompletion(habitId, date),
    onSuccess: (_data, variables) => {
      // Invalidate all completion queries for this habit
      queryClient.invalidateQueries({
        queryKey: [...habitKeys.all, 'completions', variables.habitId],
      });
      // Invalidate streaks as they depend on completions
      queryClient.invalidateQueries({
        queryKey: habitKeys.streaks(variables.habitId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle completion');
    },
  });
}

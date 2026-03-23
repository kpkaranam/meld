/**
 * HabitsPage — main view for the Habit Tracking feature.
 *
 * Lists all active habits with today's check-in status.
 * Provides a "New Habit" button to open HabitForm modal.
 * Each habit can be expanded for a weekly view and heatmap.
 */

import { useState } from 'react';
import { Flame, Plus } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { ConfirmDialog } from '@/components/shared';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { HabitItem } from '@/components/habits/HabitItem';
import { HabitForm } from '@/components/habits/HabitForm';
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
} from '@/hooks/useHabits';
import type { Habit, CreateHabitInput } from '@/types/habit';

export default function HabitsPage() {
  const { data: habits, isLoading, isError } = useHabits();

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  function handleOpenCreate() {
    setEditingHabit(null);
    setShowForm(true);
  }

  function handleEditHabit(habit: Habit) {
    setEditingHabit(habit);
    setShowForm(true);
  }

  function handleSave(data: CreateHabitInput) {
    if (editingHabit) {
      updateHabit.mutate(
        { id: editingHabit.id, input: data },
        { onSuccess: () => setShowForm(false) }
      );
    } else {
      createHabit.mutate(data, { onSuccess: () => setShowForm(false) });
    }
  }

  function handleConfirmDelete() {
    if (deletingHabit) {
      deleteHabit.mutate(deletingHabit.id);
    }
    setDeletingHabit(null);
  }

  const isSaving = createHabit.isPending || updateHabit.isPending;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-500" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Habits
          </h1>
          {habits && habits.length > 0 && (
            <span className="ml-1 text-sm text-gray-400 dark:text-gray-500">
              ({habits.length})
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5"
        >
          <Plus size={16} aria-hidden="true" />
          New Habit
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-sm text-red-500 dark:text-red-400">
            Failed to load habits. Please refresh the page.
          </div>
        )}

        {!isLoading && !isError && habits?.length === 0 && (
          <EmptyState
            title="No habits yet"
            description="Start tracking a daily habit to build streaks and stay consistent."
            action={{
              label: 'New Habit',
              onClick: handleOpenCreate,
            }}
          />
        )}

        {!isLoading && !isError && habits && habits.length > 0 && (
          <div className="space-y-2 max-w-2xl">
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onEdit={handleEditHabit}
                onDelete={setDeletingHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / edit form */}
      <HabitForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        habit={editingHabit}
        isLoading={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingHabit}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleConfirmDelete}
        title="Delete habit"
        message={`Permanently delete "${deletingHabit?.name}"? All check-in history will be lost. This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

/**
 * HabitForm — modal for creating or editing a habit.
 *
 * Fields: name, description, color, frequency, target count.
 */

import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { ColorPicker } from '@/components/shared/ColorPicker';
import type { Habit, CreateHabitInput, HabitFrequency } from '@/types/habit';

const DEFAULT_COLOR = '#6366f1';

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekly', label: 'Once a week' },
];

export interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateHabitInput) => void;
  habit?: Pick<
    Habit,
    'name' | 'description' | 'color' | 'frequency' | 'targetCount'
  > | null;
  isLoading?: boolean;
}

export function HabitForm({
  isOpen,
  onClose,
  onSave,
  habit,
  isLoading = false,
}: HabitFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [nameError, setNameError] = useState<string | undefined>();

  const isEditing = !!habit;

  // Sync form state when habit prop changes (for edit mode)
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description ?? '');
      setColor(habit.color ?? DEFAULT_COLOR);
      setFrequency(habit.frequency ?? 'daily');
      setTargetCount(habit.targetCount ?? 1);
    } else {
      setName('');
      setDescription('');
      setColor(DEFAULT_COLOR);
      setFrequency('daily');
      setTargetCount(1);
    }
    setNameError(undefined);
  }, [habit, isOpen]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Habit name is required.');
      return;
    }

    onSave({
      name: trimmed,
      description: description.trim(),
      color,
      frequency,
      targetCount,
    });
  }

  function handleClose() {
    if (!isLoading) onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Habit' : 'New Habit'}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          {/* Name */}
          <Input
            label="Habit name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError(undefined);
            }}
            placeholder="e.g. Exercise, Read, Meditate"
            error={nameError}
            autoFocus
            disabled={isLoading}
            required
          />

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description{' '}
              <span className="font-normal text-gray-400 dark:text-gray-500">
                (optional)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this habit involve?"
              rows={2}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </span>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Frequency
            </span>
            <div className="flex flex-col gap-1.5">
              {FREQUENCY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={opt.value}
                    checked={frequency === opt.value}
                    onChange={() => setFrequency(opt.value)}
                    disabled={isLoading}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Target count */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily target count
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={targetCount}
              onChange={(e) =>
                setTargetCount(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              disabled={isLoading}
              className="w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              How many times do you want to complete this habit per session?
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditing ? 'Save changes' : 'Create habit'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

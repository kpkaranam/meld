/**
 * HabitItem — a single habit row in the habits list.
 *
 * Shows: color dot, name, streak badge, today's check-in button.
 * Expands to reveal StreakDisplay and HabitHeatmap on click.
 */

import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { StreakDisplay } from './StreakDisplay';
import { HabitHeatmap } from './HabitHeatmap';
import {
  useHabitCompletions,
  useToggleHabitCompletion,
} from '@/hooks/useHabits';
import { habitService } from '@/services/habitService';
import { useQuery } from '@tanstack/react-query';
import { habitKeys } from '@/hooks/useHabits';
import type { Habit } from '@/types/habit';

interface HabitItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

/** Returns today's ISO date string (YYYY-MM-DD). */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns the ISO date string N days before today. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function HabitItem({ habit, onEdit, onDelete }: HabitItemProps) {
  const [expanded, setExpanded] = useState(false);

  const todayStr = today();
  const heatmapStart = daysAgo(90);

  // Weekly completions for StreakDisplay (last 7 days)
  const weekStart = daysAgo(6);
  const { data: weeklyCompletions = [] } = useHabitCompletions(
    habit.id,
    weekStart,
    todayStr
  );

  // Heatmap completions (last 90 days) — only fetched when expanded
  const { data: heatmapCompletions = [] } = useHabitCompletions(
    expanded ? habit.id : '',
    heatmapStart,
    todayStr
  );

  // Streaks
  const { data: streaks } = useQuery({
    queryKey: habitKeys.streaks(habit.id),
    queryFn: () => habitService.getStreaks(habit.id, habit.frequency),
  });

  const toggleCompletion = useToggleHabitCompletion();

  const isCompletedToday = weeklyCompletions.some(
    (c) => c.completedDate === todayStr
  );

  function handleToggleToday(e: React.MouseEvent) {
    e.stopPropagation();
    toggleCompletion.mutate({ habitId: habit.id, date: todayStr });
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        aria-expanded={expanded}
        aria-label={`${habit.name}, ${streaks?.currentStreak ?? 0} day streak`}
      >
        {/* Color dot */}
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
          aria-hidden="true"
        />

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {habit.name}
        </span>

        {/* Streak badge */}
        <span
          className="flex items-center gap-1 text-sm font-semibold text-orange-500 min-w-[40px] justify-end"
          title={`${streaks?.currentStreak ?? 0} day streak`}
        >
          <span aria-hidden="true">🔥</span>
          <span>{streaks?.currentStreak ?? 0}</span>
        </span>

        {/* Today check-in button */}
        <button
          type="button"
          onClick={handleToggleToday}
          disabled={toggleCompletion.isPending}
          className={cn(
            'ml-2 h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
            isCompletedToday
              ? 'border-transparent text-white'
              : 'border-gray-300 dark:border-gray-600 bg-transparent hover:border-indigo-400 dark:hover:border-indigo-500',
            toggleCompletion.isPending && 'opacity-50 cursor-not-allowed'
          )}
          style={
            isCompletedToday
              ? { backgroundColor: habit.color, borderColor: habit.color }
              : undefined
          }
          aria-label={isCompletedToday ? 'Uncheck today' : 'Check today'}
          title={
            isCompletedToday
              ? 'Completed today — click to undo'
              : 'Mark as done today'
          }
        >
          {isCompletedToday && (
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="2.5 8 6.5 12 13.5 4" />
            </svg>
          )}
        </button>

        {/* Edit / delete */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(habit);
          }}
          className="ml-1 p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label={`Edit ${habit.name}`}
          title="Edit habit"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(habit);
          }}
          className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          aria-label={`Delete ${habit.name}`}
          title="Delete habit"
        >
          <Trash2 size={14} />
        </button>

        {/* Expand chevron */}
        <span
          className="ml-1 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-5">
          <StreakDisplay
            currentStreak={streaks?.currentStreak ?? 0}
            bestStreak={streaks?.bestStreak ?? 0}
            recentCompletions={weeklyCompletions}
            color={habit.color}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Last 3 months
            </p>
            <HabitHeatmap
              completions={heatmapCompletions}
              color={habit.color}
              targetCount={habit.targetCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}

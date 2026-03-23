/**
 * StreakDisplay — shows current streak, best streak, and a 7-day weekly grid.
 */

import { cn } from '@/utils/cn';
import type { HabitCompletion } from '@/types/habit';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  /** Last 7 days of completions (used to render the weekly grid). */
  recentCompletions: HabitCompletion[];
  /** The habit's color for the weekly grid cells. */
  color: string;
}

/** Returns ISO date strings for the last N days ending today. */
function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakDisplay({
  currentStreak,
  bestStreak,
  recentCompletions,
  color,
}: StreakDisplayProps) {
  const last7 = getLastNDays(7);
  const completedSet = new Set(recentCompletions.map((c) => c.completedDate));

  return (
    <div className="space-y-3">
      {/* Streak counts */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xl" aria-hidden="true">
            🔥
          </span>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">
              {currentStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Current streak
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl" aria-hidden="true">
            🏆
          </span>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-none">
              {bestStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Best streak
            </p>
          </div>
        </div>
      </div>

      {/* Weekly grid */}
      <div>
        <div className="flex gap-1">
          {last7.map((date, idx) => {
            const completed = completedSet.has(date);
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 dark:text-gray-500 w-6 text-center">
                  {DAY_LABELS[idx]}
                </span>
                <div
                  className={cn(
                    'h-6 w-6 rounded-sm border transition-colors',
                    completed
                      ? 'border-transparent'
                      : 'border-gray-200 dark:border-gray-700 bg-transparent'
                  )}
                  style={completed ? { backgroundColor: color } : undefined}
                  title={date}
                  aria-label={`${date}: ${completed ? 'completed' : 'not completed'}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * HabitHeatmap — GitHub-style contribution heatmap for the last 3 months.
 *
 * Renders a grid of small squares (one per day) with color intensity
 * based on completion count. Uses the habit's color.
 */

import { useState } from 'react';
import type { HabitCompletion } from '@/types/habit';

interface HabitHeatmapProps {
  completions: HabitCompletion[];
  /** The habit's color used for intensity scaling. */
  color: string;
  targetCount: number;
}

/** Returns all ISO date strings for the last `days` days (ascending). */
function getDateRange(days: number): string[] {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(d.toISOString().split('T')[0]);
  }
  return result;
}

/** Parse a hex color and return r, g, b components. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/** Interpolate between white and the target color based on intensity (0–1). */
function intensityColor(hex: string, intensity: number): string {
  if (intensity <= 0) return 'transparent';
  const { r, g, b } = hexToRgb(hex);
  const alpha = Math.min(0.15 + intensity * 0.85, 1);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const WEEKS = 13; // ~3 months
const TOTAL_DAYS = WEEKS * 7; // 91 days

export function HabitHeatmap({
  completions,
  color,
  targetCount,
}: HabitHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const dates = getDateRange(TOTAL_DAYS);
  const completionMap = new Map(
    completions.map((c) => [c.completedDate, c.count])
  );

  // Build week columns: each column is 7 days
  const weeks: string[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(dates.slice(w * 7, w * 7 + 7));
  }

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    date: string,
    count: number
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ date, count, x: rect.left, y: rect.top });
  }

  return (
    <div className="relative">
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((date) => {
              const count = completionMap.get(date) ?? 0;
              const intensity =
                targetCount > 0 ? Math.min(count / targetCount, 1) : 0;
              const bg =
                count > 0 ? intensityColor(color, intensity) : undefined;

              return (
                <div
                  key={date}
                  className="h-3 w-3 rounded-sm border border-gray-200 dark:border-gray-700 cursor-default transition-opacity hover:opacity-80"
                  style={
                    bg ? { backgroundColor: bg, borderColor: bg } : undefined
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, date, count)}
                  onMouseLeave={() => setTooltip(null)}
                  role="gridcell"
                  aria-label={`${date}: ${count} completion${count !== 1 ? 's' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded shadow-lg"
          style={{ top: tooltip.y - 36, left: tooltip.x }}
        >
          <span className="font-medium">{tooltip.date}</span>
          {' — '}
          <span>
            {tooltip.count} completion{tooltip.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

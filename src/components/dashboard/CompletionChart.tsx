import { useState } from 'react';
import { cn } from '@/utils/cn';

interface CompletionChartProps {
  /** Map of ISO date string (YYYY-MM-DD) to completion count */
  data: Map<string, number>;
  /** Number of days to display (default 30) */
  days?: number;
}

/**
 * A pure-SVG bar chart showing daily task completions.
 * No third-party chart library required.
 */
export function CompletionChart({ data, days = 30 }: CompletionChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    count: number;
  } | null>(null);

  // Build the ordered list of the last `days` dates
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const counts = dates.map((d) => data.get(d) ?? 0);
  const maxCount = Math.max(...counts, 1);

  // Chart dimensions
  const barWidth = 8;
  const barGap = 3;
  const svgWidth = dates.length * (barWidth + barGap);
  const svgHeight = 80;
  const barMaxHeight = 64;
  const barRadius = 2;

  // X-axis label interval: show every 5th date label to avoid crowding
  const labelInterval = Math.ceil(days / 6);

  function formatAxisLabel(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        className="min-w-[300px]"
        aria-label="Task completions bar chart"
        role="img"
      >
        {/* Subtle horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <line
            key={frac}
            x1={0}
            x2={svgWidth}
            y1={svgHeight - barMaxHeight * frac - 8}
            y2={svgHeight - barMaxHeight * frac - 8}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-200 dark:text-gray-700"
            strokeDasharray="2 2"
          />
        ))}

        {/* Bars */}
        {dates.map((date, i) => {
          const count = counts[i];
          const barH =
            count > 0 ? Math.max((count / maxCount) * barMaxHeight, 4) : 0;
          const x = i * (barWidth + barGap);
          const y = svgHeight - barH - 8;

          return (
            <g key={date}>
              {/* Invisible hit area for hover */}
              <rect
                x={x}
                y={0}
                width={barWidth + barGap}
                height={svgHeight}
                fill="transparent"
                onMouseEnter={(e) => {
                  const svgEl = e.currentTarget.closest('svg');
                  if (!svgEl) return;
                  const rect = svgEl.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + x + barWidth / 2,
                    y: rect.top,
                    date,
                    count,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-crosshair"
              />
              {/* Actual bar */}
              {barH > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={barRadius}
                  ry={barRadius}
                  className="fill-indigo-500 dark:fill-indigo-400 opacity-80 hover:opacity-100 transition-opacity"
                />
              )}
              {/* Zero bar placeholder */}
              {barH === 0 && (
                <rect
                  x={x}
                  y={svgHeight - 10}
                  width={barWidth}
                  height={2}
                  rx={1}
                  className="fill-gray-200 dark:fill-gray-700"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* X-axis date labels */}
      <div className="flex mt-1 min-w-[300px]" style={{ width: '100%' }}>
        {dates.map((date, i) => {
          if (i % labelInterval !== 0 && i !== dates.length - 1) return null;
          const pct = (i / (dates.length - 1)) * 100;
          return (
            <span
              key={date}
              className="absolute text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
            >
              {formatAxisLabel(date)}
            </span>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={cn(
            'fixed z-50 pointer-events-none',
            'rounded-md bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 shadow-lg',
            '-translate-x-1/2 -translate-y-full'
          )}
          style={{ left: tooltip.x, top: tooltip.y - 4 }}
          role="tooltip"
        >
          <span className="font-semibold">{tooltip.count}</span>
          {' task'}
          {tooltip.count !== 1 ? 's' : ''} completed
          <br />
          <span className="text-gray-300 dark:text-gray-400">
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
}

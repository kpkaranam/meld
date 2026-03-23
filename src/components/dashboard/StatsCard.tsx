import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  /** Tailwind background color class for the icon container, e.g. 'bg-indigo-100 dark:bg-indigo-900' */
  color: string;
  /** Tailwind text color class for the icon, e.g. 'text-indigo-600 dark:text-indigo-400' */
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({
  label,
  value,
  icon,
  color,
  iconColor,
  trend,
}: StatsCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
      {/* Icon container */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          color
        )}
        aria-hidden="true"
      >
        <span className={cn('h-5 w-5', iconColor)}>{icon}</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {value}
        </p>
      </div>

      {/* Trend indicator */}
      {trend && trend !== 'neutral' && (
        <div
          className={cn(
            'flex items-center self-center',
            trend === 'up'
              ? 'text-green-500 dark:text-green-400'
              : 'text-red-500 dark:text-red-400'
          )}
          aria-label={trend === 'up' ? 'Trending up' : 'Trending down'}
        >
          {trend === 'up' ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
        </div>
      )}
      {trend === 'neutral' && (
        <div
          className="flex items-center self-center text-gray-400"
          aria-label="Neutral"
        >
          <Minus size={16} />
        </div>
      )}
    </div>
  );
}

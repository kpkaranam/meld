import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday as isDateToday,
  format,
} from 'date-fns';
import { CalendarDayCell } from './CalendarDayCell';
import type { TaskRow } from '@/components/tasks/TaskItem';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  month: Date;
  tasksByDate: Map<string, TaskRow[]>;
  selectedDate: string | null;
  onSelectDate: (dateStr: string) => void;
}

export function CalendarGrid({
  month,
  tasksByDate,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div role="grid" aria-label={format(month, 'MMMM yyyy')} className="w-full">
      {/* Day-of-week headers */}
      <div role="row" className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            role="columnheader"
            aria-label={day}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const tasks = tasksByDate.get(dateStr) ?? [];

          return (
            <CalendarDayCell
              key={dateStr}
              date={day}
              tasks={tasks}
              isCurrentMonth={isSameMonth(day, month)}
              isToday={isDateToday(day)}
              isSelected={selectedDate === dateStr}
              onClick={() =>
                onSelectDate(selectedDate === dateStr ? '' : dateStr)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

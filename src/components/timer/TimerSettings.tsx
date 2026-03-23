import { useTimerStore } from '@/stores/timerStore';
import { cn } from '@/utils/cn';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  id: string;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'min',
  onChange,
  id,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">
          {value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full',
          'bg-gray-200 dark:bg-gray-700',
          'accent-indigo-600'
        )}
      />
    </div>
  );
}

export function TimerSettings() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    longBreakInterval,
    autoStart,
    setSettings,
  } = useTimerStore();

  return (
    <div className="flex flex-col gap-4 px-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Settings
      </p>

      <SliderRow
        id="timer-work"
        label="Work duration"
        value={workDuration}
        min={15}
        max={60}
        onChange={(v) => setSettings({ workDuration: v })}
      />

      <SliderRow
        id="timer-break"
        label="Short break"
        value={breakDuration}
        min={1}
        max={15}
        onChange={(v) => setSettings({ breakDuration: v })}
      />

      <SliderRow
        id="timer-long-break"
        label="Long break"
        value={longBreakDuration}
        min={5}
        max={30}
        onChange={(v) => setSettings({ longBreakDuration: v })}
      />

      <SliderRow
        id="timer-interval"
        label="Long break after"
        value={longBreakInterval}
        min={2}
        max={6}
        unit="sessions"
        onChange={(v) => setSettings({ longBreakInterval: v })}
      />

      {/* Auto-start toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="timer-autostart"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Auto-start next session
        </label>
        <button
          id="timer-autostart"
          type="button"
          role="switch"
          aria-checked={autoStart}
          onClick={() => setSettings({ autoStart: !autoStart })}
          className={cn(
            'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            autoStart ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
              autoStart ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Settings, SkipForward, RotateCcw, Play, Pause } from 'lucide-react';
import { useTimerStore } from '@/stores/timerStore';
import type { TimerMode } from '@/stores/timerStore';
import { cn } from '@/utils/cn';
import { TimerSettings } from './TimerSettings';
import { useTask } from '@/hooks/useTasks';

// --- Circular progress SVG ---

interface CircularProgressProps {
  progress: number; // 0–1
  mode: TimerMode;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({
  progress,
  mode,
  size = 160,
  strokeWidth = 8,
}: CircularProgressProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  const colorMap: Record<TimerMode, string> = {
    work: 'stroke-indigo-500',
    break: 'stroke-emerald-500',
    longBreak: 'stroke-amber-500',
  };

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-gray-200 dark:stroke-gray-700"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(
          colorMap[mode],
          'transition-all duration-1000 ease-linear'
        )}
      />
    </svg>
  );
}

// --- Active task label ---

function ActiveTaskLabel({ taskId }: { taskId: string }) {
  const { data: task } = useTask(taskId);
  if (!task) return null;
  return (
    <p
      className="max-w-[180px] truncate text-center text-xs text-gray-500 dark:text-gray-400"
      title={task.title}
    >
      {task.title}
    </p>
  );
}

// --- Session dots ---

function SessionDots({
  completed,
  interval,
}: {
  completed: number;
  interval: number;
}) {
  // Show dots for the current "lap" (0..interval-1)
  const position = completed % interval;
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`${position} of ${interval} sessions completed`}
    >
      {Array.from({ length: interval }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2 w-2 rounded-full',
            i < position ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
          )}
        />
      ))}
    </div>
  );
}

// --- Format helpers ---

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Focus',
  break: 'Short Break',
  longBreak: 'Long Break',
};

const MODE_BG: Record<TimerMode, string> = {
  work: 'bg-indigo-50 dark:bg-indigo-950/30',
  break: 'bg-emerald-50 dark:bg-emerald-950/30',
  longBreak: 'bg-amber-50 dark:bg-amber-950/30',
};

const MODE_TEXT: Record<TimerMode, string> = {
  work: 'text-indigo-600 dark:text-indigo-400',
  break: 'text-emerald-600 dark:text-emerald-400',
  longBreak: 'text-amber-600 dark:text-amber-400',
};

interface PomodoroTimerProps {
  onClose: () => void;
}

export function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [showSettings, setShowSettings] = useState(false);

  const {
    mode,
    status,
    timeLeft,
    totalTime,
    activeTaskId,
    sessionsCompleted,
    longBreakInterval,
    start,
    pause,
    resume,
    reset,
    skip,
  } = useTimerStore();

  const progress = totalTime > 0 ? timeLeft / totalTime : 1;

  // Update document title while running so users see the timer in their tab
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      const original = document.title;
      document.title = `${formatTime(timeLeft)} — ${MODE_LABELS[mode]} | Meld`;
      return () => {
        document.title = original;
      };
    }
  }, [timeLeft, mode, status]);

  function handlePrimaryAction() {
    if (status === 'idle') {
      start();
    } else if (status === 'running') {
      pause();
    } else {
      resume();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pomodoro focus timer"
      className={cn(
        'flex w-72 flex-col gap-4 rounded-2xl p-5 shadow-2xl ring-1 ring-black/5',
        'bg-white dark:bg-gray-900',
        'dark:ring-white/10'
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Focus Mode
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="Timer settings"
            aria-pressed={showSettings}
            className={cn(
              'rounded-md p-1.5 text-gray-400 transition-colors',
              'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              showSettings &&
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close timer panel"
            className={cn(
              'rounded-md p-1.5 text-gray-400 transition-colors',
              'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {showSettings ? (
        <TimerSettings />
      ) : (
        <>
          {/* Mode badge */}
          <div className="flex justify-center">
            <span
              className={cn(
                'rounded-full px-3 py-0.5 text-xs font-semibold',
                MODE_BG[mode],
                MODE_TEXT[mode]
              )}
            >
              {MODE_LABELS[mode]}
            </span>
          </div>

          {/* Circular progress + countdown */}
          <div className="relative flex items-center justify-center">
            <CircularProgress progress={progress} mode={mode} />
            <div className="absolute flex flex-col items-center">
              <span
                className="font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-50"
                aria-live="off"
                aria-atomic="true"
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Session dots */}
          <div className="flex justify-center">
            <SessionDots
              completed={sessionsCompleted}
              interval={longBreakInterval}
            />
          </div>

          {/* Active task */}
          {activeTaskId && (
            <div className="flex justify-center">
              <ActiveTaskLabel taskId={activeTaskId} />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {/* Reset */}
            <button
              type="button"
              onClick={reset}
              aria-label="Reset timer"
              className={cn(
                'rounded-lg p-2 text-gray-500 transition-colors',
                'hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              )}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Primary: Start / Pause / Resume */}
            <button
              type="button"
              onClick={handlePrimaryAction}
              aria-label={
                status === 'idle'
                  ? 'Start timer'
                  : status === 'running'
                    ? 'Pause timer'
                    : 'Resume timer'
              }
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                mode === 'work'
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'
                  : mode === 'break'
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
                    : 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400'
              )}
            >
              {status === 'running' ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="h-5 w-5 pl-0.5" aria-hidden="true" />
              )}
            </button>

            {/* Skip */}
            <button
              type="button"
              onClick={skip}
              aria-label="Skip to next session"
              className={cn(
                'rounded-lg p-2 text-gray-500 transition-colors',
                'hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
              )}
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

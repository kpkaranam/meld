import { useRef, useState, useEffect, useCallback } from 'react';
import { Timer } from 'lucide-react';
import { useTimerStore } from '@/stores/timerStore';
import type { TimerMode } from '@/stores/timerStore';
import { cn } from '@/utils/cn';
import { PomodoroTimer } from './PomodoroTimer';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const COLOR_MAP: Record<TimerMode, string> = {
  work: 'text-indigo-600 dark:text-indigo-400',
  break: 'text-emerald-600 dark:text-emerald-400',
  longBreak: 'text-amber-500 dark:text-amber-400',
};

const BG_MAP: Record<TimerMode, string> = {
  work: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70',
  break:
    'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70',
  longBreak:
    'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70',
};

/**
 * Compact timer button that lives in the header.
 * - Idle: shows a timer icon with a neutral style.
 * - Running/paused: shows the countdown in a color-coded pill.
 * - Clicking opens the floating PomodoroTimer panel.
 */
export function TimerWidget() {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { mode, status, timeLeft } = useTimerStore();
  const isActive = status === 'running' || status === 'paused';

  // Close the panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [panelOpen]);

  // Close panel on Escape
  useEffect(() => {
    if (!panelOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPanelOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [panelOpen]);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setPanelOpen((o) => !o)}
        aria-label={
          isActive
            ? `Pomodoro timer — ${formatTime(timeLeft)} remaining — click to open`
            : 'Open Pomodoro timer'
        }
        aria-expanded={panelOpen}
        aria-haspopup="dialog"
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          isActive
            ? cn(BG_MAP[mode], COLOR_MAP[mode])
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
        )}
      >
        <Timer
          className={cn(
            'h-5 w-5',
            isActive && status === 'running' && 'animate-pulse'
          )}
          aria-hidden="true"
        />
        {isActive && (
          <span className="font-mono text-xs font-semibold tabular-nums">
            {formatTime(timeLeft)}
          </span>
        )}
      </button>

      {/* Floating panel */}
      {panelOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2"
          // Keep panel keyboard-navigable without trapping
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              // Allow natural tab — panel closes on outside click
            }
          }}
        >
          <PomodoroTimer onClose={handleClose} />
        </div>
      )}
    </div>
  );
}

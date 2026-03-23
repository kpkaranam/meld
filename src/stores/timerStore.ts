import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playNotificationSound } from '@/utils/sounds';

export type TimerMode = 'work' | 'break' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  /** Seconds remaining in the current session. */
  timeLeft: number;
  /** Total seconds for the current mode — used to compute progress percentage. */
  totalTime: number;
  /** Task id linked to the current work session, if any. */
  activeTaskId: string | null;
  /** Number of completed work sessions since last reset. */
  sessionsCompleted: number;

  // --- Configurable durations (in minutes) ---
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  /** How many work sessions before a long break. */
  longBreakInterval: number;
  /** Whether the next session starts automatically when the current one ends. */
  autoStart: boolean;

  // --- Actions ---
  start: (taskId?: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setSettings: (
    settings: Partial<
      Pick<
        TimerState,
        | 'workDuration'
        | 'breakDuration'
        | 'longBreakDuration'
        | 'longBreakInterval'
        | 'autoStart'
      >
    >
  ) => void;
}

function sendBrowserNotification(mode: TimerMode) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  new Notification('Meld Timer', {
    body: mode === 'work' ? 'Time for a break!' : 'Back to work!',
    icon: '/icon.svg',
  });
}

function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

function nextMode(
  current: TimerMode,
  sessionsCompleted: number,
  longBreakInterval: number
): TimerMode {
  if (current === 'work') {
    // After completing a work session: check if long break is due
    const newCount = sessionsCompleted + 1;
    return newCount % longBreakInterval === 0 ? 'longBreak' : 'break';
  }
  // After any break: back to work
  return 'work';
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'work',
      status: 'idle',
      timeLeft: minutesToSeconds(25),
      totalTime: minutesToSeconds(25),
      activeTaskId: null,
      sessionsCompleted: 0,

      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStart: false,

      start(taskId?: string) {
        const state = get();
        const total = minutesToSeconds(state.workDuration);
        set({
          status: 'running',
          mode: 'work',
          timeLeft: total,
          totalTime: total,
          activeTaskId: taskId ?? state.activeTaskId,
          sessionsCompleted: 0,
        });

        // Request notification permission on first start
        if (
          typeof Notification !== 'undefined' &&
          Notification.permission === 'default'
        ) {
          Notification.requestPermission().catch(() => undefined);
        }
      },

      pause() {
        set({ status: 'paused' });
      },

      resume() {
        set({ status: 'running' });
      },

      reset() {
        const state = get();
        const total = minutesToSeconds(state.workDuration);
        set({
          status: 'idle',
          mode: 'work',
          timeLeft: total,
          totalTime: total,
          activeTaskId: null,
          sessionsCompleted: 0,
        });
      },

      skip() {
        const state = get();
        const completedSessions =
          state.mode === 'work'
            ? state.sessionsCompleted + 1
            : state.sessionsCompleted;
        const mode = nextMode(
          state.mode,
          state.sessionsCompleted,
          state.longBreakInterval
        );
        const durationMap: Record<TimerMode, number> = {
          work: minutesToSeconds(state.workDuration),
          break: minutesToSeconds(state.breakDuration),
          longBreak: minutesToSeconds(state.longBreakDuration),
        };
        const total = durationMap[mode];
        set({
          mode,
          timeLeft: total,
          totalTime: total,
          sessionsCompleted: completedSessions,
          status: state.autoStart ? 'running' : 'idle',
        });
      },

      tick() {
        const state = get();
        if (state.status !== 'running') return;

        if (state.timeLeft > 1) {
          set({ timeLeft: state.timeLeft - 1 });
          return;
        }

        // Timer hit zero — session complete
        playNotificationSound();
        sendBrowserNotification(state.mode);

        const completedSessions =
          state.mode === 'work'
            ? state.sessionsCompleted + 1
            : state.sessionsCompleted;

        const mode = nextMode(
          state.mode,
          state.sessionsCompleted,
          state.longBreakInterval
        );

        const durationMap: Record<TimerMode, number> = {
          work: minutesToSeconds(state.workDuration),
          break: minutesToSeconds(state.breakDuration),
          longBreak: minutesToSeconds(state.longBreakDuration),
        };
        const total = durationMap[mode];

        set({
          mode,
          timeLeft: total,
          totalTime: total,
          sessionsCompleted: completedSessions,
          status: state.autoStart ? 'running' : 'idle',
          // Keep the active task linked when transitioning back to work mode
          activeTaskId: mode === 'work' ? state.activeTaskId : null,
        });
      },

      setSettings(settings) {
        const state = get();
        const next = { ...state, ...settings };

        // Recalculate timeLeft only when the timer is idle and the work
        // duration changed, so the displayed time reflects the new setting
        // immediately without interrupting a running session.
        const idle = state.status === 'idle';
        const workChanged =
          settings.workDuration !== undefined &&
          settings.workDuration !== state.workDuration;

        set({
          ...settings,
          ...(idle && workChanged
            ? {
                timeLeft: minutesToSeconds(next.workDuration),
                totalTime: minutesToSeconds(next.workDuration),
              }
            : {}),
        });
      },
    }),
    {
      name: 'meld-timer',
      // Persist settings and session count but NOT the running interval state.
      // On reload we restore to idle so the user can decide to continue.
      partialize: (state) => ({
        workDuration: state.workDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        longBreakInterval: state.longBreakInterval,
        autoStart: state.autoStart,
        sessionsCompleted: state.sessionsCompleted,
        activeTaskId: state.activeTaskId,
      }),
    }
  )
);

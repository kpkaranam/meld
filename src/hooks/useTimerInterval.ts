import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/stores/timerStore';

/**
 * Registers a global setInterval that calls tick() once per second.
 * Mount this hook once at the app level (inside AppShell) so the interval
 * survives page navigation — the Zustand store keeps the state.
 */
export function useTimerInterval() {
  const tick = useTimerStore((s) => s.tick);
  const tickRef = useRef(tick);

  // Always call the latest tick without restarting the interval
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current();
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps — interval is created once and never restarted
}

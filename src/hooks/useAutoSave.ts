import { useEffect, useRef, useState, useCallback } from 'react';
import { AUTOSAVE_DELAY_MS } from '../utils/constants';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = AUTOSAVE_DELAY_MS,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<T>(data);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref current without triggering effect
  onSaveRef.current = onSave;

  const save = useCallback(async (dataToSave: T) => {
    try {
      setStatus('saving');
      await onSaveRef.current(dataToSave);
      lastSavedRef.current = dataToSave;
      setStatus('saved');
      // Reset to idle after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  }, []);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Don't save if data hasn't changed from last save
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Save immediately (for manual save triggers)
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save(data);
  }, [data, save]);

  return { status, saveNow };
}

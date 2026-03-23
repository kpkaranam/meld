import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

type SyncStatus = 'online' | 'offline';

/**
 * Small dot indicator showing the user's network connection status.
 * - Green dot: online / synced
 * - Red dot: offline
 *
 * Listens to window 'online' and 'offline' events so it updates in
 * real time without requiring a page reload.
 */
export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>(() =>
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );

  useEffect(() => {
    function handleOnline() {
      setStatus('online');
    }
    function handleOffline() {
      setStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const label = status === 'online' ? 'Synced' : 'Offline';

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={label}
      title={label}
      role="status"
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full shrink-0',
          status === 'online' && 'bg-emerald-500',
          status === 'offline' && 'bg-red-500'
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          <span className="text-gray-400">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500 dark:text-green-400">Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-red-500 dark:text-red-400">Save failed</span>
        </>
      )}
    </div>
  );
}

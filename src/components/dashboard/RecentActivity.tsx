import { useNavigate } from 'react-router-dom';
import { CheckSquare, FileText } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useStats';
import { cn } from '@/utils/cn';

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentActivity() {
  const { data: items, isLoading } = useRecentActivity();
  const navigate = useNavigate();

  function handleClick(item: { id: string; type: 'task' | 'note' }) {
    if (item.type === 'note') {
      navigate('/inbox');
    }
    // Tasks don't have a standalone route; navigate to inbox
    if (item.type === 'task') {
      navigate('/inbox');
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Recent Activity
        </h2>
      </div>

      {isLoading && (
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-2 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!items || items.length === 0) && (
        <div className="p-5 text-center text-sm text-gray-400 dark:text-gray-500">
          No recent activity
        </div>
      )}

      {!isLoading && items && items.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <button
                type="button"
                onClick={() => handleClick(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-3 text-left transition-colors',
                  'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                )}
              >
                {/* Icon */}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                    item.type === 'task'
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  )}
                  aria-hidden="true"
                >
                  {item.type === 'task' ? (
                    <CheckSquare size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {item.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {item.type === 'task' ? 'Completed' : 'Created'}{' '}
                    {relativeTime(item.date)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

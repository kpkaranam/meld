/**
 * GraphTooltip — Accessible tooltip / info card shown when a graph node is
 * selected (keyboard navigation fallback). The D3 canvas handles hover
 * tooltips directly via DOM manipulation; this component provides a static
 * card for screen-reader-friendly note details.
 */

import { formatDate } from '@/utils/dates';

interface GraphTooltipProps {
  title: string;
  connections: number;
  updatedAt: string;
  onClose: () => void;
}

export function GraphTooltip({
  title,
  connections,
  updatedAt,
  onClose,
}: GraphTooltipProps) {
  return (
    <div
      role="tooltip"
      className="absolute bottom-4 left-4 z-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3 max-w-xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {connections} connection{connections !== 1 ? 's' : ''}
          </p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Updated {formatDate(updatedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close note info"
          className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

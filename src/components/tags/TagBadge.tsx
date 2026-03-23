import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TagBadgeTag {
  name: string;
  color: string | null;
}

interface TagBadgeProps {
  tag: TagBadgeTag;
  onRemove?: () => void;
  className?: string;
}

/**
 * Determines whether black or white text gives better contrast.
 * Uses the WCAG relative luminance formula.
 */
function getContrastColor(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.179 ? '#111827' : '#f9fafb';
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

export function TagBadge({ tag, onRemove, className }: TagBadgeProps) {
  const hasColor = tag.color !== null && tag.color !== undefined;
  const isHex = hasColor && isHexColor(tag.color!);

  const inlineStyle = isHex
    ? {
        backgroundColor: tag.color!,
        color: getContrastColor(tag.color!),
      }
    : undefined;

  return (
    <span
      style={inlineStyle}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        !isHex &&
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        className
      )}
    >
      <span className="truncate max-w-[120px]">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove tag ${tag.name}`}
          className={cn(
            'ml-0.5 rounded-full p-0.5 transition-colors',
            isHex
              ? 'hover:bg-black/10'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          <X size={10} aria-hidden="true" strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

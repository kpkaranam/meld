import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

const DEFAULT_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  className,
}: ColorPickerProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="radiogroup"
      aria-label="Color picker"
    >
      {colors.map((color) => {
        const isSelected = value === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`Color ${color}`}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            className={cn(
              'relative h-8 w-8 rounded-full transition-transform focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-gray-900',
              isSelected ? 'scale-110 shadow-md' : 'hover:scale-105'
            )}
          >
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check
                  size={14}
                  className="text-white drop-shadow"
                  aria-hidden="true"
                  strokeWidth={3}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

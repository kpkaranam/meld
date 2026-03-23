import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

/**
 * Determines whether black or white text gives better contrast against a hex background.
 * Uses the WCAG relative luminance formula.
 */
function getContrastColor(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;

  // sRGB linearisation
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.179 ? '#111827' : '#f9fafb';
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

export function Badge({ children, color, className }: BadgeProps) {
  const isHex = color !== undefined && isHexColor(color);

  const inlineStyle = isHex
    ? { backgroundColor: color, color: getContrastColor(color) }
    : undefined;

  // When color is a Tailwind class name (not a hex), pass it directly as a className
  const colorClass = color !== undefined && !isHex ? color : undefined;

  return (
    <span
      style={inlineStyle}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        !isHex &&
          !colorClass &&
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

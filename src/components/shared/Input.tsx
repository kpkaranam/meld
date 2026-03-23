import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required ? true : undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors',
            'bg-white dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'dark:focus-visible:ring-offset-gray-950',
            error
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

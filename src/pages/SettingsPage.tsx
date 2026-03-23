import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { cn } from '../utils/cn';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  icon: React.ElementType;
  label: string;
  description: string;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    icon: Sun,
    label: 'Light',
    description: 'Always use light mode',
  },
  {
    value: 'dark',
    icon: Moon,
    label: 'Dark',
    description: 'Always use dark mode',
  },
  {
    value: 'system',
    icon: Monitor,
    label: 'System',
    description: 'Match your OS setting',
  },
];

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        App preferences and account settings.
      </p>

      {/* Theme section */}
      <section className="mt-8" aria-labelledby="theme-heading">
        <h2
          id="theme-heading"
          className="text-base font-semibold text-gray-900 dark:text-gray-100"
        >
          Appearance
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Choose how Meld looks to you. Your preference is synced across
          devices.
        </p>

        <div
          className="mt-4 grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-labelledby="theme-heading"
        >
          {themeOptions.map(({ value, icon: Icon, label, description }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTheme(value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  </span>
                )}

                <Icon
                  className={cn(
                    'h-6 w-6',
                    isSelected
                      ? 'text-indigo-500'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                  aria-hidden="true"
                />

                <span
                  className={cn(
                    'text-sm font-medium',
                    isSelected
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {label}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { cn } from '../../utils/cn';

const themeOptions = [
  { value: 'light' as const, icon: Sun, label: 'Light mode' },
  { value: 'dark' as const, icon: Moon, label: 'Dark mode' },
  { value: 'system' as const, icon: Monitor, label: 'System theme' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const currentIndex = themeOptions.findIndex((opt) => opt.value === theme);
    const nextIndex = (currentIndex + 1) % themeOptions.length;
    setTheme(themeOptions[nextIndex].value);
  };

  const currentOption =
    themeOptions.find((opt) => opt.value === theme) ?? themeOptions[0];
  const Icon = currentOption.icon;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        'dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'transition-colors'
      )}
      aria-label={currentOption.label}
      title={currentOption.label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

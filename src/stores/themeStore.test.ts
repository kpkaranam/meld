import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---------------------------------------------------------------------------
// The themeStore module registers a global matchMedia listener at module load
// time. We set up the matchMedia mock BEFORE importing the store so the
// module-level code picks up our mock.
// ---------------------------------------------------------------------------

function makeMatchMedia(prefersDark: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Start with a "light" system preference for the initial import
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: makeMatchMedia(false),
});

// Import AFTER matchMedia is defined
import { useThemeStore } from './themeStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setSystemPreference(prefersDark: boolean) {
  window.matchMedia = makeMatchMedia(prefersDark);
}

beforeEach(() => {
  // Reset store state to defaults between each test
  useThemeStore.setState({ theme: 'system', resolvedTheme: 'light' });
  // Clear any dark class left over from previous tests
  document.documentElement.classList.remove('dark');
  // Default system preference: light
  setSystemPreference(false);
});

describe('themeStore — initial state', () => {
  it('has "system" as the default theme', () => {
    expect(useThemeStore.getState().theme).toBe('system');
  });
});

describe('themeStore.setTheme', () => {
  it('sets theme to "dark" and resolvedTheme to "dark"', () => {
    useThemeStore.getState().setTheme('dark');
    const { theme, resolvedTheme } = useThemeStore.getState();
    expect(theme).toBe('dark');
    expect(resolvedTheme).toBe('dark');
  });

  it('sets theme to "light" and resolvedTheme to "light"', () => {
    useThemeStore.getState().setTheme('light');
    const { theme, resolvedTheme } = useThemeStore.getState();
    expect(theme).toBe('light');
    expect(resolvedTheme).toBe('light');
  });

  it('resolves "system" to "dark" when the OS prefers dark', () => {
    setSystemPreference(true);
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
  });

  it('resolves "system" to "light" when the OS prefers light', () => {
    setSystemPreference(false);
    useThemeStore.getState().setTheme('system');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });
});

describe('themeStore — DOM class management', () => {
  it('adds the "dark" class to documentElement when dark theme is set', () => {
    useThemeStore.getState().setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes the "dark" class from documentElement when light theme is set', () => {
    // Start in dark mode
    document.documentElement.classList.add('dark');
    useThemeStore.getState().setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

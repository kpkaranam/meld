import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useProfile } from './useProfile';
import { profileService } from '../services/profileService';
import { useAuthContext } from '../components/auth/AuthProvider';

export function useThemeSync() {
  const { user } = useAuthContext();
  const { data: profile } = useProfile();
  const { theme, setTheme } = useThemeStore();

  // Hydrate theme from profile on first load
  useEffect(() => {
    if (profile?.theme) {
      const profileTheme = profile.theme as 'light' | 'dark' | 'system';
      setTheme(profileTheme);
    }
  }, [profile?.theme, setTheme]);

  // Sync theme changes to Supabase (fire-and-forget)
  useEffect(() => {
    if (user?.id && profile) {
      // Only sync if different from what's in the DB
      if (theme !== profile.theme) {
        profileService.updateTheme(user.id, theme).catch(console.error);
      }
    }
  }, [theme, user?.id, profile]);
}

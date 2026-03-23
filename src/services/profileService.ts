import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const profileService = {
  async getProfile(userId: string): Promise<ProfileRow> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as ProfileRow;
  },

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'system') {
    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', userId);
    if (error) throw error;
  },
};

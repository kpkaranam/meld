/**
 * Auth service — single gateway for all Supabase authentication operations.
 *
 * This is the ONLY module that calls `supabase.auth.*`.
 * All other code (components, hooks, stores) must use this service instead
 * of importing the Supabase client directly.
 *
 * All functions are async and throw on error so callers can use try/catch.
 */

import { supabase } from '../lib/supabase';

export const authService = {
  /**
   * Register a new user with email and password.
   * Supabase sends a confirmation email when email confirmation is enabled.
   */
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user with email and password.
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Initiate Google OAuth sign-in.
   * Redirects the browser to Google, then back to /auth/callback.
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out the currently authenticated user and clear the local session.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send a password-reset email to the given address.
   * The link in the email redirects to /auth/reset-password.
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update the password for the currently authenticated user.
   * Call this after the user follows the reset-password link.
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  /**
   * Return the current session, or null if no user is signed in.
   */
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

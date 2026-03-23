import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module before importing anything that uses it.
// The lib/supabase module throws at import time if env vars are missing,
// so we mock the entire module to avoid that.
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

import { authService } from './authService';
import { supabase } from '../lib/supabase';

// Typed helpers so each test only has to supply the relevant shape
const mockAuth = supabase.auth as unknown as {
  signUp: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  resetPasswordForEmail: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService.signUpWithEmail', () => {
  it('calls supabase.auth.signUp with the provided email and password', async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });

    const result = await authService.signUpWithEmail('a@b.com', 'password123');

    expect(mockAuth.signUp).toHaveBeenCalledOnce();
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'password123',
    });
    expect(result).toEqual({ user: { id: 'u1' }, session: null });
  });

  it('throws the supabase error when sign-up fails', async () => {
    const supabaseError = new Error('Email already registered');
    mockAuth.signUp.mockResolvedValue({ data: null, error: supabaseError });

    await expect(
      authService.signUpWithEmail('existing@b.com', 'pass')
    ).rejects.toThrow('Email already registered');
  });
});

describe('authService.signInWithEmail', () => {
  it('calls signInWithPassword with the provided credentials', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u2' }, session: { access_token: 'tok' } },
      error: null,
    });

    const result = await authService.signInWithEmail('a@b.com', 'secret');

    expect(mockAuth.signInWithPassword).toHaveBeenCalledOnce();
    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret',
    });
    expect(result).toEqual({
      user: { id: 'u2' },
      session: { access_token: 'tok' },
    });
  });

  it('throws when credentials are invalid', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('Invalid login credentials'),
    });

    await expect(
      authService.signInWithEmail('wrong@b.com', 'bad')
    ).rejects.toThrow('Invalid login credentials');
  });
});

describe('authService.signInWithGoogle', () => {
  it('calls signInWithOAuth with provider google and a redirectTo URL', async () => {
    mockAuth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://accounts.google.com/...' },
      error: null,
    });

    await authService.signInWithGoogle();

    expect(mockAuth.signInWithOAuth).toHaveBeenCalledOnce();
    const callArgs = mockAuth.signInWithOAuth.mock.calls[0][0];
    expect(callArgs.provider).toBe('google');
    expect(callArgs.options?.redirectTo).toContain('/auth/callback');
  });

  it('throws when the OAuth call returns an error', async () => {
    mockAuth.signInWithOAuth.mockResolvedValue({
      data: null,
      error: new Error('OAuth provider error'),
    });

    await expect(authService.signInWithGoogle()).rejects.toThrow(
      'OAuth provider error'
    );
  });
});

describe('authService.signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });

    await authService.signOut();

    expect(mockAuth.signOut).toHaveBeenCalledOnce();
  });

  it('throws when signOut returns an error', async () => {
    mockAuth.signOut.mockResolvedValue({
      error: new Error('Sign out failed'),
    });

    await expect(authService.signOut()).rejects.toThrow('Sign out failed');
  });
});

describe('authService.resetPassword', () => {
  it('calls resetPasswordForEmail with correct email and redirectTo', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

    await authService.resetPassword('user@example.com');

    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledOnce();
    const [email, options] = mockAuth.resetPasswordForEmail.mock.calls[0];
    expect(email).toBe('user@example.com');
    expect(options?.redirectTo).toContain('/auth/reset-password');
  });
});

describe('authService.updatePassword', () => {
  it('calls updateUser with the new password', async () => {
    mockAuth.updateUser.mockResolvedValue({ data: {}, error: null });

    await authService.updatePassword('newSecurePass!1');

    expect(mockAuth.updateUser).toHaveBeenCalledOnce();
    expect(mockAuth.updateUser).toHaveBeenCalledWith({
      password: 'newSecurePass!1',
    });
  });
});

describe('authService.getSession', () => {
  it('returns the session object from supabase', async () => {
    const fakeSession = { access_token: 'abc', user: { id: 'u3' } };
    mockAuth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });

    const session = await authService.getSession();

    expect(session).toEqual(fakeSession);
  });

  it('returns null when there is no active session', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const session = await authService.getSession();

    expect(session).toBeNull();
  });

  it('throws when getSession returns an error', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('Session fetch failed'),
    });

    await expect(authService.getSession()).rejects.toThrow(
      'Session fetch failed'
    );
  });
});

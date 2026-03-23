import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock authService so no real Supabase calls are made
vi.mock('../../services/authService', () => ({
  authService: {
    signInWithEmail: vi.fn(),
    signInWithGoogle: vi.fn(),
  },
}));

import { LoginForm } from './LoginForm';
import { authService } from '../../services/authService';

const mockSignIn = authService.signInWithEmail as ReturnType<typeof vi.fn>;

function renderLoginForm() {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm — rendering', () => {
  it('renders an email input', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders a password input', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders a "Sign in" submit button', () => {
    renderLoginForm();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('renders a "Continue with Google" button', () => {
    renderLoginForm();
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
  });
});

describe('LoginForm — validation', () => {
  it('shows a validation error when the form is submitted with an empty email', async () => {
    renderLoginForm();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows a validation error when the form is submitted with an empty password', async () => {
    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });

  it('shows a validation error when the email format is invalid', async () => {
    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(
      await screen.findByText(/enter a valid email address/i)
    ).toBeInTheDocument();
  });
});

describe('LoginForm — submission', () => {
  it('calls authService.signInWithEmail with the entered credentials on valid submit', async () => {
    mockSignIn.mockResolvedValue({ user: { id: 'u1' }, session: {} });

    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledOnce();
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'secret123');
    });
  });

  it('displays an error message when sign in fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    renderLoginForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid login credentials/i)
    ).toBeInTheDocument();
  });
});

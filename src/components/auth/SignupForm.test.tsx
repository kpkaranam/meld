import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock authService so no real Supabase calls are made
vi.mock('../../services/authService', () => ({
  authService: {
    signUpWithEmail: vi.fn(),
  },
}));

import { SignupForm } from './SignupForm';
import { authService } from '../../services/authService';

const mockSignUp = authService.signUpWithEmail as ReturnType<typeof vi.fn>;

function renderSignupForm() {
  return render(
    <BrowserRouter>
      <SignupForm />
    </BrowserRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SignupForm — rendering', () => {
  it('renders email, password, and confirm-password inputs', () => {
    renderSignupForm();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders a "Create account" submit button', () => {
    renderSignupForm();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });
});

describe('SignupForm — validation', () => {
  it('shows an error when the password is shorter than 8 characters', async () => {
    renderSignupForm();
    await userEvent.type(screen.getByLabelText(/^email$/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'short');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'short');
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it('shows an error when the passwords do not match', async () => {
    renderSignupForm();
    await userEvent.type(screen.getByLabelText(/^email$/i), 'a@b.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Different1!'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });
});

describe('SignupForm — submission', () => {
  it('calls authService.signUpWithEmail with the correct credentials on valid submit', async () => {
    mockSignUp.mockResolvedValue({ user: { id: 'u1' }, session: null });

    renderSignupForm();
    await userEvent.type(
      screen.getByLabelText(/^email$/i),
      'newuser@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Secure123!');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Secure123!'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledOnce();
      expect(mockSignUp).toHaveBeenCalledWith(
        'newuser@example.com',
        'Secure123!'
      );
    });
  });

  it('shows a success message after successful signup', async () => {
    mockSignUp.mockResolvedValue({ user: { id: 'u1' }, session: null });

    renderSignupForm();
    await userEvent.type(
      screen.getByLabelText(/^email$/i),
      'newuser@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Secure123!');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Secure123!'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it('shows an error message when signup fails', async () => {
    mockSignUp.mockRejectedValue(new Error('Email already registered'));

    renderSignupForm();
    await userEvent.type(
      screen.getByLabelText(/^email$/i),
      'existing@example.com'
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'Password123!'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    );

    expect(
      await screen.findByText(/email already registered/i)
    ).toBeInTheDocument();
  });
});

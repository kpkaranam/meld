import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { authService } from '../../services/authService';

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Enter a valid email address';
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
}

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);
    if (emailErr || passwordErr || confirmErr) return;

    setIsLoading(true);
    try {
      await authService.signUpWithEmail(email, password);
      setSuccessMessage('Check your email to verify your account.');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Sign up failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
        <p className="text-sm font-medium text-green-800 dark:text-green-200">
          {successMessage}
        </p>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          Once verified, you can{' '}
          <Link
            to="/login"
            className="font-medium underline hover:text-green-600 dark:hover:text-green-400"
          >
            sign in to your account
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          required
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(validateEmail(e.target.value));
          }}
          error={emailError}
          placeholder="you@example.com"
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          required
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError)
              setPasswordError(validatePassword(e.target.value));
            if (confirmPasswordError && confirmPassword) {
              setConfirmPasswordError(
                validateConfirmPassword(e.target.value, confirmPassword)
              );
            }
          }}
          error={passwordError}
          helperText={!passwordError ? 'Minimum 8 characters' : undefined}
          placeholder="••••••••"
          disabled={isLoading}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          required
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmPasswordError) {
              setConfirmPasswordError(
                validateConfirmPassword(password, e.target.value)
              );
            }
          }}
          error={confirmPasswordError}
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {formError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

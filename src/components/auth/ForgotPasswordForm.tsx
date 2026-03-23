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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const emailErr = validateEmail(email);
    setEmailError(emailErr);
    if (emailErr) return;

    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccessMessage('Check your email for a reset link.');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            {successMessage}
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Check your inbox and follow the link to reset your password.
          </p>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(validateEmail(e.target.value));
          }}
          error={emailError}
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>

      {formError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Send reset link
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

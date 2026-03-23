import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { GoogleAuthButton } from './GoogleAuthButton';
import { authService } from '../../services/authService';

function validateEmail(email: string): string | undefined {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Enter a valid email address';
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
}

export function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    if (emailErr || passwordErr) return;

    setIsLoading(true);
    try {
      await authService.signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            required
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError)
                setPasswordError(validatePassword(e.target.value));
            }}
            error={passwordError}
            placeholder="••••••••"
            disabled={isLoading}
          />
          <div className="mt-1 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>
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
        Sign in
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            or continue with
          </span>
        </div>
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

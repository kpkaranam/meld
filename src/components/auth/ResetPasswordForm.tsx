import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { authService } from '../../services/authService';

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

export function ResetPasswordForm() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);
    if (passwordErr || confirmErr) return;

    setIsLoading(true);
    try {
      await authService.updatePassword(password);
      toast.success('Password updated');
      navigate('/login');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to update password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
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
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
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
        Update password
      </Button>
    </form>
  );
}

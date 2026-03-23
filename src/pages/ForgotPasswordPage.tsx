import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Meld
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Reset your password
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

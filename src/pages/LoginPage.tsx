import { LoginForm } from '../components/auth/LoginForm';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Sign In');
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Meld
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

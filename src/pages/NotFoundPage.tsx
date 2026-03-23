import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">
        404
      </h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Page not found
      </h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}

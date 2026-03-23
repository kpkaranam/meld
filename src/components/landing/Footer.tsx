import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-10 dark:border-gray-800 dark:bg-gray-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Branding */}
          <div className="text-center sm:text-left">
            <div className="text-base font-bold text-gray-900 dark:text-gray-100">
              Meld
            </div>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-600">
              Tasks and notes, unified.
            </p>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>

            <Link
              to="/login"
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              Sign Up
            </Link>

            <span
              aria-hidden="true"
              className="text-gray-300 dark:text-gray-700"
            >
              |
            </span>

            <a
              href="https://github.com/qlucent/fishi"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              Built with FISHI
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400 dark:border-gray-900 dark:text-gray-600">
          &copy; {new Date().getFullYear()} Meld. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

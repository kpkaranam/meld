import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare, FileText, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 pb-20 pt-20 dark:bg-gray-950 sm:px-8 lg:px-12">
      {/* Background gradient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-100 opacity-60 blur-3xl dark:bg-indigo-950 dark:opacity-30" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-100 opacity-60 blur-3xl dark:bg-purple-950 dark:opacity-30" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Zap className="h-3.5 w-3.5" />
              Productivity reimagined
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl">
              Tasks and notes,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                unified.
              </span>
            </h1>

            <p className="mt-6 text-xl leading-relaxed text-gray-600 dark:text-gray-400">
              The fast, clean productivity app that treats tasks and notes as
              equal citizens. Stop switching between apps &mdash; meld them
              together.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                to="/signup"
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200',
                  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-300',
                  'dark:shadow-indigo-950 dark:hover:shadow-indigo-900',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                )}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-700',
                  'transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md',
                  'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-indigo-700',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                )}
              >
                Sign In
              </Link>
            </div>

            {/* Social proof micro-badge */}
            <p className="mt-6 text-sm text-gray-400 dark:text-gray-600">
              Free to use &bull; No credit card required &bull; PWA installable
            </p>
          </div>

          {/* Hero visual — stylized app mockup */}
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Outer card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-indigo-100 dark:border-gray-800 dark:bg-gray-900 dark:shadow-indigo-950">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-auto text-xs text-gray-400">meld.app</span>
        </div>

        {/* App layout */}
        <div className="flex h-72">
          {/* Sidebar */}
          <div className="w-40 shrink-0 border-r border-gray-100 p-3 dark:border-gray-800">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Workspace
            </div>
            {[
              { label: 'Dashboard', active: false },
              { label: 'Today', active: true },
              { label: 'Inbox', active: false },
              { label: 'Calendar', active: false },
              { label: 'Graph', active: false },
            ].map(({ label, active }) => (
              <div
                key={label}
                className={cn(
                  'mb-1 rounded-lg px-2 py-1.5 text-xs',
                  active
                    ? 'bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-500'
                )}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Today
              </span>
              <span className="text-xs text-gray-400">3 tasks</span>
            </div>

            {/* Task items */}
            <div className="mb-4 space-y-2">
              {[
                { text: 'Review sprint notes', done: true },
                { text: 'Write weekly report', done: false },
                { text: 'Update project backlog', done: false },
              ].map(({ text, done }) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckSquare
                    className={cn(
                      'h-4 w-4 shrink-0',
                      done
                        ? 'text-indigo-500'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs',
                      done
                        ? 'text-gray-400 line-through dark:text-gray-600'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Note card */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Meeting Notes
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-indigo-200 dark:bg-indigo-800" />
                <div className="h-2 w-3/4 rounded-full bg-indigo-200 dark:bg-indigo-800" />
                <div className="h-2 w-1/2 rounded-full bg-indigo-100 dark:bg-indigo-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating accent card */}
      <div className="absolute -right-4 -top-4 hidden rounded-xl border border-purple-200 bg-white p-3 shadow-lg dark:border-purple-900 dark:bg-gray-900 sm:block">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Task done!
            </div>
            <div className="text-xs text-gray-400">+1 streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

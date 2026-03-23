import { Link } from 'react-router-dom';
import {
  CheckSquare,
  FileText,
  FolderOpen,
  Search,
  Calendar,
  Network,
  Timer,
  TrendingUp,
  Moon,
  Inbox,
  Layers,
  Focus,
  ArrowRight,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { HeroSection } from '../components/landing/HeroSection';
import { FeatureCard } from '../components/landing/FeatureCard';
import { Footer } from '../components/landing/Footer';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { cn } from '../utils/cn';

// ---------- Animated section wrapper ----------

function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { setRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------- Features data ----------

const features = [
  {
    icon: <CheckSquare className="h-5 w-5" />,
    title: 'Tasks & Notes United',
    description:
      'First-class tasks and rich notes live side-by-side. Link them, reference them, build context without friction.',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Rich Text Editor',
    description:
      'Bold, italic, headings, bullet lists, checklists, and [[backlinks]] — everything a knowledge worker needs.',
  },
  {
    icon: <FolderOpen className="h-5 w-5" />,
    title: 'Projects & Tags',
    description:
      'Group work into projects, slice it with tags. Every view filters instantly with zero configuration.',
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: 'Full-Text Search',
    description:
      'Find any task or note in milliseconds. Hit Ctrl+K for the command palette from anywhere in the app.',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Calendar View',
    description:
      'See your schedule at a glance. Drag tasks to reschedule. Daily, weekly, and monthly layouts included.',
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: 'Knowledge Graph',
    description:
      'Visualize the web of connections between your notes. Discover patterns you never knew existed.',
  },
  {
    icon: <Timer className="h-5 w-5" />,
    title: 'Pomodoro Timer',
    description:
      'Built-in focus sessions with customizable work/break intervals. Stay in flow without a separate app.',
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: 'Habit Tracking',
    description:
      'Build streaks, track progress, and visualize momentum. Habits and tasks in one place.',
  },
  {
    icon: <Moon className="h-5 w-5" />,
    title: 'Dark Mode',
    description:
      'Easy on the eyes at any hour. Synced automatically across all your devices and sessions.',
  },
];

// ---------- How It Works data ----------

const steps = [
  {
    number: '01',
    icon: <Inbox className="h-6 w-6" />,
    title: 'Capture',
    description:
      'Quick-add tasks and notes in seconds from any page. Nothing gets lost — everything lands in Inbox first.',
  },
  {
    number: '02',
    icon: <Layers className="h-6 w-6" />,
    title: 'Organize',
    description:
      'Assign to projects, add tags, link notes with [[backlinks]]. Build a structure that matches how you think.',
  },
  {
    number: '03',
    icon: <Focus className="h-6 w-6" />,
    title: 'Focus',
    description:
      'Switch on the Pomodoro timer, open Today view, and work through your list without distractions.',
  },
];

// ---------- Page ----------

export default function LandingPage() {
  useDocumentTitle('Meld — Tasks and notes, unified');

  const { setRef: setFeaturesRef, isVisible: featuresVisible } =
    useIntersectionObserver({ threshold: 0.05 });

  const { setRef: setStepsRef, isVisible: stepsVisible } =
    useIntersectionObserver({ threshold: 0.1 });

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-900 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
          <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            Meld
          </span>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 text-sm text-gray-500 sm:flex dark:text-gray-400"
          >
            <a
              href="#features"
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
            >
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 sm:block"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Features ── */}
      <section
        id="features"
        className="bg-gray-50 px-6 py-24 dark:bg-gray-900/50 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div
            ref={setFeaturesRef}
            className={cn(
              'mb-14 text-center transition-all duration-700',
              featuresVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            )}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              Everything you need.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Nothing you don&apos;t.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              25+ features built for people who take their work seriously.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={Math.floor(index / 3) * 100 + (index % 3) * 60}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeInSection className="mb-14 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Three simple steps from chaos to clarity.
            </p>
          </FadeInSection>

          <div ref={setStepsRef} className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                style={{ transitionDelay: `${index * 120}ms` }}
                className={cn(
                  'relative text-center transition-all duration-700',
                  stepsVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                )}
              >
                {/* Connector line (between steps) */}
                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[calc(50%+4rem)] top-8 hidden h-0.5 w-[calc(100%-8rem)] bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 sm:block"
                  />
                )}

                {/* Step number */}
                <div className="relative mb-4 inline-flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
                    <span className="text-white">{step.icon}</span>
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 shadow-md ring-1 ring-indigo-100 dark:bg-gray-900 dark:text-indigo-400 dark:ring-indigo-900">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {step.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Tech Stack ── */}
      <section className="bg-gray-50 px-6 py-16 dark:bg-gray-900/50 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeInSection className="text-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Under the hood
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                'React 18',
                'TypeScript',
                'Supabase',
                'Tailwind CSS',
                'TanStack Query',
                'Vite',
                'PWA',
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-center">
              {[
                { stat: '25+', label: 'Features' },
                { stat: '144+', label: 'Tests' },
                { stat: 'PWA', label: 'Installable' },
                { stat: '100%', label: 'TypeScript' },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
                    {stat}
                  </div>
                  <div className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <FadeInSection>
            <h2 className="text-4xl font-extrabold text-white">
              Ready to get productive?
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Join Meld today. Free forever, no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-400 bg-transparent px-7 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sign In
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

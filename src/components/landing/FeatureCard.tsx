import { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const { setRef, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={setRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-500 dark:border-gray-800 dark:bg-gray-900',
        'hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-950',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

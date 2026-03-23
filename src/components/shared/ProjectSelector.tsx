import { useState, useRef, useEffect, ReactNode } from 'react';
import { Check, Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSelectorProps {
  currentProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  /** The button/element that opens the dropdown. */
  trigger: ReactNode;
}

export function ProjectSelector({
  currentProjectId,
  onSelect,
  trigger,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: projects = [] } = useProjects();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  function handleSelect(projectId: string | null) {
    onSelect(projectId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger — wrap in a span to capture click */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select project"
        className="inline-flex"
      >
        {trigger}
      </span>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Projects"
          className={cn(
            'absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800',
            'max-h-60 overflow-y-auto'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Inbox option */}
          <button
            type="button"
            role="option"
            aria-selected={currentProjectId === null}
            onClick={() => handleSelect(null)}
            className={cn(
              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
              currentProjectId === null
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
            )}
          >
            <Inbox
              size={14}
              className="shrink-0 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
            <span className="flex-1 truncate">Inbox (no project)</span>
            {currentProjectId === null && (
              <Check
                size={14}
                className="shrink-0 text-indigo-500"
                aria-hidden="true"
              />
            )}
          </button>

          {/* Divider */}
          {projects.length > 0 && (
            <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
          )}

          {/* Project options */}
          {projects.map((project) => {
            const isSelected = currentProjectId === project.id;
            return (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(project.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                )}
              >
                {/* Color dot */}
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{project.name}</span>
                {isSelected && (
                  <Check
                    size={14}
                    className="shrink-0 text-indigo-500"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}

          {/* Empty state */}
          {projects.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-600">
              No projects yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}

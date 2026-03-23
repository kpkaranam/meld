import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MoreHorizontal, Plus, Pencil, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ProjectListItem {
  id: string;
  name: string;
  color: string;
  is_archived: boolean;
}

interface ProjectListProps {
  projects: ProjectListItem[];
  onCreateProject: () => void;
  onEditProject?: (project: ProjectListItem) => void;
  onArchiveProject?: (project: ProjectListItem) => void;
  onDeleteProject?: (project: ProjectListItem) => void;
  collapsed?: boolean;
}

interface KebabMenuProps {
  project: ProjectListItem;
  onEdit?: (project: ProjectListItem) => void;
  onArchive?: (project: ProjectListItem) => void;
  onDelete?: (project: ProjectListItem) => void;
}

function KebabMenu({ project, onEdit, onArchive, onDelete }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Options for ${project.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={cn(
          'rounded p-0.5 text-gray-400 opacity-0 transition-opacity',
          'group-hover:opacity-100 focus-visible:opacity-100',
          'hover:bg-gray-200 hover:text-gray-600',
          'dark:hover:bg-gray-700 dark:hover:text-gray-300',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500',
          open && 'opacity-100'
        )}
      >
        <MoreHorizontal size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`${project.name} options`}
          className={cn(
            'absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-gray-200 bg-white shadow-lg',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          {onEdit && (
            <button
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onEdit(project);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700',
                'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                'first:rounded-t-lg'
              )}
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
          )}
          {onArchive && (
            <button
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onArchive(project);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700',
                'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              <Archive size={14} aria-hidden="true" />
              Archive
            </button>
          )}
          {onDelete && (
            <button
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                onDelete(project);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600',
                'hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20',
                'last:rounded-b-lg'
              )}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ProjectList({
  projects,
  onCreateProject,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  collapsed = false,
}: ProjectListProps) {
  const active = projects.filter((p) => !p.is_archived);

  if (collapsed) {
    return (
      <div className="flex flex-col gap-0.5">
        {active.map((project) => (
          <NavLink
            key={project.id}
            to={`/projects/${project.id}`}
            aria-label={project.name}
            title={project.name}
            className={({ isActive }) =>
              cn(
                'flex justify-center rounded-md px-2 py-2 transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950'
                  : 'text-gray-700 dark:text-gray-300'
              )
            }
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onCreateProject}
          aria-label="New project"
          title="New project"
          className={cn(
            'flex justify-center rounded-md px-2 py-2 text-gray-400 transition-colors',
            'hover:bg-gray-100 hover:text-gray-600',
            'dark:hover:bg-gray-800 dark:hover:text-gray-300'
          )}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {active.length === 0 && (
        <p className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500">
          No projects yet
        </p>
      )}
      {active.map((project) => (
        <NavLink
          key={project.id}
          to={`/projects/${project.id}`}
          className={({ isActive }) =>
            cn(
              'group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              isActive
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                : 'text-gray-700 dark:text-gray-300'
            )
          }
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          />
          <span className="flex-1 truncate">{project.name}</span>
          {(onEditProject || onArchiveProject || onDeleteProject) && (
            <KebabMenu
              project={project}
              onEdit={onEditProject}
              onArchive={onArchiveProject}
              onDelete={onDeleteProject}
            />
          )}
        </NavLink>
      ))}

      {/* New Project button */}
      <button
        type="button"
        onClick={onCreateProject}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
          'dark:hover:bg-gray-800 dark:hover:text-gray-300'
        )}
      >
        <Plus size={14} aria-hidden="true" />
        <span>New project</span>
      </button>
    </div>
  );
}

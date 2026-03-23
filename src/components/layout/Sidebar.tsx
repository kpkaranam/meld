import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Network,
  Flame,
  Settings,
  ChevronLeft,
  ChevronRight,
  Tag,
  LayoutDashboard,
} from 'lucide-react';
import { useOverdueCount } from '@/hooks/useStats';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { useTags } from '@/hooks/useTags';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { ConfirmDialog } from '@/components/shared';
import type { ProjectListItem } from '@/components/projects/ProjectList';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  /** Optional numeric badge shown as a red pill (e.g. overdue count). Hidden when 0. */
  badge?: number;
}

function NavItem({ to, icon, label, collapsed, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
            : 'text-gray-700 dark:text-gray-300',
          collapsed && 'justify-center px-2'
        )
      }
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate flex-1">{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span
          className="ml-auto shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none"
          aria-label={`${badge} overdue`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}

interface SectionHeaderProps {
  label: string;
  collapsed: boolean;
}

function SectionHeader({ label, collapsed }: SectionHeaderProps) {
  if (collapsed) {
    return (
      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
    );
  }
  return (
    <div className="px-3 py-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
}

interface SidebarProps {
  /**
   * When true, the sidebar is rendered as a flex container even on mobile.
   * Used by MobileSidebarOverlay to show the sidebar inside the slide-over panel.
   */
  forceShow?: boolean;
}

export function Sidebar({ forceShow = false }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const collapsed = !sidebarOpen;
  const navigate = useNavigate();

  const { data: overdueCount } = useOverdueCount();

  const { data: rawProjects } = useProjects();
  const { data: rawTags } = useTags();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const projects: ProjectListItem[] = (rawProjects ?? []).map(
    (p: {
      id: string;
      name: string;
      color: string;
      is_archived?: boolean;
    }) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      is_archived: p.is_archived ?? false,
    })
  );
  const tags = (rawTags ?? []) as unknown as Array<{
    id: string;
    name: string;
    color: string | null;
  }>;

  // Project form state
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectListItem | null>(
    null
  );
  const [deletingProject, setDeletingProject] =
    useState<ProjectListItem | null>(null);

  function handleCreateProject() {
    setEditingProject(null);
    setShowProjectForm(true);
  }

  function handleEditProject(project: ProjectListItem) {
    setEditingProject(project);
    setShowProjectForm(true);
  }

  function handleArchiveProject(project: ProjectListItem) {
    updateProject.mutate({ id: project.id, input: { isArchived: true } });
  }

  function handleDeleteProject(project: ProjectListItem) {
    setDeletingProject(project);
  }

  function handleSaveProject(data: { name: string; color: string }) {
    if (editingProject) {
      updateProject.mutate({
        id: editingProject.id,
        input: { name: data.name, color: data.color },
      });
    } else {
      createProject.mutate({ name: data.name, color: data.color });
    }
    setShowProjectForm(false);
    setEditingProject(null);
  }

  function handleConfirmDelete() {
    if (deletingProject) {
      deleteProject.mutate(deletingProject.id);
    }
    navigate('/inbox');
    setDeletingProject(null);
  }

  return (
    <>
      <aside
        className={cn(
          'flex-col shrink-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200',
          // On mobile, hide the desktop sidebar unless forceShow is set (used by the overlay)
          forceShow ? 'flex w-full border-r-0' : 'hidden md:flex',
          !forceShow && (collapsed ? 'w-14' : 'w-60')
        )}
        aria-label="Main navigation"
      >
        {/* App name / logo area */}
        <div
          className={cn(
            'flex items-center h-14 px-3 border-b border-gray-200 dark:border-gray-800',
            collapsed ? 'justify-center' : 'gap-2'
          )}
        >
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Meld
            </span>
          )}
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavItem
            to="/inbox"
            icon={<Inbox size={18} />}
            label="Inbox"
            collapsed={collapsed}
          />
          <NavItem
            to="/today"
            icon={<Calendar size={18} />}
            label="Today"
            collapsed={collapsed}
            badge={overdueCount}
          />
          <NavItem
            to="/calendar"
            icon={<CalendarDays size={18} />}
            label="Calendar"
            collapsed={collapsed}
          />
          <NavItem
            to="/graph"
            icon={<Network size={18} />}
            label="Graph"
            collapsed={collapsed}
          />
          <NavItem
            to="/habits"
            icon={<Flame size={18} />}
            label="Habits"
            collapsed={collapsed}
          />

          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

          {/* Projects section */}
          <SectionHeader label="Projects" collapsed={collapsed} />
          <ProjectList
            projects={projects}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onArchiveProject={handleArchiveProject}
            onDeleteProject={handleDeleteProject}
            collapsed={collapsed}
          />

          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

          {/* Tags section */}
          <SectionHeader label="Tags" collapsed={collapsed} />
          {tags.length === 0 && !collapsed && (
            <p className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500">
              No tags yet
            </p>
          )}
          {tags.map((tag) => (
            <NavLink
              key={tag.id}
              to={`/tags/${tag.id}`}
              title={collapsed ? tag.name : undefined}
              aria-label={collapsed ? tag.name : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              {tag.color ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden="true"
                />
              ) : (
                <Tag size={14} className="shrink-0" aria-hidden="true" />
              )}
              {!collapsed && <span className="truncate">{tag.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <NavItem
            to="/settings"
            icon={<Settings size={18} />}
            label="Settings"
            collapsed={collapsed}
          />

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 text-sm text-gray-500 dark:text-gray-400',
              'min-h-[44px] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              collapsed && 'justify-center px-2'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Project create/edit form (rendered outside aside to avoid z-index clipping) */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        title="Delete project"
        message={`Permanently delete "${deletingProject?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

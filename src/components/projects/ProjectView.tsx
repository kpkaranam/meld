import { useState } from 'react';
import { ArrowLeft, Pencil, Archive, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCreateNote } from '@/hooks/useNotes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { NoteList } from '@/components/notes/NoteList';
import { NoteDetail } from '@/components/notes/NoteDetail';
import { Button, ConfirmDialog, LoadingSpinner } from '@/components/shared';
import { ProjectForm } from './ProjectForm';

// Temporary - will be replaced when hooks are merged
import { useProjects } from '@/hooks/useProjects';

type ActiveTab = 'tasks' | 'notes';

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const { data: projects, isLoading } = useProjects() as {
    data:
      | Array<{ id: string; name: string; color: string; isArchived: boolean }>
      | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const createNote = useCreateNote();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const project = projects?.find((p) => p.id === projectId) ?? null;

  async function handleCreateNote() {
    try {
      const note = await createNote.mutateAsync({
        title: 'Untitled Note',
        projectId,
      });
      setSelectedNoteId(note.id);
    } catch {
      // error handled by hook's onError toast
    }
  }

  function handleCloseDetail() {
    setSelectedTaskId(null);
    setSelectedNoteId(null);
  }

  const hasDetail =
    (activeTab === 'tasks' && selectedTaskId) ||
    (activeTab === 'notes' && selectedNoteId);

  function renderDetailContent() {
    if (activeTab === 'tasks' && selectedTaskId) {
      return <TaskDetail taskId={selectedTaskId} onClose={handleCloseDetail} />;
    }
    if (activeTab === 'notes' && selectedNoteId) {
      return (
        <NoteDetail
          noteId={selectedNoteId}
          onClose={handleCloseDetail}
          onDelete={handleCloseDetail}
        />
      );
    }
    return (
      <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
        <p className="text-sm">Select a task or note to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3 min-w-0">
          {project && (
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
              aria-hidden="true"
            />
          )}
          <h1 className="text-xl font-semibold text-gray-900 truncate dark:text-gray-100">
            {project?.name ?? 'Project'}
          </h1>
          {project?.isArchived && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Archived
            </span>
          )}
        </div>

        {project && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditForm(true)}
              aria-label="Edit project"
              title="Edit project"
            >
              <Pencil size={15} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchiveConfirm(true)}
              aria-label="Archive project"
              title="Archive project"
            >
              <Archive size={15} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Archive</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete project"
              title="Delete project"
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <Trash2 size={15} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
            </Button>
          </div>
        )}
      </header>

      {/* Tabs + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: list */}
        <div
          className={cn(
            'flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden',
            'w-full md:w-1/2 lg:w-2/5',
            hasDetail && !isDesktop ? 'hidden' : 'flex'
          )}
        >
          {/* Tab switcher */}
          <div className="flex shrink-0 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                activeTab === 'tasks'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                activeTab === 'notes'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              Notes
            </button>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'tasks' && (
              <TaskList
                projectId={projectId}
                onSelectTask={setSelectedTaskId}
              />
            )}
            {activeTab === 'notes' && (
              <NoteList
                projectId={projectId}
                onSelectNote={setSelectedNoteId}
                activeNoteId={selectedNoteId}
                onCreateNote={handleCreateNote}
              />
            )}
          </div>
        </div>

        {/* Mobile: full-screen detail overlay */}
        {!isDesktop && hasDetail && (
          <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 flex flex-col overflow-hidden">
            {/* Back bar */}
            <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-gray-950 shrink-0">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="Back to list"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {activeTab === 'tasks' ? 'Task Details' : 'Note'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderDetailContent()}
            </div>
          </div>
        )}

        {/* Desktop: right panel */}
        {isDesktop && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderDetailContent()}
          </div>
        )}
      </div>

      {/* Edit project form */}
      {project && (
        <ProjectForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSave={(_data) => {
            // Will be wired to useUpdateProject when hooks are merged
            setShowEditForm(false);
          }}
          project={project}
        />
      )}

      {/* Archive confirm */}
      <ConfirmDialog
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={() => {
          // Will be wired to useUpdateProject when hooks are merged
          setShowArchiveConfirm(false);
        }}
        title="Archive project"
        message={`Archive "${project?.name}"? You can unarchive it later from settings.`}
        confirmLabel="Archive"
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          // Will be wired to useDeleteProject when hooks are merged
          setShowDeleteConfirm(false);
        }}
        title="Delete project"
        message={`Permanently delete "${project?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

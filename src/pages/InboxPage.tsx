import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCreateNote } from '@/hooks/useNotes';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { NoteList } from '@/components/notes/NoteList';
import { NoteDetail } from '@/components/notes/NoteDetail';

type ActiveTab = 'tasks' | 'notes';

export default function InboxPage() {
  useDocumentTitle('Inbox');
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const createNote = useCreateNote();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  async function handleCreateNote() {
    try {
      const note = await createNote.mutateAsync({
        title: 'Untitled Note',
        projectId: null,
      });
      setSelectedNoteId(note.id);
    } catch {
      // error already handled by the hook's onError toast
    }
  }

  function handleSelectTask(taskId: string) {
    setSelectedTaskId(taskId);
  }

  function handleSelectNote(noteId: string) {
    setSelectedNoteId(noteId);
  }

  const hasDetail =
    (activeTab === 'tasks' && selectedTaskId) ||
    (activeTab === 'notes' && selectedNoteId);

  // Determine which detail component to render (shared between overlay and desktop panel)
  function renderDetailContent() {
    if (activeTab === 'tasks' && selectedTaskId) {
      return (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      );
    }
    if (activeTab === 'notes' && selectedNoteId) {
      return (
        <NoteDetail
          noteId={selectedNoteId}
          onClose={() => setSelectedNoteId(null)}
          onDelete={() => setSelectedNoteId(null)}
        />
      );
    }
    return (
      <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
        <p className="text-sm">Select a task or note to view details</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: list */}
      <div
        className={cn(
          'flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden',
          'w-full md:w-1/2 lg:w-2/5',
          // On mobile, hide list when a detail is open
          hasDetail && !isDesktop ? 'hidden' : 'flex'
        )}
      >
        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
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
            <TaskList projectId={null} onSelectTask={handleSelectTask} />
          )}
          {activeTab === 'notes' && (
            <NoteList
              projectId={null}
              onSelectNote={handleSelectNote}
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
              onClick={() => {
                setSelectedTaskId(null);
                setSelectedNoteId(null);
              }}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Back to list"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {activeTab === 'tasks' ? 'Task Details' : 'Note'}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">{renderDetailContent()}</div>
        </div>
      )}

      {/* Desktop: right panel */}
      {isDesktop && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderDetailContent()}
        </div>
      )}
    </div>
  );
}

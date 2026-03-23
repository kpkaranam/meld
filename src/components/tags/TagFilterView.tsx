import { useState } from 'react';
import { Tag } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useCreateNote } from '@/hooks/useNotes';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { NoteList } from '@/components/notes/NoteList';
import { NoteDetail } from '@/components/notes/NoteDetail';
import { LoadingSpinner } from '@/components/shared';
import { TagBadge } from './TagBadge';

// Temporary - will be replaced when hooks are merged
import { useTags } from '@/hooks/useTags';

type ActiveTab = 'tasks' | 'notes';

interface TagFilterViewProps {
  tagId: string;
}

export function TagFilterView({ tagId }: TagFilterViewProps) {
  const { data: tags, isLoading } = useTags() as {
    data: Array<{ id: string; name: string; color: string | null }> | undefined;
    isLoading: boolean;
    error: unknown;
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const createNote = useCreateNote();

  const tag = tags?.find((t) => t.id === tagId) ?? null;

  async function handleCreateNote() {
    try {
      const note = await createNote.mutateAsync({
        title: 'Untitled Note',
        projectId: null,
      });
      setSelectedNoteId(note.id);
    } catch {
      // error handled by hook's onError toast
    }
  }

  const hasDetail =
    (activeTab === 'tasks' && selectedTaskId) ||
    (activeTab === 'notes' && selectedNoteId);

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
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <Tag
          size={18}
          className="shrink-0 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
        {tag ? (
          <TagBadge tag={tag} className="text-sm px-3 py-1" />
        ) : (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Tag
          </h1>
        )}
        {tag && (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {tag.name}
          </h1>
        )}
      </header>

      {/* Tabs + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: list */}
        <div
          className={cn(
            'flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden',
            'w-full md:w-1/2 lg:w-2/5',
            hasDetail ? 'hidden md:flex' : 'flex'
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
              <TaskList projectId={null} onSelectTask={setSelectedTaskId} />
            )}
            {activeTab === 'notes' && (
              <NoteList
                projectId={null}
                onSelectNote={setSelectedNoteId}
                activeNoteId={selectedNoteId}
                onCreateNote={handleCreateNote}
              />
            )}
          </div>
        </div>

        {/* Right panel: detail */}
        <div
          className={cn(
            'flex-1 overflow-hidden',
            hasDetail ? 'flex flex-col' : 'hidden md:flex md:flex-col'
          )}
        >
          {activeTab === 'tasks' && selectedTaskId ? (
            <TaskDetail
              taskId={selectedTaskId}
              onClose={() => setSelectedTaskId(null)}
            />
          ) : activeTab === 'notes' && selectedNoteId ? (
            <NoteDetail
              noteId={selectedNoteId}
              onClose={() => setSelectedNoteId(null)}
              onDelete={() => setSelectedNoteId(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600">
              <p className="text-sm">Select a task or note to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

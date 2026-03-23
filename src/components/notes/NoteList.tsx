import { FileText, Plus } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Button, EmptyState, LoadingSpinner } from '@/components/shared';
import { NoteItem } from './NoteItem';

interface NoteListProps {
  projectId?: string | null;
  onSelectNote: (noteId: string) => void;
  activeNoteId?: string | null;
  onCreateNote: () => void;
}

export function NoteList({
  projectId,
  onSelectNote,
  activeNoteId,
  onCreateNote,
}: NoteListProps) {
  const { data: notes, isLoading, isError, error } = useNotes(projectId);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateNote}
          aria-label="New note"
          className="gap-1 px-2"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">New</span>
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner
              size="md"
              className="text-gray-400 dark:text-gray-600"
            />
          </div>
        )}

        {isError && (
          <div className="px-3 py-4 text-center text-sm text-red-500 dark:text-red-400">
            {error instanceof Error ? error.message : 'Failed to load notes.'}
          </div>
        )}

        {!isLoading && !isError && notes && notes.length === 0 && (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No notes yet"
            description="Create a note to capture your thoughts."
            action={{ label: 'New Note', onClick: onCreateNote }}
          />
        )}

        {!isLoading && !isError && notes && notes.length > 0 && (
          <ul
            className="flex flex-col gap-1.5 p-2"
            role="list"
            aria-label="Notes"
          >
            {notes.map((note) => (
              <li key={note.id}>
                <NoteItem
                  note={note}
                  onSelect={onSelectNote}
                  isActive={note.id === activeNoteId}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

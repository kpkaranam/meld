import { useState } from 'react';
import { Pin, Trash2, FolderInput } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatRelativeDate } from '@/utils/dates';
import {
  useDeleteNote,
  useToggleNotePin,
  useUpdateNote,
} from '@/hooks/useNotes';
import { ConfirmDialog } from '@/components/shared';
import { ProjectSelector } from '@/components/shared/ProjectSelector';

interface NoteItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note: any; // Supabase return type
  onSelect: (noteId: string) => void;
  isActive?: boolean;
}

export function NoteItem({ note, onSelect, isActive = false }: NoteItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteNote = useDeleteNote();
  const togglePin = useToggleNotePin();
  const updateNote = useUpdateNote();

  const preview = note.content_plain
    ? note.content_plain.slice(0, 100) +
      (note.content_plain.length > 100 ? '…' : '')
    : '';

  function handlePinToggle(e: React.MouseEvent) {
    e.stopPropagation();
    togglePin.mutate({ id: note.id, currentPinned: note.is_pinned });
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function handleConfirmDelete() {
    deleteNote.mutate(note.id);
  }

  function handleMoveToProject(projectId: string | null) {
    updateNote.mutate({
      id: note.id,
      input: { projectId },
    });
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={`Note: ${note.title}`}
        onClick={() => onSelect(note.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(note.id);
          }
        }}
        className={cn(
          'group relative flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-gray-950',
          // Base
          'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
          'dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800',
          // Active
          isActive && [
            'border-indigo-400 bg-indigo-50',
            'dark:border-indigo-500 dark:bg-indigo-950/40',
          ],
          // Pinned subtle tint (when not active)
          !isActive &&
            note.is_pinned && [
              'border-amber-200 bg-amber-50/60',
              'dark:border-amber-800/50 dark:bg-amber-950/20',
            ]
        )}
      >
        {/* Header row: pin icon + title + hover actions */}
        <div className="flex items-center gap-1.5">
          {note.is_pinned && (
            <Pin
              className="h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400"
              aria-hidden="true"
              fill="currentColor"
            />
          )}
          <span
            className={cn(
              'flex-1 truncate text-sm font-semibold',
              'text-gray-900 dark:text-gray-100'
            )}
          >
            {note.title || 'Untitled'}
          </span>

          {/* Hover-only action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {/* Pin toggle */}
            <button
              type="button"
              onClick={handlePinToggle}
              aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
              disabled={togglePin.isPending}
              className={cn(
                'rounded p-1 transition-colors',
                'text-gray-400 hover:bg-gray-200 hover:text-amber-500',
                'dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-amber-400',
                'disabled:opacity-50'
              )}
            >
              <Pin
                className="h-3.5 w-3.5"
                fill={note.is_pinned ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
            </button>

            {/* Move to project */}
            <ProjectSelector
              currentProjectId={note.project_id ?? null}
              onSelect={handleMoveToProject}
              trigger={
                <button
                  type="button"
                  aria-label={`Move note "${note.title}" to a project`}
                  disabled={updateNote.isPending}
                  className={cn(
                    'rounded p-1 transition-colors',
                    'text-gray-400 hover:bg-blue-100 hover:text-blue-600',
                    'dark:text-gray-500 dark:hover:bg-blue-900/40 dark:hover:text-blue-400',
                    updateNote.isPending && 'cursor-wait opacity-50'
                  )}
                >
                  <FolderInput className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              }
            />

            {/* Delete */}
            <button
              type="button"
              onClick={handleDeleteClick}
              aria-label={`Delete note "${note.title || 'Untitled'}"`}
              className={cn(
                'rounded p-1 transition-colors',
                'text-gray-400 hover:bg-red-100 hover:text-red-600',
                'dark:text-gray-500 dark:hover:bg-red-900/40 dark:hover:text-red-400'
              )}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content preview */}
        {preview && (
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {preview}
          </p>
        )}

        {/* Timestamp */}
        <time
          dateTime={note.updated_at}
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          {formatRelativeDate(note.updated_at)}
        </time>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
      />
    </>
  );
}

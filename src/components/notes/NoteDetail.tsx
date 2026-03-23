import { useState, useEffect, useCallback } from 'react';
import { Pin, Trash2, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/dates';
import {
  useNote,
  useUpdateNote,
  useDeleteNote,
  useToggleNotePin,
} from '@/hooks/useNotes';
import { useAutoSave } from '@/hooks/useAutoSave';
import {
  Button,
  ConfirmDialog,
  LoadingSpinner,
  SaveIndicator,
} from '@/components/shared';
import { NoteEditor } from './NoteEditor';
import { TagSelector } from '@/components/tags/TagSelector';
import { useTags, useCreateTag, useAddTagToNote, useRemoveTagFromNote } from '@/hooks/useTags';
import type { Json } from '@/types/database';

interface NoteDetailProps {
  noteId: string;
  onClose: () => void;
  onDelete: () => void;
}

interface NoteData {
  title: string;
  /** TipTap JSON document stored as the Supabase Json type. Null until the editor first emits an update. */
  content: Json | null;
  contentPlain: string;
}

export function NoteDetail({ noteId, onClose, onDelete }: NoteDetailProps) {
  const { data: note, isLoading, isError, error } = useNote(noteId);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const togglePin = useToggleNotePin();
  const { data: allTags } = useTags();
  const createTag = useCreateTag();
  const addTagToNote = useAddTagToNote();
  const removeTagFromNote = useRemoveTagFromNote();

  // Extract tags currently on this note
  const noteTags: Array<{ id: string; name: string; color: string | null }> =
    ((note as any)?.note_tags ?? []).map((nt: any) => nt.tags).filter(Boolean);

  const availableTags: Array<{ id: string; name: string; color: string | null }> =
    ((allTags ?? []) as any[]).filter(
      (t) => !noteTags.some((nt) => nt.id === t.id)
    );

  const [noteData, setNoteData] = useState<NoteData>({
    title: '',
    content: null,
    contentPlain: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Track whether local data has been initialised from the fetched note.
  const [initialised, setInitialised] = useState(false);

  // Sync local state when the note loads or noteId changes.
  useEffect(() => {
    if (note) {
      setNoteData({
        title: note.title ?? '',
        content:
          note.content != null && typeof note.content === 'object'
            ? (note.content as Json)
            : null,
        contentPlain:
          typeof note.content_plain === 'string' ? note.content_plain : '',
      });
      setInitialised(true);
    } else {
      setInitialised(false);
    }
  }, [note, noteId]);

  const handleSave = useCallback(
    async (data: NoteData) => {
      await updateNote.mutateAsync({
        id: noteId,
        input: {
          title: data.title,
          content: data.content ?? undefined,
          contentPlain: data.contentPlain,
        },
      });
    },
    [noteId, updateNote]
  );

  const { status: saveStatus } = useAutoSave({
    data: noteData,
    onSave: handleSave,
    enabled: initialised,
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNoteData((prev) => ({ ...prev, title: e.target.value }));
  }

  function handleContentUpdate(json: object, plainText: string) {
    setNoteData((prev) => ({
      ...prev,
      content: json as Json,
      contentPlain: plainText,
    }));
  }

  function handlePinToggle() {
    if (!note) return;
    togglePin.mutate({ id: note.id, currentPinned: note.is_pinned });
  }

  function handleConfirmDelete() {
    deleteNote.mutate(noteId, {
      onSuccess: () => {
        onDelete();
      },
    });
  }

  // --- Render states ---

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner
          size="lg"
          className="text-gray-400 dark:text-gray-600"
        />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-red-500 dark:text-red-400">
          {error instanceof Error ? error.message : 'Failed to load note.'}
        </p>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col bg-white dark:bg-gray-950">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
          <SaveIndicator status={saveStatus} className="mr-auto" />

          <button
            type="button"
            onClick={handlePinToggle}
            aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
            aria-pressed={note.is_pinned}
            disabled={togglePin.isPending}
            className={cn(
              'rounded p-1.5 transition-colors',
              'text-gray-400 hover:bg-gray-100 hover:text-amber-500',
              'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-amber-400',
              'disabled:opacity-50',
              note.is_pinned && 'text-amber-500 dark:text-amber-400'
            )}
          >
            <Pin
              className="h-4 w-4"
              fill={note.is_pinned ? 'currentColor' : 'none'}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete note"
            className={cn(
              'rounded p-1.5 transition-colors',
              'text-gray-400 hover:bg-red-100 hover:text-red-600',
              'dark:text-gray-500 dark:hover:bg-red-900/40 dark:hover:text-red-400'
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close note"
            className={cn(
              'rounded p-1.5 transition-colors',
              'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
              'dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Editable area */}
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          {/* Title */}
          <input
            type="text"
            value={noteData.title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            aria-label="Note title"
            className={cn(
              'mb-4 w-full border-none bg-transparent text-2xl font-bold',
              'text-gray-900 placeholder:text-gray-300 focus:outline-none',
              'dark:text-gray-100 dark:placeholder:text-gray-700'
            )}
          />

          {/* TipTap editor — replaces the textarea placeholder */}
          <NoteEditor
            content={
              noteData.content != null &&
              typeof noteData.content === 'object' &&
              !Array.isArray(noteData.content)
                ? (noteData.content as object)
                : null
            }
            onUpdate={handleContentUpdate}
          />
        </div>

        {/* Tags section */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tags
          </label>
          <TagSelector
            selectedTags={noteTags}
            availableTags={availableTags}
            onAddTag={(tag) => addTagToNote.mutate({ noteId, tagId: tag.id })}
            onRemoveTag={(tagId) => removeTagFromNote.mutate({ noteId, tagId })}
            onCreateTag={(name) => {
              createTag.mutate({ name }, {
                onSuccess: (newTag: any) => {
                  addTagToNote.mutate({ noteId, tagId: newTag.id });
                },
              });
            }}
          />
        </div>

        {/* Footer: timestamps */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-2 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            Created{' '}
            <time dateTime={note.created_at}>
              {formatDate(note.created_at)}
            </time>
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-600">
            Updated{' '}
            <time dateTime={note.updated_at}>
              {formatDate(note.updated_at)}
            </time>
          </span>
        </div>
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

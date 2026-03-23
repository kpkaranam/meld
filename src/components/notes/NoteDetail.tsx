import { useState, useEffect, useCallback } from 'react';
import { Pin, Trash2, X, CheckSquare, Link2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  LinkSelector,
} from '@/components/shared';
import { NoteEditor } from './NoteEditor';
import { TagSelector } from '@/components/tags/TagSelector';
import {
  useTags,
  useCreateTag,
  useAddTagToNote,
  useRemoveTagFromNote,
} from '@/hooks/useTags';
import {
  useLinkedTasks,
  useLinkTaskToNote,
  useUnlinkTaskFromNote,
} from '@/hooks/useLinks';
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
  const navigate = useNavigate();
  const { data: note, isLoading, isError, error } = useNote(noteId);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const togglePin = useToggleNotePin();
  const { data: allTags } = useTags();
  const createTag = useCreateTag();
  const addTagToNote = useAddTagToNote();
  const removeTagFromNote = useRemoveTagFromNote();

  // Linked tasks
  const { data: linkedTasks = [] } = useLinkedTasks(noteId);
  const linkTaskToNote = useLinkTaskToNote();
  const unlinkTaskFromNote = useUnlinkTaskFromNote();

  // Extract tags currently on this note.
  // note_tags is a nested join result; cast through unknown to avoid strict
  // typing on Supabase generics.
  type NoteTagRow = {
    tags: { id: string; name: string; color: string | null } | null;
  };
  type TagShape = { id: string; name: string; color: string | null };

  const noteTags: TagShape[] = (
    (note as unknown as { note_tags?: NoteTagRow[] })?.note_tags ?? []
  )
    .map((nt) => nt.tags)
    .filter((t): t is TagShape => t !== null);

  const availableTags: TagShape[] = (
    (allTags ?? []) as unknown as TagShape[]
  ).filter((t) => !noteTags.some((nt) => nt.id === t.id));

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
              createTag.mutate(
                { name },
                {
                  onSuccess: (newTag) => {
                    addTagToNote.mutate({
                      noteId,
                      tagId: (newTag as { id: string }).id,
                    });
                  },
                }
              );
            }}
          />
        </div>

        {/* Linked Tasks section */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Linked Tasks
            </label>
            <LinkSelector
              type="task"
              excludeIds={linkedTasks.map((t) => t.id)}
              onSelect={(taskId) => linkTaskToNote.mutate({ taskId, noteId })}
              trigger={
                <span
                  className={cn(
                    'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium',
                    'text-indigo-600 hover:bg-indigo-50',
                    'dark:text-indigo-400 dark:hover:bg-indigo-950/40',
                    'transition-colors'
                  )}
                >
                  <Link2 className="h-3 w-3" aria-hidden="true" />
                  Link a task
                </span>
              }
            />
          </div>

          {linkedTasks.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-600 py-1">
              No linked tasks yet.
            </p>
          ) : (
            <ul className="space-y-1">
              {linkedTasks.map((linkedTask) => (
                <li
                  key={linkedTask.id}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-lg px-3 py-2',
                    'border border-gray-200 dark:border-gray-800',
                    'bg-gray-50 dark:bg-gray-900'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/tasks/${linkedTask.id}`)}
                    className={cn(
                      'flex min-w-0 items-center gap-2 text-left',
                      'text-sm text-gray-700 dark:text-gray-300',
                      'hover:text-indigo-600 dark:hover:text-indigo-400',
                      'transition-colors'
                    )}
                  >
                    <CheckSquare
                      className={cn(
                        'h-3.5 w-3.5 flex-shrink-0',
                        linkedTask.status === 'done'
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-600'
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'truncate',
                        linkedTask.status === 'done' &&
                          'line-through text-gray-400 dark:text-gray-600'
                      )}
                    >
                      {linkedTask.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Unlink task "${linkedTask.title}"`}
                    onClick={() =>
                      unlinkTaskFromNote.mutate({
                        taskId: linkedTask.id,
                        noteId,
                      })
                    }
                    className={cn(
                      'flex-shrink-0 rounded p-0.5',
                      'text-gray-300 hover:text-red-500',
                      'dark:text-gray-700 dark:hover:text-red-400',
                      'transition-colors'
                    )}
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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

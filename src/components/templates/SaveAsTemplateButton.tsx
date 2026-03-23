/**
 * SaveAsTemplateButton — prompts the user for a template name, then saves
 * the current task or note as a reusable template.
 *
 * For tasks: pass taskId.
 * For notes: pass noteId.
 */

import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  useCreateTemplateFromTask,
  useCreateTemplateFromNote,
} from '@/hooks/useTemplates';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

interface SaveAsTemplateButtonProps {
  /** ID of the task to save as template (mutually exclusive with noteId). */
  taskId?: string;
  /** ID of the note to save as template (mutually exclusive with taskId). */
  noteId?: string;
  /** Default name pre-filled in the prompt (usually the task/note title). */
  defaultName?: string;
}

export function SaveAsTemplateButton({
  taskId,
  noteId,
  defaultName = '',
}: SaveAsTemplateButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const createFromTask = useCreateTemplateFromTask();
  const createFromNote = useCreateTemplateFromNote();

  const isPending = createFromTask.isPending || createFromNote.isPending;

  function handleOpen() {
    setName(defaultName);
    setNameError('');
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Template name is required.');
      return;
    }
    setNameError('');

    if (taskId) {
      createFromTask.mutate(
        { taskId, name: trimmed },
        { onSuccess: handleClose }
      );
    } else if (noteId) {
      createFromNote.mutate(
        { noteId, name: trimmed },
        { onSuccess: handleClose }
      );
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Save as template"
        className={cn(
          'rounded p-1.5 transition-colors',
          'text-gray-400 hover:bg-indigo-50 hover:text-indigo-600',
          'dark:text-gray-500 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400'
        )}
        title="Save as template"
      >
        <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
      </button>

      <Modal isOpen={open} onClose={handleClose} title="Save as template">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Give this template a name so you can reuse it later.
          </p>

          <Input
            label="Template name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Weekly standup task"
            error={nameError}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              isLoading={isPending}
            >
              Save template
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

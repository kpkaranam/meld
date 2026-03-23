import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { ColorPicker } from '@/components/shared/ColorPicker';

const DEFAULT_COLOR = '#6366f1';

export interface ProjectFormData {
  name: string;
  color: string;
}

export interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
  project?: { id: string; name: string; color: string } | null;
  isLoading?: boolean;
}

export function ProjectForm({
  isOpen,
  onClose,
  onSave,
  project,
  isLoading = false,
}: ProjectFormProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [nameError, setNameError] = useState<string | undefined>();

  const isEditing = !!project;

  // Sync form state when project prop changes (for edit mode)
  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
    } else {
      setName('');
      setColor(DEFAULT_COLOR);
    }
    setNameError(undefined);
  }, [project, isOpen]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Project name is required.');
      return;
    }

    onSave({ name: trimmed, color });
  }

  function handleClose() {
    if (!isLoading) {
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          {/* Name field */}
          <Input
            label="Project name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError(undefined);
            }}
            placeholder="e.g. Work, Personal"
            error={nameError}
            autoFocus
            disabled={isLoading}
            required
          />

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </span>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {name.trim() || 'Project name'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {isEditing ? 'Save changes' : 'Create project'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

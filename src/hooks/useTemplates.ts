import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '../services/templateService';
import type { CreateTemplateInput, TemplateType } from '../types/template';
import toast from 'react-hot-toast';

// Query key factory
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (type?: TemplateType) => [...templateKeys.lists(), type] as const,
};

/**
 * Fetch all templates, optionally filtered by type.
 * Also seeds built-in starter templates on first use (if the list is empty).
 */
export function useTemplates(type?: TemplateType) {
  return useQuery({
    queryKey: templateKeys.list(type),
    queryFn: async () => {
      // Ensure starter templates exist, then return the list.
      await templateService.seedStarterTemplates();
      return templateService.getTemplates(type);
    },
  });
}

/** Create a template from raw input. */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      templateService.createTemplate(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save template');
    },
  });
}

/** Create a template from an existing task. */
export function useCreateTemplateFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, name }: { taskId: string; name: string }) =>
      templateService.createFromTask(taskId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save template');
    },
  });
}

/** Create a template from an existing note. */
export function useCreateTemplateFromNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, name }: { noteId: string; name: string }) =>
      templateService.createFromNote(noteId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save template');
    },
  });
}

/** Delete a template by id. */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template');
    },
  });
}

/**
 * Apply a template, creating a new task or note from it.
 *
 * Pass `{ templateId, type, projectId? }`.
 * Returns the newly created task or note row.
 */
export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      type,
      projectId,
    }: {
      templateId: string;
      type: TemplateType;
      projectId?: string | null;
    }) => {
      if (type === 'task') {
        return templateService.applyTaskTemplate(templateId, projectId);
      }
      return templateService.applyNoteTemplate(templateId, projectId);
    },
    onSuccess: (_data, variables) => {
      if (variables.type === 'task') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        toast.success('Task created from template');
      } else {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        toast.success('Note created from template');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to apply template');
    },
  });
}

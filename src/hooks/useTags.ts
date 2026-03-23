import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagService } from '../services/tagService';
import type { CreateTagInput, UpdateTagInput } from '../types/tag';
import { taskKeys } from './useTasks';
import { noteKeys } from './useNotes';
import toast from 'react-hot-toast';

// Query key factory
export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
};

/**
 * Fetch all tags for the current user, ordered alphabetically.
 */
export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagService.getTags(),
  });
}

/**
 * Mutation: create a new tag.
 * Invalidates the tag list on success.
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => tagService.createTag(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });
}

/**
 * Mutation: update an existing tag.
 * Invalidates the tag list on success.
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTagInput }) =>
      tagService.updateTag(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tag');
    },
  });
}

/**
 * Mutation: delete a tag.
 * Invalidates tag list, task lists, and note lists because tag associations
 * are removed by the database cascade and displayed lists may show stale data.
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Tag deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });
}

/**
 * Mutation: apply a tag to a task.
 * Invalidates task lists so tags are reflected in rendered task rows.
 */
export function useAddTagToTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagService.addTagToTask(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Mutation: remove a tag from a task.
 * Invalidates task lists so removed tags are no longer shown.
 */
export function useRemoveTagFromTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, tagId }: { taskId: string; tagId: string }) =>
      tagService.removeTagFromTask(taskId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

/**
 * Mutation: apply a tag to a note.
 * Invalidates note lists so tags are reflected in rendered note rows.
 */
export function useAddTagToNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, tagId }: { noteId: string; tagId: string }) =>
      tagService.addTagToNote(noteId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/**
 * Mutation: remove a tag from a note.
 * Invalidates note lists so removed tags are no longer shown.
 */
export function useRemoveTagFromNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, tagId }: { noteId: string; tagId: string }) =>
      tagService.removeTagFromNote(noteId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

/**
 * React Query hooks for task-note bidirectional linking.
 *
 * useLinkedNotes  — fetch notes linked to a task
 * useLinkedTasks  — fetch tasks linked to a note
 * useLinkTaskToNote    — create a link
 * useUnlinkTaskFromNote — remove a link
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { linkService } from '../services/linkService';
import toast from 'react-hot-toast';

/** Stable query key factory for link queries. */
export const linkKeys = {
  linkedNotes: (taskId: string) => ['links', 'notes', taskId] as const,
  linkedTasks: (noteId: string) => ['links', 'tasks', noteId] as const,
};

/**
 * Fetch all notes linked to the given task.
 *
 * @param taskId - UUID of the task (query is disabled when falsy)
 */
export function useLinkedNotes(taskId: string) {
  return useQuery({
    queryKey: linkKeys.linkedNotes(taskId),
    queryFn: () => linkService.getLinkedNotes(taskId),
    enabled: !!taskId,
  });
}

/**
 * Fetch all tasks linked to the given note.
 *
 * @param noteId - UUID of the note (query is disabled when falsy)
 */
export function useLinkedTasks(noteId: string) {
  return useQuery({
    queryKey: linkKeys.linkedTasks(noteId),
    queryFn: () => linkService.getLinkedTasks(noteId),
    enabled: !!noteId,
  });
}

/**
 * Mutation to create a task-note link.
 * Invalidates both sides of the relationship on success.
 */
export function useLinkTaskToNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, noteId }: { taskId: string; noteId: string }) =>
      linkService.linkTaskToNote(taskId, noteId),
    onSuccess: (_, { taskId, noteId }) => {
      qc.invalidateQueries({ queryKey: linkKeys.linkedNotes(taskId) });
      qc.invalidateQueries({ queryKey: linkKeys.linkedTasks(noteId) });
      toast.success('Link created');
    },
    onError: () => toast.error('Failed to create link'),
  });
}

/**
 * Mutation to remove a task-note link.
 * Invalidates both sides of the relationship on success.
 */
export function useUnlinkTaskFromNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, noteId }: { taskId: string; noteId: string }) =>
      linkService.unlinkTaskFromNote(taskId, noteId),
    onSuccess: (_, { taskId, noteId }) => {
      qc.invalidateQueries({ queryKey: linkKeys.linkedNotes(taskId) });
      qc.invalidateQueries({ queryKey: linkKeys.linkedTasks(noteId) });
    },
    onError: () => toast.error('Failed to remove link'),
  });
}

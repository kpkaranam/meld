import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/noteService';
import type { CreateNoteInput, UpdateNoteInput } from '../types/note';
import toast from 'react-hot-toast';

// Query key factory
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (projectId?: string | null) =>
    [...noteKeys.lists(), projectId] as const,
  detail: (id: string) => [...noteKeys.all, 'detail', id] as const,
};

export function useNotes(projectId?: string | null) {
  return useQuery({
    queryKey: noteKeys.list(projectId),
    queryFn: () => noteService.getNotes(projectId),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => noteService.getNoteById(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => noteService.createNote(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: noteKeys.list(variables.projectId ?? null),
      });
      queryClient.invalidateQueries({ queryKey: noteKeys.list(undefined) });
      toast.success('Note created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create note');
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      noteService.updateNote(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(noteKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Note deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
}

export function useToggleNotePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      currentPinned,
    }: {
      id: string;
      currentPinned: boolean;
    }) => noteService.togglePin(id, currentPinned),
    onSuccess: (data) => {
      queryClient.setQueryData(noteKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task';
import toast from 'react-hot-toast';

// Query key factory
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (projectId?: string | null) =>
    [...taskKeys.lists(), projectId] as const,
  today: () => [...taskKeys.all, 'today'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  subtasks: (parentId: string) =>
    [...taskKeys.all, 'subtasks', parentId] as const,
};

export function useTasks(projectId?: string | null) {
  return useQuery({
    queryKey: taskKeys.list(projectId),
    queryFn: () => taskService.getTasks(projectId),
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: taskKeys.today(),
    queryFn: () => taskService.getTodayTasks(),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
  });
}

export function useSubtasks(parentId: string) {
  return useQuery({
    queryKey: taskKeys.subtasks(parentId),
    queryFn: () => taskService.getSubtasks(parentId),
    enabled: !!parentId,
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parentId,
      input,
    }: {
      parentId: string;
      input: CreateTaskInput;
    }) => taskService.createTask({ ...input, parentId }),
    onSuccess: (_data, variables) => {
      // Invalidate subtask list for this parent
      queryClient.invalidateQueries({
        queryKey: taskKeys.subtasks(variables.parentId),
      });
      // Also refresh the parent's detail so subtask count stays accurate
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.parentId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create subtask');
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    onSuccess: (_data, variables) => {
      // Invalidate the relevant list
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.projectId ?? null),
      });
      // Also invalidate "all tasks" list
      queryClient.invalidateQueries({ queryKey: taskKeys.list(undefined) });
      toast.success('Task created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.updateTask(id, input),
    onSuccess: (data) => {
      // Update the detail cache
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.today() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; parentId?: string }) =>
      taskService.deleteTask(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.today() });
      // If it was a subtask, also refresh the parent's subtask list
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.subtasks(variables.parentId),
        });
      }
      toast.success('Task deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      currentStatus,
    }: {
      id: string;
      currentStatus: string;
      parentId?: string;
    }) => taskService.toggleTaskStatus(id, currentStatus),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.today() });
      // Refresh parent's subtask list so completion state reflects
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.subtasks(variables.parentId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
}

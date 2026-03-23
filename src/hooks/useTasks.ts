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
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.today() });
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
    }) => taskService.toggleTaskStatus(id, currentStatus),
    onSuccess: (data) => {
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.today() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
}

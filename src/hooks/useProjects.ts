import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project';
import toast from 'react-hot-toast';

// Query key factory
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (includeArchived?: boolean) =>
    [...projectKeys.lists(), includeArchived] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

/**
 * Fetch all projects. Pass `includeArchived = true` to also return
 * archived projects.
 */
export function useProjects(includeArchived = false) {
  return useQuery({
    queryKey: projectKeys.list(includeArchived),
    queryFn: () => projectService.getProjects(includeArchived),
  });
}

/**
 * Fetch a single project by id. Query is disabled when id is empty.
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
  });
}

/**
 * Mutation: create a new project.
 * Invalidates all project list queries on success.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      projectService.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

/**
 * Mutation: update an existing project.
 * Updates the detail cache immediately and invalidates project lists.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectService.updateProject(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(projectKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
}

/**
 * Mutation: delete a project.
 * Invalidates all project list queries on success.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
}

/**
 * Hooks for importing external data into Meld.
 *
 * useImportTodoist — parses a Todoist CSV export
 * useImportJSON    — parses a Meld-compatible JSON export
 *
 * Both hooks invalidate task and project query caches on success so
 * the UI reflects the newly imported rows immediately.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importService } from '../services/importService';
import { taskKeys } from './useTasks';
import { projectKeys } from './useProjects';
import toast from 'react-hot-toast';

/**
 * Mutation hook for importing a Todoist CSV export.
 *
 * Usage:
 *   const { mutate, isPending } = useImportTodoist();
 *   mutate(csvString);
 */
export function useImportTodoist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (csvContent: string) =>
      importService.importTodoistCSV(csvContent),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(
        `Imported ${result.tasksImported} task${result.tasksImported !== 1 ? 's' : ''}` +
          (result.projectsCreated > 0
            ? `, ${result.projectsCreated} project${result.projectsCreated !== 1 ? 's' : ''}`
            : '')
      );
      if (result.errors.length > 0) {
        toast.error(
          `${result.errors.length} row${result.errors.length !== 1 ? 's' : ''} had errors — check the details below`
        );
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/**
 * Mutation hook for importing a Meld-compatible JSON export.
 *
 * Usage:
 *   const { mutate, isPending } = useImportJSON();
 *   mutate(jsonString);
 */
export function useImportJSON() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (jsonContent: string) => importService.importJSON(jsonContent),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.all });
      toast.success(
        `Imported ${result.tasksImported} task${result.tasksImported !== 1 ? 's' : ''}` +
          (result.projectsCreated > 0
            ? `, ${result.projectsCreated} project${result.projectsCreated !== 1 ? 's' : ''}`
            : '')
      );
      if (result.errors.length > 0) {
        toast.error(
          `${result.errors.length} row${result.errors.length !== 1 ? 's' : ''} had errors — check the details below`
        );
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

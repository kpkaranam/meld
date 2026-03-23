import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/statsService';

export function useOverviewStats() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: () => statsService.getOverviewStats(),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useTaskCompletionStats(days = 30) {
  return useQuery({
    queryKey: ['stats', 'completions', days],
    queryFn: () => statsService.getTaskCompletionStats(days),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOverdueCount() {
  return useQuery({
    queryKey: ['stats', 'overdue'],
    queryFn: () => statsService.getOverdueCount(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['stats', 'recent-activity'],
    queryFn: async () => {
      const [tasks, notes] = await Promise.all([
        statsService.getRecentCompletedTasks(),
        statsService.getRecentNotes(),
      ]);

      const combined = [
        ...tasks.map((t) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          date: t.completed_at,
        })),
        ...notes.map((n) => ({
          id: n.id,
          type: 'note' as const,
          title: n.title,
          date: n.created_at,
        })),
      ];

      // Sort combined list by date descending
      combined.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return combined.slice(0, 15);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpcomingTasks(days = 7) {
  return useQuery({
    queryKey: ['stats', 'upcoming', days],
    queryFn: () => statsService.getUpcomingTasks(days),
    staleTime: 1000 * 60 * 2,
  });
}

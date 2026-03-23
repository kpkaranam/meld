import {
  CheckSquare,
  ListTodo,
  FileText,
  FolderKanban,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import {
  useOverviewStats,
  useTaskCompletionStats,
  useOverdueCount,
} from '@/hooks/useStats';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CompletionChart } from '@/components/dashboard/CompletionChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';

export default function DashboardPage() {
  useDocumentTitle('Dashboard');

  const { data: overview, isLoading: overviewLoading } = useOverviewStats();
  const { data: completions, isLoading: completionsLoading } =
    useTaskCompletionStats(30);
  const { data: overdueCount } = useOverdueCount();

  const chartData = completions ?? new Map<string, number>();

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your productivity at a glance
          </p>
        </div>

        {/* Stats cards — 3 col on desktop, 2 col on tablet, 1 col on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            label="Active Tasks"
            value={overviewLoading ? '–' : (overview?.activeTasks ?? 0)}
            icon={<ListTodo size={20} />}
            color="bg-indigo-100 dark:bg-indigo-900/40"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatsCard
            label="Completed Tasks"
            value={overviewLoading ? '–' : (overview?.completedTasks ?? 0)}
            icon={<CheckSquare size={20} />}
            color="bg-green-100 dark:bg-green-900/40"
            iconColor="text-green-600 dark:text-green-400"
            trend="up"
          />
          <StatsCard
            label="Notes"
            value={overviewLoading ? '–' : (overview?.totalNotes ?? 0)}
            icon={<FileText size={20} />}
            color="bg-blue-100 dark:bg-blue-900/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatsCard
            label="Overdue"
            value={overdueCount ?? 0}
            icon={<AlertCircle size={20} />}
            color={
              (overdueCount ?? 0) > 0
                ? 'bg-red-100 dark:bg-red-900/40'
                : 'bg-gray-100 dark:bg-gray-800'
            }
            iconColor={
              (overdueCount ?? 0) > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            }
            trend={(overdueCount ?? 0) > 0 ? 'down' : 'neutral'}
          />
          <StatsCard
            label="Completion Rate"
            value={overviewLoading ? '–' : `${overview?.completionRate ?? 0}%`}
            icon={<BarChart2 size={20} />}
            color="bg-purple-100 dark:bg-purple-900/40"
            iconColor="text-purple-600 dark:text-purple-400"
            trend={(overview?.completionRate ?? 0) >= 70 ? 'up' : 'neutral'}
          />
          <StatsCard
            label="Projects"
            value={overviewLoading ? '–' : (overview?.totalProjects ?? 0)}
            icon={<FolderKanban size={20} />}
            color="bg-orange-100 dark:bg-orange-900/40"
            iconColor="text-orange-600 dark:text-orange-400"
          />
        </div>

        {/* Completion chart */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Task Completions
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Last 30 days
            </p>
          </div>
          <div className="px-5 py-5 relative" style={{ minHeight: 120 }}>
            {completionsLoading ? (
              <div className="flex items-center justify-center h-20 text-sm text-gray-400 dark:text-gray-500 animate-pulse">
                Loading chart...
              </div>
            ) : (
              <CompletionChart data={chartData} days={30} />
            )}
          </div>
        </div>

        {/* Bottom row: Recent Activity + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivity />
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { LoadingSpinner, EmptyState } from '@/components/shared';
import { type TaskRow } from './TaskItem';
import { SortableTaskItem } from './SortableTaskItem';
import { QuickAddTask } from './QuickAddTask';

interface TaskListProps {
  projectId?: string | null;
  onSelectTask: (taskId: string) => void;
  showCompleted?: boolean;
}

export function TaskList({
  projectId,
  onSelectTask,
  showCompleted: showCompletedProp,
}: TaskListProps) {
  const { data: tasks, isLoading, error } = useTasks(projectId);
  const updateTask = useUpdateTask();

  // Allow external control of showCompleted, falling back to internal state
  const [internalShowCompleted, setInternalShowCompleted] = useState(false);
  const showCompleted = showCompletedProp ?? internalShowCompleted;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allTasks = (tasks ?? []) as TaskRow[];
    const activeTasks = allTasks.filter((t) => t.status !== 'done');
    const completedTasks = allTasks.filter((t) => t.status === 'done');
    const displayTasks = showCompleted ? allTasks : activeTasks;

    const oldIndex = displayTasks.findIndex((t) => t.id === active.id);
    const newIndex = displayTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(displayTasks, oldIndex, newIndex);

    // Re-build full ordered list: reordered active/display tasks + completed tasks at the end
    const fullReordered = showCompleted
      ? reordered
      : [...reordered, ...completedTasks];

    // Persist sort_order for each task whose position changed
    fullReordered.forEach((task, index) => {
      if (task.sort_order !== index) {
        updateTask.mutate({ id: task.id, input: { sortOrder: index } });
      }
    });
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="Loading tasks"
      >
        <LoadingSpinner size="md" className="text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-400"
        role="alert"
      >
        Failed to load tasks. Please try again.
      </div>
    );
  }

  const allTasks = (tasks ?? []) as TaskRow[];
  const activeTasks = allTasks.filter((t) => t.status !== 'done');
  const completedTasks = allTasks.filter((t) => t.status === 'done');
  const displayTasks = showCompleted ? allTasks : activeTasks;
  const taskIds = displayTasks.map((t) => t.id);

  return (
    <div className="flex flex-col">
      {/* Quick add */}
      <QuickAddTask projectId={projectId} />

      {/* Divider */}
      <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

      {/* Task rows */}
      {displayTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8" aria-hidden="true" />}
          title="No tasks yet"
          description="No tasks yet. Create one above!"
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div role="table" aria-label="Task list">
              {displayTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Toggle completed */}
      {showCompletedProp === undefined && completedTasks.length > 0 && (
        <button
          type="button"
          onClick={() => setInternalShowCompleted((prev) => !prev)}
          className="mt-2 px-3 py-1.5 text-left text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-expanded={internalShowCompleted}
        >
          {internalShowCompleted
            ? `Hide ${completedTasks.length} completed`
            : `Show ${completedTasks.length} completed`}
        </button>
      )}
    </div>
  );
}

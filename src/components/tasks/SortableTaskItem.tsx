import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TaskItem, type TaskRow } from './TaskItem';

interface SortableTaskItemProps {
  task: TaskRow;
  onSelect: (id: string) => void;
}

export function SortableTaskItem({ task, onSelect }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group">
      {/* Drag handle — visible only on hover */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 text-gray-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded flex-shrink-0"
        aria-label="Drag to reorder"
        tabIndex={0}
      >
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex-1 min-w-0">
        <TaskItem task={task} onSelect={onSelect} />
      </div>
    </div>
  );
}

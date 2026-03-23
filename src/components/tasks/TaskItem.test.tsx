import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem, type TaskRow } from './TaskItem';

// Mock the hooks
vi.mock('@/hooks/useTasks', () => ({
  useToggleTaskStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateTask: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    data: [],
    isLoading: false,
  }),
}));

// Modal relies on portal; just render inline for tests
vi.mock('@/components/shared/Modal', () => ({
  Modal: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

const baseTask: TaskRow = {
  id: 'task-1',
  user_id: 'user-1',
  project_id: null,
  title: 'Test task',
  description: '',
  status: 'todo',
  priority: 'none',
  due_date: null,
  completed_at: null,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('TaskItem', () => {
  it('renders the task title', () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('renders a checkbox', () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('checkbox is checked when task is done', () => {
    const doneTask = { ...baseTask, status: 'done' };
    render(<TaskItem task={doneTask} onSelect={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('checkbox is unchecked when task is todo', () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('calls onSelect when the row is clicked', async () => {
    const onSelect = vi.fn();
    render(<TaskItem task={baseTask} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Test task'));
    expect(onSelect).toHaveBeenCalledWith('task-1');
  });

  it('shows priority badge for non-none priorities', () => {
    const highTask = { ...baseTask, priority: 'high' };
    render(<TaskItem task={highTask} onSelect={vi.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('does not show priority badge for "none" priority', () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    expect(screen.queryByText('None')).not.toBeInTheDocument();
  });

  it('shows due date badge when due_date is set', () => {
    const taskWithDue = { ...baseTask, due_date: '2099-12-31' };
    render(<TaskItem task={taskWithDue} onSelect={vi.fn()} />);
    expect(screen.getByLabelText(/Due date:/)).toBeInTheDocument();
  });

  it('has delete button', () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    expect(screen.getByLabelText(/Delete task/)).toBeInTheDocument();
  });

  it('opens confirm dialog when delete is clicked', async () => {
    render(<TaskItem task={baseTask} onSelect={vi.fn()} />);
    await userEvent.click(screen.getByLabelText(/Delete task/));
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('applies line-through styling to completed task title', () => {
    const doneTask = { ...baseTask, status: 'done' };
    render(<TaskItem task={doneTask} onSelect={vi.fn()} />);
    const titleEl = screen.getByText('Test task');
    expect(titleEl).toHaveClass('line-through');
  });
});

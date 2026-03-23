import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickAddTask } from './QuickAddTask';

const mockMutate = vi.fn();

vi.mock('@/hooks/useTasks', () => ({
  useCreateTask: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

describe('QuickAddTask', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders a text input with placeholder', () => {
    render(<QuickAddTask />);
    expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument();
  });

  it('does not call mutate when Enter pressed with empty input', async () => {
    render(<QuickAddTask />);
    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls mutate with title when Enter is pressed', async () => {
    render(<QuickAddTask projectId="proj-1" />);
    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task{Enter}');
    expect(mockMutate).toHaveBeenCalledWith(
      { title: 'New task', projectId: 'proj-1' },
      expect.any(Object)
    );
  });

  it('does not call mutate when typing without Enter', async () => {
    render(<QuickAddTask />);
    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'New task');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('uses null as projectId when no projectId prop is provided', async () => {
    render(<QuickAddTask />);
    const input = screen.getByPlaceholderText('Add a task...');
    await userEvent.type(input, 'Inbox task{Enter}');
    expect(mockMutate).toHaveBeenCalledWith(
      { title: 'Inbox task', projectId: null },
      expect.any(Object)
    );
  });

  it('has accessible aria-label', () => {
    render(<QuickAddTask />);
    expect(screen.getByLabelText('Quick add task')).toBeInTheDocument();
  });
});

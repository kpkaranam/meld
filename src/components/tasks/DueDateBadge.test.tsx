import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DueDateBadge } from './DueDateBadge';

describe('DueDateBadge', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Today" for today\'s date', () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    render(<DueDateBadge dueDate={todayStr} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows "Overdue" text for past dates', () => {
    render(<DueDateBadge dueDate="2020-01-01" />);
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
  });

  it('shows formatted date for future dates', () => {
    render(<DueDateBadge dueDate="2099-12-31" />);
    // Should render formatted date without "Overdue"
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
  });

  it('has an accessible aria-label', () => {
    const today = new Date().toISOString().split('T')[0];
    render(<DueDateBadge dueDate={today} />);
    expect(screen.getByLabelText(/Due date:/)).toBeInTheDocument();
  });

  it('applies red color for overdue dates', () => {
    const { container } = render(<DueDateBadge dueDate="2020-01-01" />);
    expect(container.firstChild).toHaveClass('text-red-600');
  });
});

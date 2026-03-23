import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No tasks yet" />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Create one to get started"
      />
    );
    expect(screen.getByText('Create one to get started')).toBeInTheDocument();
  });

  it('renders action button and fires onClick', async () => {
    const onClick = vi.fn();
    render(
      <EmptyState title="Empty" action={{ label: 'Add item', onClick }} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="No notes" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

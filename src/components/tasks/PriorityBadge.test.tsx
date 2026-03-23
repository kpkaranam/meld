import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriorityBadge } from './PriorityBadge';

describe('PriorityBadge', () => {
  it('renders nothing for "none" priority', () => {
    const { container } = render(<PriorityBadge priority="none" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders low priority label', () => {
    render(<PriorityBadge priority="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders medium priority label', () => {
    render(<PriorityBadge priority="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders high priority label', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(<PriorityBadge priority="high" />);
    expect(screen.getByLabelText('Priority: High')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies inline style for hex color', () => {
    render(<Badge color="#4f46e5">Indigo</Badge>);
    const badge = screen.getByText('Indigo');
    expect(badge).toHaveStyle({ backgroundColor: '#4f46e5' });
  });

  it('renders with default styles when no color is provided', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100');
  });

  it('passes through className', () => {
    render(<Badge className="my-custom-class">Tag</Badge>);
    expect(screen.getByText('Tag')).toHaveClass('my-custom-class');
  });
});

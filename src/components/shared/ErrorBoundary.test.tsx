import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// A component that throws when the `shouldThrow` prop is true
function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error');
  return <p>All good</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress the expected console.error from React's error boundary
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback when a child throws', () => {
    render(
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });
});

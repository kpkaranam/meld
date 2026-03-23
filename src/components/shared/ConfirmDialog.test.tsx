import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete item',
    message: 'Are you sure you want to delete this?',
  };

  it('renders title and message', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this?')
    ).toBeInTheDocument();
  });

  it('uses custom confirm label', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="Yes, delete" />);
    expect(
      screen.getByRole('button', { name: 'Yes, delete' })
    ).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirm is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog {...baseProps} onClose={onClose} onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls only onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog {...baseProps} onClose={onClose} onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

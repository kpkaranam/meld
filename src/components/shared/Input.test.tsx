import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders without label', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders with a label and associates it', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
  });

  it('shows error message and marks input invalid', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('shows helper text when no error', () => {
    render(<Input helperText="We will never share your email" />);
    expect(
      screen.getByText('We will never share your email')
    ).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(<Input error="Required" helperText="Helper" />);
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('accepts user input', async () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'Alice');
    expect(input).toHaveValue('Alice');
  });
});

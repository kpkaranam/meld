import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Plus } from 'lucide-react';
import { CommandItem } from './CommandItem';
import type { Command } from './CommandItem';

function makeCommand(overrides?: Partial<Command>): Command {
  return {
    id: 'test-cmd',
    label: 'Test Command',
    description: 'Does something useful',
    icon: <Plus size={14} />,
    keywords: ['test', 'something'],
    action: vi.fn(),
    ...overrides,
  };
}

describe('CommandItem', () => {
  it('renders the command label', () => {
    render(
      <CommandItem
        command={makeCommand()}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    expect(screen.getByText('Test Command')).toBeInTheDocument();
  });

  it('renders the optional description', () => {
    render(
      <CommandItem
        command={makeCommand({ description: 'A helpful description' })}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    expect(screen.getByText('A helpful description')).toBeInTheDocument();
  });

  it('renders a keyboard shortcut badge when provided', () => {
    render(
      <CommandItem
        command={makeCommand({ shortcut: 'Ctrl+N' })}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    expect(screen.getByText('Ctrl+N')).toBeInTheDocument();
  });

  it('does not render a shortcut badge when shortcut is omitted', () => {
    render(
      <CommandItem
        command={makeCommand({ shortcut: undefined })}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    // No element with class that would host a shortcut
    expect(
      screen.queryByLabelText(/Keyboard shortcut/i)
    ).not.toBeInTheDocument();
  });

  it('calls onExecute when the button is clicked', () => {
    const onExecute = vi.fn();
    render(
      <CommandItem
        command={makeCommand()}
        isSelected={false}
        onExecute={onExecute}
        onMouseEnter={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('option'));
    expect(onExecute).toHaveBeenCalledTimes(1);
  });

  it('calls onMouseEnter when the mouse enters the item', () => {
    const onMouseEnter = vi.fn();
    render(
      <CommandItem
        command={makeCommand()}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={onMouseEnter}
      />
    );
    fireEvent.mouseEnter(screen.getByRole('option'));
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('has aria-selected=true when isSelected is true', () => {
    render(
      <CommandItem
        command={makeCommand()}
        isSelected={true}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('has aria-selected=false when isSelected is false', () => {
    render(
      <CommandItem
        command={makeCommand()}
        isSelected={false}
        onExecute={vi.fn()}
        onMouseEnter={vi.fn()}
      />
    );
    expect(screen.getByRole('option')).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});

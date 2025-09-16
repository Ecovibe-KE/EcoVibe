import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActionButton } from '../../utils/button/Button.jsx';

// Mock the icons
vi.mock('@mui/icons-material/Add', () => ({
    default: () => <div data-testid="add-icon" />
}));
vi.mock('@mui/icons-material/Edit', () => ({
    default: () => <div data-testid="edit-icon" />
}));
vi.mock('@mui/icons-material/DeleteForever', () => ({
    default: () => <div data-testid="delete-icon" />
}));
vi.mock('@mui/icons-material/RemoveRedEye', () => ({
    default: () => <div data-testid="view-icon" />
}));

describe('ActionButton', () => {
  it('renders with the correct label', () => {
    render(<ActionButton label="Click Me" action="add" />);
    expect(screen.getByText('Click Me')).not.toBeNull();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<ActionButton label="Click Me" action="add" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct classes for action and variant', () => {
    // Test with solid variant
    const { container: container1 } = render(<ActionButton label="Test" action="update" />);
    const button1 = container1.querySelector('button');
    expect(button1.className).toContain('btn');
    expect(button1.className).toContain('btn-primary');

    // Test with outlined variant
    const { container: container2 } = render(<ActionButton label="Test" action="delete" variant="outlined" />);
    const button2 = container2.querySelector('button');
    expect(button2.className).toContain('btn');
    expect(button2.className).toContain('btn-outline-danger');
  });

  it('displays the add icon for the "add" action', () => {
    render(<ActionButton label="Add" action="add" />);
    expect(screen.getByTestId('add-icon')).not.toBeNull();
  });

  it('displays the edit icon for the "update" action', () => {
    render(<ActionButton label="Update" action="update" />);
    expect(screen.getByTestId('edit-icon')).not.toBeNull();
  });

  it('displays the delete icon for the "delete" action', () => {
    render(<ActionButton label="Delete" action="delete" />);
    expect(screen.getByTestId('delete-icon')).not.toBeNull();
  });

  it('displays the view icon for the "view" action', () => {
    render(<ActionButton label="View" action="view" />);
    expect(screen.getByTestId('view-icon')).not.toBeNull();
  });

  it('has the correct aria-label', () => {
    render(<ActionButton label="Aria Test" action="add" />);
    expect(screen.getByLabelText('Aria Test')).not.toBeNull();
  });
});

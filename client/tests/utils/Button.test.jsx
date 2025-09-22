import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Button from "../../src/utils/Button";

vi.mock('@mui/icons-material/Add', () => ({ default: () => <span data-testid="add-icon" /> }));
vi.mock('@mui/icons-material/Edit', () => ({ default: () => <span data-testid="edit-icon" /> }));
vi.mock('@mui/icons-material/DeleteForever', () => ({ default: () => <span data-testid="delete-icon" /> }));
vi.mock('@mui/icons-material/RemoveRedEye', () => ({ default: () => <span data-testid="view-icon" /> }));

describe('Button Component', () => {
  // Test 1: Renders standard button with children
  it('renders standard button with the correct text', () => {
    const buttonText = 'Click Me';
    render(<Button>{buttonText}</Button>);
    expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
  });

  // Test 2: onClick handler is called
  it('calls the onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 3: Default type is "button"
  it('has the default type "button"', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  // Test 4: Type attribute is set correctly
  it('applies the correct type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  // Test 5: Disabled state works
  it('is disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // Test 6: onClick is NOT called when disabled
  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(0);
  });

  // Test 7: Applies size classes
  describe('Size variants', () => {
    it('applies the "btn-sm" class for the "sm" size', () => {
      render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-sm');
    });

    it('applies the "btn-lg" class for the "lg" size', () => {
      render(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('btn-lg');
    });

    it('does not apply a size class if no size prop is provided', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('btn-sm');
      expect(button).not.toHaveClass('btn-lg');
    });
  });

  // Test 8: Outline variant
  it('applies the "btn-outline" class when outline is true for standard buttons', () => {
    render(<Button outline>Outline Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-outline');
  });

  // Test 9: Custom className is merged
  it('merges custom className with base classes', () => {
    const testClass = 'my-custom-class';
    render(<Button className={testClass}>Custom Class</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass(testClass);
  });

  // Test 10: Custom border radius is applied via style
  it('applies custom border radius through the style attribute', () => {
    const borderRadius = '20px';
    render(<Button borderRadius={borderRadius}>Rounded</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ borderRadius });
  });

  // Test 11: Action buttons
  describe('Action buttons', () => {
    it('renders add action button with icon and label', () => {
      render(<Button action="add" label="Add Item" />);
      const button = screen.getByRole('button', { name: 'Add Item' });
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    });

    it('renders update action button with icon and label', () => {
      render(<Button action="update" label="Edit Item" />);
      const button = screen.getByRole('button', { name: 'Edit Item' });
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
    });

    it('renders delete action button with icon and label', () => {
      render(<Button action="delete" label="Delete Item" />);
      const button = screen.getByRole('button', { name: 'Delete Item' });
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
    });

    it('renders view action button with icon and label', () => {
      render(<Button action="view" label="View Item" />);
      const button = screen.getByRole('button', { name: 'View Item' });
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId('view-icon')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<Button action="add" label="Add Item" showIcon={false} />);
      expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('uses custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon" />;
      render(<Button action="add" label="Add Item" icon={<CustomIcon />} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  // Test 12: Additional props are spread onto the button element
  it('passes additional props to the button element', () => {
    render(<Button aria-label="Accessible label" data-testid="custom-attr">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible label');
    expect(button).toHaveAttribute('data-testid', 'custom-attr');
  });

  // Test 13: Button has correct margin styles
  it('applies the correct margin styles', () => {
    render(<Button>Test Margin</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ margin: '0.5rem' });
  });

  // Test 14: Action buttons have different margin
  it('action buttons have different margin', () => {
    render(<Button action="add" label="Add" />);
    expect(screen.getByRole('button')).toHaveStyle({ margin: '2.5px' });
  });

  // Test 15: Button has correct padding styles
  it('applies the correct padding styles', () => {
    render(<Button>Test Padding</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem'
    });
  });

  // Test 16: Button has transition effect
  it('applies transition styles', () => {
    render(<Button>Test Transition</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ transition: 'all 0.3s ease' });
  });

  // Test 17: Edge cases
  describe('Edge cases', () => {
    it('handles empty children gracefully for standard buttons', () => {
      render(<Button />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles undefined onClick gracefully', () => {
      render(<Button onClick={undefined}>Test</Button>);
      expect(() => {
        fireEvent.click(screen.getByRole('button'));
      }).not.toThrow();
    });
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Button from "../../src/utils/Button";

describe('Button Component', () => {
  // Test 1: Renders with children
  it('renders the button with the correct text', () => {
    const buttonText = 'Click Me';
    render(<Button>{buttonText}</Button>);
    expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
  });

  // Test 2: onClick handler is called - FIXED: use vi.fn() instead of jest.fn()
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

  // Test 6: onClick is NOT called when disabled - FIXED: use vi.fn() instead of jest.fn()
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
  it('applies the "btn-outline" class when outline is true', () => {
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

  // Test 11: Applies correct inline styles for default variant
  it('applies the correct default background color', () => {
    render(<Button>Default Style</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#37b137' });
  });

  // Test 12: Applies correct inline styles for outline variant - FIXED: Use rgb format
it('applies the correct outline styles', () => {
    render(<Button outline>Outline Style</Button>);
    const button = screen.getByRole('button');

    // Debug: log the actual styles
    console.log('Button styles:', window.getComputedStyle(button));
    console.log('Background color:', window.getComputedStyle(button).backgroundColor);
    console.log('Color:', window.getComputedStyle(button).color);

    // Use more flexible assertions
    expect(button).toHaveStyle({
      backgroundColor: expect.stringContaining('transparent') || expect.stringContaining('rgba(0, 0, 0, 0)'),
    });

    // Check if color contains the expected green (could be rgb, rgba, or hex)
    const color = window.getComputedStyle(button).color;
    expect(
      color.includes('55, 177, 55') || // rgb
      color.includes('#37b137') || // hex
      color.includes('rgba(55, 177, 55') // rgba
    ).toBe(true);
  });


  // Test 13: Additional props are spread onto the button element
  it('passes additional props to the button element', () => {
    render(<Button aria-label="Accessible label" data-testid="custom-attr">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible label');
    expect(button).toHaveAttribute('data-testid', 'custom-attr');
  });

  // Test 14: Button has correct margin styles
  it('applies the correct margin styles', () => {
    render(<Button>Test Margin</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ margin: '0.5rem' });
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
});
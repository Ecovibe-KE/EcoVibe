import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServiceAdminTop from '../../src/components/admin/ServiceAdminTop';

// Mock react-bootstrap - let's make it easier to test
vi.mock('react-bootstrap', () => ({
    Col: ({ children, className }) => (
        <div data-testid="col-component" className={className}>
            {children}
        </div>
    ),
}));

// Mock CSS
vi.mock('../../src/css/ServiceAdmin.css', () => ({}));

describe('ServiceAdminTop', () => {
    const defaultProps = {
        imageSource: 'test-image.png',
        number: 42,
        text: 'Total Services',
        imageSetting: 'info',
        colSetting: 'me-3'
    };

    it('renders with all props correctly', () => {
        render(<ServiceAdminTop {...defaultProps} />);

        // Check if the number and text are displayed
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Total Services')).toBeInTheDocument();

        // Check if the image has the correct source
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'test-image.png');

        // Check if CSS classes are applied correctly
        expect(image).toHaveClass('bg-info-subtle');
        expect(image).toHaveClass('rounded-2');
        expect(image).toHaveClass('me-3');
        expect(image).toHaveClass('object-fit-contain');
    });

    it('applies correct column class from colSetting prop', () => {
        render(<ServiceAdminTop {...defaultProps} />);

        // Get the Col component by test id
        const colElement = screen.getByTestId('col-component');
        expect(colElement).toHaveClass('p-0');
        expect(colElement).toHaveClass('me-3');
    });

    it('applies correct image class from imageSetting prop', () => {
        render(<ServiceAdminTop {...defaultProps} imageSetting="success" />);

        const image = screen.getByRole('img');
        expect(image).toHaveClass('bg-success-subtle');
    });

    it('handles different number types correctly', () => {
        const propsWithStringNumber = {
            ...defaultProps,
            number: '100+'
        };

        render(<ServiceAdminTop {...propsWithStringNumber} />);

        expect(screen.getByText('100+')).toBeInTheDocument();
    });

    it('handles zero value correctly', () => {
        const propsWithZero = {
            ...defaultProps,
            number: 0
        };

        render(<ServiceAdminTop {...propsWithZero} />);

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders without colSetting prop', () => {
        const propsWithoutColSetting = {
            imageSource: 'test-image.png',
            number: 42,
            text: 'Total Services',
            imageSetting: 'info'
        };

        render(<ServiceAdminTop {...propsWithoutColSetting} />);

        // Should still render without errors
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Total Services')).toBeInTheDocument();

        // Col should still have the default p-0 class
        const colElement = screen.getByTestId('col-component');
        expect(colElement).toHaveClass('p-0');
    });

    it('renders with different text values', () => {
        const propsWithDifferentText = {
            ...defaultProps,
            text: 'Active Services'
        };

        render(<ServiceAdminTop {...propsWithDifferentText} />);

        expect(screen.getByText('Active Services')).toBeInTheDocument();
        expect(screen.queryByText('Total Services')).not.toBeInTheDocument();
    });

    it('maintains proper structure and hierarchy', () => {
        render(<ServiceAdminTop {...defaultProps} />);

        // Check the structure: Col -> aside -> img + section -> h5 + p
        const heading = screen.getByRole('heading', { level: 5 });
        const paragraph = screen.getByText('Total Services');

        expect(heading).toHaveTextContent('42');
        expect(paragraph).toBeInTheDocument();

        // The image and text should be siblings within the same container
        const aside = screen.getByRole('img').closest('aside');
        expect(aside).toContainElement(screen.getByRole('img'));
        expect(aside).toContainElement(screen.getByText('42'));
        expect(aside).toContainElement(screen.getByText('Total Services'));
    });

    it('applies all expected CSS classes to the aside element', () => {
        render(<ServiceAdminTop {...defaultProps} />);

        const aside = screen.getByRole('img').closest('aside');
        expect(aside).toHaveClass('shadow');
        expect(aside).toHaveClass('p-3');
        expect(aside).toHaveClass('rounded-2');
        expect(aside).toHaveClass('bg-white');
        expect(aside).toHaveClass('d-flex');
        expect(aside).toHaveClass('align-items-center');
    });

    it('renders without any colSetting classes when not provided', () => {
        const propsWithoutColSetting = {
            imageSource: 'test-image.png',
            number: 42,
            text: 'Total Services',
            imageSetting: 'info'
            // No colSetting provided
        };

        render(<ServiceAdminTop {...propsWithoutColSetting} />);

        const colElement = screen.getByTestId('col-component');
        expect(colElement).toHaveClass('p-0'); // Default class from Col
        expect(colElement).not.toHaveClass('me-3'); // Should not have colSetting class
    });
});
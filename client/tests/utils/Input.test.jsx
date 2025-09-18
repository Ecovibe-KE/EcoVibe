import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import Input from '../../src/utils/Input';

describe('Input Component', () => {
    test('renders basic input without label', () => {
        render(<Input/>);
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toBeInTheDocument();
    });

    test('renders input with label', () => {
        render(<Input label="Test Label"/>);
        const labelElement = screen.getByText('Test Label');
        const inputElement = screen.getByRole('textbox');

        expect(labelElement).toBeInTheDocument();
        expect(inputElement).toBeInTheDocument();
        expect(labelElement).toHaveAttribute('for', inputElement.id);
    });

    test('applies custom id when provided', () => {
        render(<Input id="custom-id"/>);
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveAttribute('id', 'custom-id');
    });

    test('generates unique id when not provided', () => {
        render(<Input/>);
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveAttribute('id');
        expect(inputElement.id).not.toBe('');
    });

    test('shows error message and applies error styles', () => {
        render(<Input error="Test error"/>);
        const errorElement = screen.getByText('Test error');
        const inputElement = screen.getByRole('textbox');

        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveAttribute('id', `${inputElement.id}-error`);
        expect(inputElement).toHaveClass('is-invalid');
        expect(inputElement).not.toHaveClass('is-valid');
        expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows success message and applies success styles when no error', () => {
        render(<Input success="Test success"/>);
        const successElement = screen.getByText('Test success');
        const inputElement = screen.getByRole('textbox');

        expect(successElement).toBeInTheDocument();
        expect(successElement).toHaveAttribute('id', `${inputElement.id}-success`);
        expect(inputElement).toHaveClass('is-valid');
        expect(inputElement).not.toHaveClass('is-invalid');
        expect(inputElement).not.toHaveAttribute('aria-invalid');
    });

    test('error takes precedence over success', () => {
        render(<Input error="Test error" success="Test success"/>);
        const errorElement = screen.getByText('Test error');
        const successElement = screen.queryByText('Test success');
        const inputElement = screen.getByRole('textbox');

        expect(errorElement).toBeInTheDocument();
        expect(successElement).not.toBeInTheDocument();
        expect(inputElement).toHaveClass('is-invalid');
        expect(inputElement).not.toHaveClass('is-valid');
    });

    test('applies correct aria-describedby attribute', () => {
        render(<Input error="Test error"/>);
        const inputElement = screen.getByRole('textbox');
        const errorElement = screen.getByText('Test error');

        expect(inputElement).toHaveAttribute('aria-describedby', errorElement.id);
    });

    test('applies aria-describedby with both error and success when both exist', () => {
        render(<Input error="Test error" success="Test success"/>);
        const inputElement = screen.getByRole('textbox');
        const errorElement = screen.getByText('Test error');

        expect(inputElement).toHaveAttribute('aria-describedby', errorElement.id);
    });

    test('applies correct focus styles for error state', () => {
        render(<Input error="Test error"/>);
        const inputElement = screen.getByRole('textbox');

        fireEvent.focus(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(220, 53, 69)');
        expect(inputElement.style.boxShadow).toContain('rgba(220, 53, 69, 0.25)');

        fireEvent.blur(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(220, 53, 69)');
        expect(inputElement.style.boxShadow).toBe('none');
    });

    test('applies correct focus styles for success state', () => {
        render(<Input success="Test success"/>);
        const inputElement = screen.getByRole('textbox');

        fireEvent.focus(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(40, 167, 69)');
        expect(inputElement.style.boxShadow).toContain('rgba(40, 167, 69, 0.25)');

        fireEvent.blur(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(40, 167, 69)');
        expect(inputElement.style.boxShadow).toBe('none');
    });

    test('applies correct focus styles for default state', () => {
        render(<Input/>);
        const inputElement = screen.getByRole('textbox');

        fireEvent.focus(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(55, 177, 55)');
        expect(inputElement.style.boxShadow).toContain('rgba(55, 177, 55, 0.25)');

        fireEvent.blur(inputElement);
        expect(inputElement.style.borderColor).toBe('rgb(206, 212, 218)');
        expect(inputElement.style.boxShadow).toBe('none');
    });

    test('applies disabled state', () => {
        render(<Input disabled/>);
        const inputElement = screen.getByRole('textbox');
        expect(inputElement).toBeDisabled();
    });

    test('applies custom size classes', () => {
        const {rerender} = render(<Input size="sm"/>);
        let inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveClass('form-control-sm');

        rerender(<Input size="lg"/>);
        inputElement = screen.getByRole('textbox');
        expect(inputElement).toHaveClass('form-control-lg');
    });

    test('passes through additional props', () => {
        render(<Input placeholder="Enter text" data-testid="custom-input"/>);
        const inputElement = screen.getByPlaceholderText('Enter text');
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute('data-testid', 'custom-input');
    });

    test('applies custom className to wrapper', () => {
        render(<Input className="custom-wrapper"/>);
        const wrapperElement = screen.getByRole('textbox').closest('div');
        expect(wrapperElement).toHaveClass('custom-wrapper');
    });
});
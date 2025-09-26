import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, test, expect} from 'vitest';
import StatusInfo from '../../src/components/admin/StatusInfo.jsx';

describe('StatusInfo', () => {
    test('should render Active status with correct styles', () => {
        render(<StatusInfo status="Active"/>);

        const badge = screen.getByText('Active');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('badge');
        expect(badge).toHaveStyle({
            backgroundColor: '#e6f7ec',
            color: '#2ca24c',
            padding: '8px 12px',
            borderRadius: '9999px',
            fontWeight: '500'
        });
    });

    test('should render Inactive status with correct styles', () => {
        render(<StatusInfo status="Inactive"/>);

        const badge = screen.getByText('Inactive');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveStyle({
            backgroundColor: '#f1f5f9',
            color: '#64748b'
        });
    });

    test('should render Suspended status with correct styles', () => {
        render(<StatusInfo status="Suspended"/>);

        const badge = screen.getByText('Suspended');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveStyle({
            backgroundColor: '#fff1e6',
            color: '#b45309'
        });
    });

    test('should handle unknown status by defaulting to Inactive styles', () => {
        render(<StatusInfo status="UnknownStatus"/>);

        const badge = screen.getByText('UnknownStatus');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveStyle({
            backgroundColor: '#f1f5f9',
            color: '#64748b'
        });
    });


    test('should apply consistent styling properties to all statuses', () => {
        const statuses = ['Active', 'Inactive', 'Suspended'];

        statuses.forEach(status => {
            const {unmount} = render(<StatusInfo status={status}/>);

            const badge = screen.getByText(status);
            expect(badge).toHaveStyle({
                padding: '8px 12px',
                borderRadius: '9999px',
                fontWeight: '500'
            });

            unmount();
        });
    });

    test('should have correct CSS class', () => {
        render(<StatusInfo status="Active"/>);

        const badge = screen.getByText('Active');
        expect(badge).toHaveClass('badge');
    });

    test('should display the exact status text provided', () => {
        const testStatus = 'CustomStatus';
        render(<StatusInfo status={testStatus}/>);

        const badge = screen.getByText(testStatus);
        expect(badge).toHaveTextContent(testStatus);
    });

    test('should handle case-sensitive status values', () => {
        // Test that status matching is case-sensitive
        render(<StatusInfo status="active"/>); // lowercase

        const badge = screen.getByText('active');
        expect(badge).toHaveStyle({
            backgroundColor: '#f1f5f9', // Should default to Inactive since 'active' !== 'Active'
            color: '#64748b'
        });
    });

    test('should render with correct accessibility attributes', () => {
        render(<StatusInfo status="Active"/>);

        const badge = screen.getByText('Active');
        expect(badge).toBeInTheDocument();
        // The component uses a span which is appropriate for inline status display
        expect(badge.tagName).toBe('SPAN');
    });

    test('should maintain consistent styling across different statuses', () => {
        const statusPalette = {
            Active: {bg: '#e6f7ec', fg: '#2ca24c'},
            Inactive: {bg: '#f1f5f9', fg: '#64748b'},
            Suspended: {bg: '#fff1e6', fg: '#b45309'},
        };

        Object.entries(statusPalette).forEach(([status, colors]) => {
            const {unmount} = render(<StatusInfo status={status}/>);

            const badge = screen.getByText(status);
            expect(badge).toHaveStyle({
                backgroundColor: colors.bg,
                color: colors.fg
            });

            unmount();
        });
    });
});
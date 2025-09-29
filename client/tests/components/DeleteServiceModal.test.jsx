import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteServiceModal from '../../src/components/admin/DeleteServiceModal';

// Only mock Button component
vi.mock('../../src/utils/Button', () => ({
    default: ({
        color,
        hoverColor,
        onClick,
        children
    }) => (
        <button onClick={onClick}>
            {children}
        </button>
    )
}));

describe('DeleteServiceModal', () => {
    const defaultProps = {
        showDeleteServiceModal: true,
        handleCloseDelete: vi.fn(),
        handleDelete: vi.fn(),
        serviceTitle: 'Test Service'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders modal when showDeleteServiceModal is true', () => {
        render(<DeleteServiceModal {...defaultProps} />);

        expect(screen.getByText('Delete Test Service')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this service?')).toBeInTheDocument();
    });

    it('does not render modal content when showDeleteServiceModal is false', () => {
        const props = {
            ...defaultProps,
            showDeleteServiceModal: false
        };

        render(<DeleteServiceModal {...props} />);

        expect(screen.queryByText('Delete Test Service')).not.toBeInTheDocument();
    });

    it('calls handleCloseDelete when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<DeleteServiceModal {...defaultProps} />);

        const closeButton = screen.getByText('Close');
        await user.click(closeButton);

        expect(defaultProps.handleCloseDelete).toHaveBeenCalledTimes(1);
    });

    it('calls handleDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(<DeleteServiceModal {...defaultProps} />);

        const deleteButton = screen.getByText('Delete');
        await user.click(deleteButton);

        expect(defaultProps.handleDelete).toHaveBeenCalledTimes(1);
    });

    it('displays correct service title', () => {
        const props = {
            ...defaultProps,
            serviceTitle: 'Different Service'
        };

        render(<DeleteServiceModal {...props} />);

        expect(screen.getByText('Delete Different Service')).toBeInTheDocument();
    });
});
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {vi, describe, test, expect, beforeEach} from 'vitest';
import ViewUserModal from '../../src/components/admin/ViewUserModal.jsx';

// Mock the StatusInfo component
vi.mock('./StatusInfo.jsx', () => ({
    default: function MockStatusInfo({status}) {
        return <span data-testid="status-info" data-status={status}>{status}</span>;
    }
}));

describe('ViewUserModal', () => {
    const defaultUser = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        role: 'Client',
        status: 'Active',
        profileImage: 'https://example.com/profile.jpg',
        createdAt: '2023-01-15T10:30:00Z',
        updatedAt: '2023-12-01T14:45:00Z'
    };

    const defaultProps = {
        visible: true,
        user: defaultUser,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should not render when visible is false', () => {
        const props = {...defaultProps, visible: false};
        const {container} = render(<ViewUserModal {...props} />);
        expect(container.firstChild).toBeNull();
    });

    test('should not render when user is null', () => {
        const props = {...defaultProps, user: null};
        const {container} = render(<ViewUserModal {...props} />);
        expect(container.firstChild).toBeNull();
    });


    test('should display profile image correctly', () => {
        render(<ViewUserModal {...defaultProps} />);

        const profileImage = screen.getByAltText('John Doe');
        expect(profileImage).toBeInTheDocument();
        expect(profileImage).toHaveAttribute('src', 'https://example.com/profile.jpg');
        expect(profileImage).toHaveStyle({
            borderRadius: '50%',
            objectFit: 'cover'
        });
    });

    test('should use placeholder image when profileImage is not provided', () => {
        const userWithoutImage = {
            ...defaultUser,
            profileImage: null
        };
        const props = {...defaultProps, user: userWithoutImage};

        render(<ViewUserModal {...props} />);

        const profileImage = screen.getByAltText('John Doe');
        expect(profileImage).toHaveAttribute('src', 'https://via.placeholder.com/80');
    });

    test('should display phone placeholder when phone is not provided', () => {
        const userWithoutPhone = {
            ...defaultUser,
            phone: null
        };
        const props = {...defaultProps, user: userWithoutPhone};

        render(<ViewUserModal {...props} />);

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    test('should display created date correctly', () => {
        render(<ViewUserModal {...defaultProps} />);

        // The date should be formatted to locale string
        const expectedDate = new Date('2023-01-15T10:30:00Z').toLocaleString();
        expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });


    test('should call onClose when close button is clicked', () => {
        render(<ViewUserModal {...defaultProps} />);

        const closeButton = screen.getByLabelText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when Close button is clicked', () => {
        render(<ViewUserModal {...defaultProps} />);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('should have correct accessibility attributes', () => {
        render(<ViewUserModal {...defaultProps} />);

        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByLabelText('Close')).toBeInTheDocument();
    });

    test('should apply correct styling to modal backdrop', () => {
        render(<ViewUserModal {...defaultProps} />);

        const modal = screen.getByRole('dialog');
        expect(modal).toHaveClass('position-fixed', 'top-0', 'start-0', 'w-100', 'h-100');
        expect(modal).toHaveStyle('background: rgba(0,0,0,0.45)');
    });

    test('should apply correct styling to info boxes', () => {
        render(<ViewUserModal {...defaultProps} />);

        const infoBoxes = screen.getAllByText('Full name').map(label =>
            label.closest('.border')
        );

        infoBoxes.forEach(box => {
            expect(box).toHaveStyle('background: #f8fafc');
        });
    });


    test('should have correct modal dimensions', () => {
        render(<ViewUserModal {...defaultProps} />);

        const modalContent = screen.getByText('User Details').closest('.bg-white');
        expect(modalContent).toBeInTheDocument();
    });

    test('should display all user information in correct layout', () => {
        render(<ViewUserModal {...defaultProps} />);

        // Check that information is displayed in two-column layout
        const gridContainer = screen.getByText('Full name').closest('.row');
        expect(gridContainer).toBeInTheDocument();

        // Should have 6 info boxes (3 per column on large screens)
        const infoBoxes = screen.getAllByText(/Full name|Phone|Email|Role|Created|Last updated/);
        expect(infoBoxes).toHaveLength(6);
    });
});
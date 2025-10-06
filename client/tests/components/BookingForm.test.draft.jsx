// client/tests/components/BookingForm.hoisted.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Use vi.hoisted to create mocks that are hoisted properly
const { MockBookingModal, MockButton, MockInput, MockSelect, MockOption } = vi.hoisted(() => ({
    MockBookingModal: vi.fn(({ title }) => <div data-testid="modal">{title}</div>),
    MockButton: vi.fn(({ label }) => <button>{label}</button>),
    MockInput: vi.fn(() => <input />),
    MockSelect: vi.fn(() => <select />),
    MockOption: vi.fn(() => <option />)
}));

// Mock dependencies using the hoisted mocks
vi.mock('../../src/components/BookingModal', () => ({
    default: MockBookingModal
}));

vi.mock('../../src/utils/Button', () => ({
    default: MockButton
}));

vi.mock('../../src/utils/Input', () => ({
    default: MockInput,
    Select: MockSelect,
    Option: MockOption
}));

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
        isAdmin: false
    })
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn()
    }
}));

// Import after all mocks
import BookingForm from '../../src/components/BookingForm';

describe('BookingForm with Hoisted Mocks', () => {
    it('should render with hoisted mocks', () => {
        const props = {
            onSubmit: vi.fn(),
            onClose: vi.fn(),
            clients: [],
            services: [{ id: 1, title: 'Test', price: 10, currency: 'USD' }],
            disableService: false
        };

        render(<BookingForm {...props} />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
});
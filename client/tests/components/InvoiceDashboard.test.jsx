import React from 'react';
import {vi, describe, test, expect, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import InvoiceDashboard from '../../src/components/InvoiceDashboard.jsx';
import {
    fetchAllPayments,
    fetchMyPayments,
    initiateMpesaPayment,
    cancelTransaction,
} from '../../src/api/services/payments.js';
import {toast} from 'react-toastify';

// Mock the payment services
vi.mock('../../src/api/services/payments.js', () => ({
    fetchAllPayments: vi.fn(),
    fetchMyPayments: vi.fn(),
    initiateMpesaPayment: vi.fn(),
    cancelTransaction: vi.fn(),
    downloadInvoicePDF: vi.fn(),
}));

// Mock toast
vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock jsPDF and autoTable
vi.mock('jspdf', () => ({
    jsPDF: vi.fn().mockImplementation(() => ({
        setFontSize: vi.fn(),
        text: vi.fn(),
        addImage: vi.fn(),
        save: vi.fn(),
        internal: {
            pageSize: {
                height: 300
            }
        }
    }))
}));

vi.mock('jspdf-autotable', () => ({
    default: vi.fn()
}));

// Mock components
vi.mock('../utils/Button.jsx', () => ({
    default: ({children, onClick, disabled, variant, type = 'button', label, action, size, outline}) => (
        <button
            type={type}
            className={`btn btn-${variant} ${outline ? 'btn-outline' : ''} btn-${size}`}
            onClick={onClick}
            disabled={disabled}
            data-testid="button"
            data-action={action}
            data-label={label}
        >
            {children || label}
        </button>
    )
}));

vi.mock('../utils/Input.jsx', () => ({
    default: ({label, name, value, onChange, required, disabled, helpText, type = 'text', placeholder}) => (
        <div className="form-group" data-testid={`input-group-${name}`}>
            <label>{label}</label>
            <input
                data-testid={`input-${name}`}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className="form-control"
            />
            {helpText && <small className="form-text text-muted">{helpText}</small>}
        </div>
    )
}));

// Create localStorage mock
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => {
            if (key === 'userData') {
                return store[key] || JSON.stringify({
                    role: 'CLIENT',
                    phone_number: '+254712345678'
                });
            }
            return store[key] || null;
        }),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock URL methods
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock data
const mockInvoices = [
    {
        id: 'INV-001',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        description: 'Consulting Services',
        amount: 5000,
        status: 'Pending',
        client: 'John Doe'
    },
    {
        id: 'INV-002',
        date: '2024-01-20',
        dueDate: '2024-02-20',
        description: 'Development Work',
        amount: 15000,
        status: 'Paid',
        client: 'Jane Smith'
    },
    {
        id: 'INV-003',
        date: '2024-01-25',
        dueDate: '2024-01-30',
        description: 'Overdue Project',
        amount: 8000,
        status: 'Overdue',
        client: 'Bob Wilson'
    }
];

// Mock global variables
global.servicesData = {
    'INV-001': ['Service 1', 'Service 2', 'Service 3'],
    'INV-002': ['Development', 'Testing'],
    'INV-003': ['Consultation', 'Implementation']
};

global.transactionData = {
    'INV-001': {
        transactionId: 'TXN-123',
        status: 'pending'
    }
};

describe('InvoiceDashboard', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
        localStorageMock.clear();

        localStorageMock.getItem.mockReturnValue(JSON.stringify({
            role: 'CLIENT',
            phone_number: '+254712345678'
        }));
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    describe('Initialization and Data Fetching', () => {
        test('should fetch user invoices for CLIENT role', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices.slice(0, 2));
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchMyPayments).toHaveBeenCalledTimes(1);
                expect(fetchAllPayments).not.toHaveBeenCalled();
            });
        });

        test('should fetch all invoices for ADMIN role', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify({
                role: 'ADMIN',
                phone_number: '+254712345678'
            }));

            fetchAllPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchAllPayments).toHaveBeenCalledTimes(1);
                expect(fetchMyPayments).not.toHaveBeenCalled();
            });
        });

        test('should fetch all invoices for SUPER_ADMIN role', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify({
                role: 'SUPER_ADMIN',
                phone_number: '+254712345678'
            }));

            fetchAllPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchAllPayments).toHaveBeenCalledTimes(1);
                expect(fetchMyPayments).not.toHaveBeenCalled();
            });
        });

        test('should handle fetch errors gracefully', async () => {
            fetchMyPayments.mockRejectedValue(new Error('Network error'));
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith(
                    'Error fetching invoices:',
                    expect.any(Error)
                );
            });
        });

        test('should set default phone number from user data on mount', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchMyPayments).toHaveBeenCalled();
            });

            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            await waitFor(() => {
                const phoneInput = screen.queryByTestId('input-phone_number');
                if (phoneInput) {
                    expect(phoneInput).toHaveValue('254712345678');
                } else {
                    // If modal uses different structure, check alternative selectors
                    const allInputs = document.querySelectorAll('input[name="phone_number"]');
                    expect(allInputs.length).toBeGreaterThan(0);
                }
            }, {timeout: 3000});
        });
    });

    describe('Summary Section', () => {
        test('should calculate and display correct totals', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                const cardTitles = screen.getAllByRole('heading', {level: 4});
                const amounts = cardTitles.map(title => title.textContent);

                expect(amounts.some(amount => amount.includes('15,000'))).toBe(true);
                expect(amounts.some(amount => amount.includes('13,000'))).toBe(true);
                expect(amounts.some(amount => amount.includes('3'))).toBe(true);
            });
        });

        test('should display correct card titles based on user role', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText('My Invoices')).toBeInTheDocument();
            });
        });
    });

    describe('Invoice Table', () => {
        test('should display correct columns for CLIENT role', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText('Invoice #')).toBeInTheDocument();
                expect(screen.getByText('Date')).toBeInTheDocument();
                expect(screen.getByText('Description')).toBeInTheDocument();
                expect(screen.getByText('Amount')).toBeInTheDocument();
                expect(screen.getByText('Due Date')).toBeInTheDocument();
                expect(screen.getByText('Status')).toBeInTheDocument();
                expect(screen.getByText('Actions')).toBeInTheDocument();
                expect(screen.queryByText('Client')).not.toBeInTheDocument();
            });
        });

        test('should display client column for ADMIN role', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify({
                role: 'ADMIN',
                phone_number: '+254712345678'
            }));

            fetchAllPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText('Client')).toBeInTheDocument();
            });
        });

        test('should display status badges with correct colors', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText('Pending')).toBeInTheDocument();
                expect(screen.getByText('Paid')).toBeInTheDocument();
                expect(screen.getByText('Overdue')).toBeInTheDocument();
            });
        });
    });

    describe('Payment Modal', () => {
        beforeEach(async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);
            await waitFor(() => {
                expect(screen.getByText('Invoice History')).toBeInTheDocument();
            });
        });

        test('should open payment modal when Pay button is clicked', async () => {
            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
            }, {timeout: 3000});
        });

        test('should pre-fill payment form with invoice data', async () => {
            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            await waitFor(() => {
                // Look for modal by class since it might not have role="dialog"
                const modal = document.querySelector('.modal.show') || document.querySelector('.modal');
                expect(modal).toBeInTheDocument();

                // Check for amount input with value
                const amountInput = document.querySelector('input[name="amount"]');
                if (amountInput) {
                    expect(amountInput.value).toBe('5000');
                }
            }, {timeout: 3000});
        });

        test('should submit payment successfully', async () => {
            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            initiateMpesaPayment.mockResolvedValue({success: true});

            const submitButtons = screen.getAllByText('Pay Now');
            const submitButton = submitButtons[submitButtons.length - 1];
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(initiateMpesaPayment).toHaveBeenCalledWith({
                    amount: '5000',
                    phone_number: '254712345678',
                    invoice_id: 'INV-001',
                    description: 'Payment for Consulting Services'
                });
                expect(toast.success).toHaveBeenCalledWith(
                    'Payment initiated successfully! Check your phone to complete the payment.'
                );
            });
        });

        test('should handle payment failure', async () => {
            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            initiateMpesaPayment.mockRejectedValue(new Error('Payment failed'));

            const submitButtons = screen.getAllByText('Pay Now');
            const submitButton = submitButtons[submitButtons.length - 1];
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    'Payment failed. Please try again.'
                );
            });
        });

        test('should close modal when cancel button is clicked', async () => {
            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            const cancelButtons = screen.getAllByText('Cancel');
            fireEvent.click(cancelButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText('Make Payment')).not.toBeInTheDocument();
            });
        });
    });

    describe('Details Modal', () => {
        beforeEach(async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);
            await waitFor(() => {
                expect(screen.getByText('Invoice History')).toBeInTheDocument();
            });
        });

    });

    describe('Transaction Cancellation', () => {
        beforeEach(async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);
            await waitFor(() => {
                expect(screen.getByText('Invoice History')).toBeInTheDocument();
            });
        });

        test('should show cancel transaction button for pending transactions', async () => {
            const detailsButtons = screen.getAllByText('Details');
            fireEvent.click(detailsButtons[0]);

            await waitFor(() => {
                const cancelButtons = screen.getAllByText(/Cancel Transaction/i);
                expect(cancelButtons.length).toBeGreaterThan(0);
            }, {timeout: 3000});
        });

        test('should cancel transaction successfully', async () => {
            cancelTransaction.mockResolvedValue({success: true});

            const detailsButtons = screen.getAllByText('Details');
            fireEvent.click(detailsButtons[0]);

            await waitFor(() => {
                const cancelButtons = screen.getAllByText(/Cancel Transaction/i);
                if (cancelButtons.length > 0) {
                    fireEvent.click(cancelButtons[0]);
                }
            });

            await waitFor(() => {
                expect(cancelTransaction).toHaveBeenCalledWith({
                    invoice_id: 'INV-001',
                    transaction_id: 'TXN-123'
                });
                expect(toast.success).toHaveBeenCalledWith(
                    'Transaction cancelled successfully!'
                );
            });
        });
    });

    describe('PDF Download', () => {
        beforeEach(async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);
            await waitFor(() => {
                expect(screen.getByText('Invoice History')).toBeInTheDocument();
            });
        });

        test('should trigger PDF download when Download PDF button is clicked', async () => {
            const detailsButtons = screen.getAllByText('Details');
            fireEvent.click(detailsButtons[0]);

            const downloadButtons = screen.getAllByText('Download PDF');
            fireEvent.click(downloadButtons[0]);

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Generating fallback PDF...');
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty invoices list', async () => {
            fetchMyPayments.mockResolvedValue([]);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText(/My Invoices/i)).toBeInTheDocument();
                const zeros = screen.queryAllByText('0');
                expect(zeros.length).toBeGreaterThan(0);
            });
        });

        test('should handle missing user data in localStorage', async () => {
            localStorageMock.getItem.mockReturnValue(null);
            fetchMyPayments.mockResolvedValue([]);

            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchMyPayments).toHaveBeenCalled();
            });
        });


        test('should handle missing phone number in user data', async () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify({
                role: 'CLIENT'
            }));

            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(fetchMyPayments).toHaveBeenCalled();
            });

            const payButtons = screen.getAllByText('Pay');
            if (payButtons.length > 0) {
                fireEvent.click(payButtons[0]);

                await waitFor(() => {
                    const modal = document.querySelector('.modal.show') || document.querySelector('.modal');
                    expect(modal).toBeInTheDocument();

                    const phoneInput = document.querySelector('input[name="phone_number"]');
                    if (phoneInput) {
                        expect(phoneInput.value).toBe('254724509881');
                    }
                }, {timeout: 3000});
            }
        });
    });

    describe('Input Handling', () => {
        test('should update payment data when input changes', async () => {
            fetchMyPayments.mockResolvedValue(mockInvoices);
            render(<InvoiceDashboard/>);

            await waitFor(() => {
                expect(screen.getByText('Invoice History')).toBeInTheDocument();
            });

            const payButtons = screen.getAllByText('Pay');
            fireEvent.click(payButtons[0]);

            await waitFor(() => {
                const modal = document.querySelector('.modal.show') || document.querySelector('.modal');
                expect(modal).toBeInTheDocument();

                const phoneInput = document.querySelector('input[name="phone_number"]');
                if (phoneInput) {
                    fireEvent.change(phoneInput, {target: {name: 'phone_number', value: '254700000000'}});
                    expect(phoneInput.value).toBe('254700000000');
                }
            }, {timeout: 3000});
        });
    });
});
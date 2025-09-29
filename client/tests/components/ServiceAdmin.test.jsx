import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServiceAdmin from '../../src/components/admin/ServiceAdmin'

// Mock the dependencies
vi.mock('react-bootstrap', () => ({
    Tab: ({ title, children, eventKey }) => (
        <div data-testid={`tab-${eventKey}`} data-eventkey={eventKey}>
            <div style={{ display: 'none' }}>{title}</div>
            {children}
        </div>
    ),
    Tabs: ({ defaultActiveKey, children, id, className }) => {
        // We'll use a simple approach - just render all children
        // The real tab switching is complex, so we'll test that the content exists
        return (
            <div data-testid="tabs-container" className={className} id={id}>
                <div data-testid="tab-list">
                    {React.Children.map(children, child => (
                        <button
                            key={child.props.eventKey}
                            data-testid={`tab-button-${child.props.eventKey}`}
                            data-eventkey={child.props.eventKey}
                        >
                            {child.props.title}
                        </button>
                    ))}
                </div>
                <div data-testid="tab-content">
                    {React.Children.map(children, child => (
                        <div
                            key={child.props.eventKey}
                            data-testid={`tab-panel-${child.props.eventKey}`}
                            style={{ display: child.props.eventKey === defaultActiveKey ? 'block' : 'none' }}
                        >
                            {child.props.children}
                        </div>
                    ))}
                </div>
            </div>
        );
    },
    Row: ({ children, className }) => <div className={className}>{children}</div>,
    Container: ({ children, className }) => <div className={className}>{children}</div>,
    Col: ({ children }) => <div>{children}</div>,
}))

vi.mock('../../src/api/services/servicemanagement', () => ({
    addService: vi.fn(),
    getServices: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
}))

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}))

vi.mock('../../src/css/ServiceAdmin.css', () => ({}))

// Image mocks
vi.mock('../../src/assets/gears.png', () => ({
    default: 'mocked-gear-image'
}))

vi.mock('../../src/assets/tick.png', () => ({
    default: 'mocked-tick-image'
}))

// Mock child components
vi.mock('../../src/components/admin/ServiceAdminTop', () => ({
    default: ({ number, text }) => (
        <div data-testid="service-admin-top">
            <span data-testid="top-number">{number}</span>
            <span data-testid="top-text">{text}</span>
        </div>
    ),
}))

vi.mock('../../src/components/admin/ServiceAdminMain', () => ({
    default: ({
        serviceTitle,
        serviceStatus,
        handleShowEdit,
        handleShowDelete
    }) => (
        <div data-testid="service-admin-main" data-status={serviceStatus}>
            <h3 data-testid="service-title">{serviceTitle}</h3>
            <span data-testid="service-status">Status: {serviceStatus}</span>
            <button onClick={handleShowEdit} data-testid="edit-button">Edit</button>
            <button onClick={handleShowDelete} data-testid="delete-button">Delete</button>
        </div>
    ),
}))

vi.mock('../../src/components/admin/ServiceForm', () => ({
    default: ({ formTitle, previewUrl }) => (
        <div data-testid="service-form">
            <h2 data-testid="form-title">{formTitle}</h2>
            {previewUrl && <img src={previewUrl} alt="Preview" data-testid="image-preview" />}
        </div>
    ),
}))

vi.mock('../../src/components/admin/EditServiceModal', () => ({
    default: ({ showEditServiceModal, handleCloseEdit, formData }) =>
        showEditServiceModal ? (
            <div data-testid="edit-service-modal">
                <h3>Edit Service: {formData?.serviceTitle}</h3>
                <button onClick={handleCloseEdit}>Close Edit</button>
            </div>
        ) : null,
}))

vi.mock('../../src/components/admin/DeleteServiceModal', () => ({
    default: ({ showDeleteServiceModal, handleCloseDelete, serviceTitle }) =>
        showDeleteServiceModal ? (
            <div data-testid="delete-service-modal">
                <p>Delete {serviceTitle}</p>
                <button onClick={handleCloseDelete}>Close Delete</button>
                <button onClick={handleCloseDelete}>Cancel</button>
            </div>
        ) : null,
}))

describe('ServiceAdmin', () => {
    const mockServices = [
        {
            id: 1,
            name: 'Test Service 1',
            description: 'Test Description 1',
            duration: '1 hr 30 min',
            currency: 'KES',
            price: 100,
            status: 'active',
            image: 'test-image-1.jpg',
        },
        {
            id: 2,
            name: 'Test Service 2',
            description: 'Test Description 2',
            duration: '2 hr 0 min',
            currency: 'KES',
            price: 200,
            status: 'inactive',
            image: 'test-image-2.jpg',
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it('renders without crashing', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue([])

        render(<ServiceAdmin />)

        // Wait for initial render and API call
        await waitFor(() => {
            expect(getServices).toHaveBeenCalledTimes(1)
        })

        // Check if tab buttons are rendered
        expect(screen.getByTestId('tab-button-services')).toHaveTextContent('Services')
        expect(screen.getByTestId('tab-button-add')).toHaveTextContent('Add New Services')

        // Check if default tab content is rendered (Services tab should be visible)
        expect(screen.getByText('All Services')).toBeInTheDocument()
    })

    it('fetches and displays services on component mount', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue(mockServices)

        render(<ServiceAdmin />)

        await waitFor(() => {
            expect(getServices).toHaveBeenCalledTimes(1)
        })

        // Check if services are displayed
        const serviceElements = screen.getAllByTestId('service-admin-main')
        expect(serviceElements).toHaveLength(2)
        expect(screen.getByText('Test Service 1')).toBeInTheDocument()
        expect(screen.getByText('Test Service 2')).toBeInTheDocument()
    })

    it('displays service statistics correctly', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue(mockServices)

        render(<ServiceAdmin />)

        await waitFor(() => {
            const serviceStats = screen.getAllByTestId('service-admin-top')
            expect(serviceStats).toHaveLength(2)

            // Check total services count
            const totalServices = screen.getAllByTestId('top-number')[0]
            const totalServicesText = screen.getAllByTestId('top-text')[0]
            expect(totalServices).toHaveTextContent('2')
            expect(totalServicesText).toHaveTextContent('Total Services')

            // Check active services count  
            const activeServices = screen.getAllByTestId('top-number')[1]
            const activeServicesText = screen.getAllByTestId('top-text')[1]
            expect(activeServices).toHaveTextContent('1')
            expect(activeServicesText).toHaveTextContent('Active Services')
        })
    })

    it('displays empty state when no services available', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue([])

        render(<ServiceAdmin />)

        await waitFor(() => {
            expect(screen.getByText('No Services added')).toBeInTheDocument()
        })
    })

    it('has both tabs available in the DOM', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue([])

        render(<ServiceAdmin />)

        await waitFor(() => {
            // Both tab panels should be in the DOM, but only the active one is visible
            expect(screen.getByTestId('tab-panel-services')).toBeInTheDocument()
            expect(screen.getByTestId('tab-panel-add')).toBeInTheDocument()

            // Services tab should be visible by default
            expect(screen.getByText('All Services')).toBeInTheDocument()

            // Add Services tab content exists but might be hidden
            expect(screen.getByTestId('service-form')).toBeInTheDocument()
            expect(screen.getByTestId('form-title')).toHaveTextContent('Add New Service')
        })
    })

    it('handles service editing flow', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue(mockServices)

        render(<ServiceAdmin />)

        await waitFor(() => {
            const editButtons = screen.getAllByTestId('edit-button')
            fireEvent.click(editButtons[0])
        })

        // Edit modal should be shown
        expect(screen.getByTestId('edit-service-modal')).toBeInTheDocument()
    })

    it('handles service deletion flow', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        getServices.mockResolvedValue(mockServices)

        render(<ServiceAdmin />)

        await waitFor(() => {
            const deleteButtons = screen.getAllByTestId('delete-button')
            fireEvent.click(deleteButtons[0])
        })

        // Delete modal should be shown
        expect(screen.getByTestId('delete-service-modal')).toBeInTheDocument()
    })

    it('handles API errors gracefully', async () => {
        const { getServices } = await import('../../src/api/services/servicemanagement')
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        getServices.mockRejectedValue(new Error('API Error'))

        render(<ServiceAdmin />)

        await waitFor(() => {
            expect(getServices).toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith(new Error('API Error'))
        })

        consoleSpy.mockRestore()
    })
})
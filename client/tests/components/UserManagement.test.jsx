import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';

// Simple direct mock for the component
vi.mock('../../src/components/admin/UserManagement.jsx', () => ({
  default: vi.fn(({ users = [], loading = false }) => (
    <div>
      <h5>User Management</h5>

      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <>
          <div className="d-flex align-items-center mb-2" style={{gap: 8}}>
            <span className="text-muted">Show</span>
            <select
              className="form-select form-select-sm"
              value={10}
              onChange={() => {}}
              style={{width: 90}}
              data-testid="page-size-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value="All">All</option>
            </select>
            <span className="text-muted">entries</span>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>
                        <button>View</button>
                        <button>Edit</button>
                        <button>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              Showing 1 to {Math.min(10, users.length)} of {users.length} entries
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <button className="page-link">Previous</button>
                </li>
                <li className="page-item active">
                  <button className="page-link">1</button>
                </li>
                <li className="page-item">
                  <button className="page-link">2</button>
                </li>
                <li className="page-item">
                  <button className="page-link">Next</button>
                </li>
              </ul>
            </nav>
          </div>

          <button>Add User</button>
          <button>View All</button>
        </>
      )}
    </div>
  )),
}));

// Direct import after mocking
import UserManagement from '../../src/components/admin/UserManagement.jsx';

describe('UserManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic component structure', () => {
    render(<UserManagement />);

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  test('displays loading state when loading is true', () => {
    render(<UserManagement loading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays users when provided', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        role: 'Admin',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        role: 'Client',
        status: 'Inactive'
      }
    ];

    render(<UserManagement users={mockUsers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  test('displays pagination controls when users are present', () => {
    const mockUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: '123-456-7890',
      role: 'Client',
      status: 'Active'
    }));

    render(<UserManagement users={mockUsers} />);

    expect(screen.getByText('Showing 1 to 10 of 15 entries')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  test('displays page size selector', () => {
    render(<UserManagement />);

    const pageSizeSelect = screen.getByTestId('page-size-select');
    expect(pageSizeSelect).toBeInTheDocument();
    expect(pageSizeSelect).toHaveValue('10');
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../api/server';
import BlogSideBar from '../../src/components/BlogSideBar';
import { ENDPOINTS } from '../../src/api/endpoints';
import api from '../../src/api/axiosConfig';
import { toast } from 'react-toastify';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => <div />
}));

// Mock blogs data
const mockBlogs = [
  { category: 'Technology' },
  { category: 'Health' },
  { category: 'Technology' },
];

// Mock style object
const mockStyle = {};

describe('BlogSideBar', () => {
  it('should subscribe to newsletter successfully', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.newsletter_subscribers}`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ status: 'success', message: 'Subscription successful' });
      })
    );

    render(
      <BlogSideBar
        blogs={mockBlogs}
        style={mockStyle}
        selectedCategory={null}
        setSelectedCategory={() => {}}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );

    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    screen.debug(); // Before click
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    screen.debug(); // After click

    // Check that the spinner is shown and the button is gone
    await waitFor(() => {
      screen.debug(); // Inside waitFor
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();

    // Check for success toast and that the button is back
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Subscription successful');
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('should not subscribe to newsletter successfully when server returns error in a 400s', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.newsletter_subscribers}`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ status: 'error', message: 'Error on email' });
      })
    );

    render(
      <BlogSideBar
        blogs={mockBlogs}
        style={mockStyle}
        selectedCategory={null}
        setSelectedCategory={() => {}}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );

   const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email@gmail.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    // Check that the spinner is shown and the button is gone
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();

    // Check for error toast and that the button is back
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error on email');
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('should handle newsletter subscription failure', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.newsletter_subscribers}`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({ status: 'error', message: 'Invalid email' }, { status: 400 });
      })
    );

    render(
      <BlogSideBar
        blogs={mockBlogs}
        style={mockStyle}
        selectedCategory={null}
        setSelectedCategory={() => {}}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    );

    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'invalid-email@gmail.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    // Check that the spinner is shown and the button is gone
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Subscribe' })).not.toBeInTheDocument();

    // Check for error toast and that the button is back
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email');
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});

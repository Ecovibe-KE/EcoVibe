/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/components/App';

// Add matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 1. Mock dependencies
// Mock the custom hook to track calls to logEvent
const mockLogEvent = vi.fn();
vi.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({
    logEvent: mockLogEvent,
  })),
}));

// Mock the Button component
vi.mock("../../src/utils/Button", () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
  ActionButton: ({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

// Mock window.alert to prevent it from blocking tests and to track calls
global.alert = vi.fn();

// 2. Test suite for the App component
describe('App component', () => {
  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    mockLogEvent.mockClear();
    global.alert.mockClear();
  });

  // Helper function to render App with Router
  const renderAppWithRouter = () => {
    return render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
  };

  test('logs screen_view event on mount', () => {
    renderAppWithRouter(); // Use the helper function

    // Check if the mock was called at least once (might be called multiple times)
    expect(mockLogEvent).toHaveBeenCalled();

    // Check if it was called with the specific event
    expect(mockLogEvent).toHaveBeenCalledWith('screen_view', {
      firebase_screen: 'Home Page',
      firebase_screen_class: 'App',
    });
  });
});
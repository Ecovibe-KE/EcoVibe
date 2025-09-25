/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/components/App';
import { UserContext } from '../../src/context/UserContext'; // adjust path if needed

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

// Mock dependencies
const mockLogEvent = vi.fn();
vi.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(() => ({
    logEvent: mockLogEvent,
  })),
}));

vi.mock("../../src/utils/Button", () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
  ActionButton: ({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

global.alert = vi.fn();

describe('App component', () => {
  const mockUserContext = { user: null, setUser: vi.fn() };

  beforeEach(() => {
    mockLogEvent.mockClear();
    global.alert.mockClear();
  });

  // Helper to render App with Router + UserContext
  const renderAppWithProviders = () =>
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    );

  test('logs screen_view event on mount', () => {
    renderAppWithProviders();

    expect(mockLogEvent).toHaveBeenCalled();
    expect(mockLogEvent).toHaveBeenCalledWith('screen_view', {
      firebase_screen: '/',
      firebase_screen_class: 'App',
    });
  });
});

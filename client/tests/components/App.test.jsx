/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import App from '../../src/components/App';

// 1. Mock dependencies
// Mock the custom hook to track calls to logEvent
const mockLogEvent = vi.fn();
vi.mock('../../src/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    logEvent: mockLogEvent,
  }),
}));

// Mock the ActionButton to track its props and simulate clicks
const mockActionButton = vi.fn();
vi.mock('../../src/utils/button/Button', () => ({
  ActionButton: (props) => {
    mockActionButton(props);
    // Render a simple button to allow clicking
    return <button onClick={props.onClick}>{props.label}</button>;
  },
}));

// Mock window.alert to prevent it from blocking tests and to track calls
global.alert = vi.fn();

// 2. Test suite for the App component
describe('App component', () => {
  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    mockLogEvent.mockClear();
    mockActionButton.mockClear();
    global.alert.mockClear();
  });

  test('renders initial welcome messages', () => {
    render(<App />);
    expect(screen.getByText('Welcome to Ecovibe')).toBeInTheDocument();
    expect(screen.getByText('Something good is coming soon!')).toBeInTheDocument();
  });

  test('logs screen_view event on mount', () => {
    render(<App />);
    expect(mockLogEvent).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith('screen_view', {
      firebase_screen: 'Home Page',
      firebase_screen_class: 'App',
    });
  });

  test('renders ActionButtons with correct props', () => {
    render(<App />);
    
    // Check props for "Add Item" button
    expect(mockActionButton).toHaveBeenCalledWith(expect.objectContaining({
      label: "Add Item",
      action: "add",
      variant: "solid",
      showIcon: false,
    }));

    // Check props for "Update Item" button
    expect(mockActionButton).toHaveBeenCalledWith(expect.objectContaining({
      label: "Update Item",
      action: "update",
      variant: "outlined",
    }));

    // Check props for "Delete Item" button
    expect(mockActionButton).toHaveBeenCalledWith(expect.objectContaining({
      label: "Delete Item",
      action: "delete",
      variant: "solid",
    }));

    // Check props for "View Item" button
    expect(mockActionButton).toHaveBeenCalledWith(expect.objectContaining({
      label: "View Item",
      action: "view",
      variant: "outlined",
    }));
  });

  describe('button interactions and state management', () => {
    test('increments count when "Add Item" button is clicked', () => {
      render(<App />);
      // Find buttons by their text, which is their label
      const addButton = screen.getByText('Add Item');
      const viewButton = screen.getByText('View Item');

      fireEvent.click(addButton);
      fireEvent.click(viewButton);

      expect(global.alert).toHaveBeenCalledWith('Current count is 1');
    });

    test('increments count when "Update Item" button is clicked', () => {
      render(<App />);
      const updateButton = screen.getByText('Update Item');
      const viewButton = screen.getByText('View Item');

      fireEvent.click(updateButton);
      fireEvent.click(viewButton);

      expect(global.alert).toHaveBeenCalledWith('Current count is 1');
    });

    test('decrements count when "Delete Item" button is clicked', () => {
      render(<App />);
      const deleteButton = screen.getByText('Delete Item');
      const viewButton = screen.getByText('View Item');

      fireEvent.click(deleteButton);
      fireEvent.click(viewButton);

      expect(global.alert).toHaveBeenCalledWith('Current count is -1');
    });

    test('shows an alert with the correct count when "View Item" button is clicked', () => {
      render(<App />);
      const viewButton = screen.getByText('View Item');
      const addButton = screen.getByText('Add Item');

      // 1. Check initial count
      fireEvent.click(viewButton);
      expect(global.alert).toHaveBeenCalledWith('Current count is 0');
      expect(global.alert).toHaveBeenCalledTimes(1);

      // 2. Check count after multiple increments
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(viewButton);
      expect(global.alert).toHaveBeenCalledWith('Current count is 2');
      expect(global.alert).toHaveBeenCalledTimes(2); // Called once before, once now
    });
  });
});
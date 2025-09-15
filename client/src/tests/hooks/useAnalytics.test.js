import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../../hooks/useAnalytics';

// Mock the 'firebase/analytics' module
vi.mock('firebase/analytics', async() => {
    const actual = await vi.importActual('firebase/analytics');
    return {
        ...actual,
    logEvent: vi.fn(),
    }
});

import { logEvent as firebaseLogEvent } from 'firebase/analytics';

// Mock our own firebaseConfig to provide a mutable analytics instance
let analyticsInstance = { app: 'mock-app' };
vi.mock('../../firebaseConfig', () => ({
  get analytics() {
    return analyticsInstance;
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    // Reset mocks and the analytics instance before each test
    vi.clearAllMocks();
    analyticsInstance = { app: 'mock-app' };
  });

  it('should call firebase logEvent with the correct parameters', () => {
    // ARRANGE: Render the hook
    const { result } = renderHook(() => useAnalytics());
    const eventName = 'button_click';
    const eventParams = { button_name: 'buy_now' };

    // ACT: Call the logEvent function
    act(() => {
      result.current.logEvent(eventName, eventParams);
    });

    // ASSERT: Check if the mocked function was called correctly
    expect(firebaseLogEvent).toHaveBeenCalledOnce();
  });

  it('should not throw an error and should log to console if analytics is not initialized', () => {
    // ARRANGE: Set analytics to null for this specific test
    analyticsInstance = null;
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useAnalytics());

    // ACT & ASSERT
    expect(() => {
      result.current.logEvent('some_event', {});
    }).not.toThrow();

    expect(firebaseLogEvent).toHaveBeenCalled();
    
    // Clean up the spy
    consoleErrorSpy.mockRestore();
  });
});

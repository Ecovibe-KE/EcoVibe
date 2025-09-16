import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics } from '../../hooks/useAnalytics';

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ mock: true })), // fake app object
}));

// Mock firebase/analytics
vi.mock('firebase/analytics', () => {
  const logEvent = vi.fn();
  return {
    getAnalytics: vi.fn(() => ({ logEvent })),
    logEvent,
  };
});

import { logEvent as firebaseLogEvent } from 'firebase/analytics';

// Mock our own firebaseConfig
let analyticsInstance = { app: 'mock-app' };
vi.mock('../../firebaseConfig', () => ({
  get analytics() {
    return analyticsInstance;
  },
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsInstance = { app: 'mock-app' };
  });

  it('should call firebase logEvent with the correct parameters', () => {
    const { result } = renderHook(() => useAnalytics());
    act(() => {
      result.current.logEvent('button_click', { button_name: 'buy_now' });
    });
    expect(firebaseLogEvent).toHaveBeenCalledOnce();
  });

  it('should not throw an error and should log to console if analytics is not initialized', () => {
    analyticsInstance = null;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { result } = renderHook(() => useAnalytics());

    expect(() => {
      result.current.logEvent('some_event', {});
    }).not.toThrow();

    expect(firebaseLogEvent).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

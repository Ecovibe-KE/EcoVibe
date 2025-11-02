import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './api/server.js';
import { handlers } from './api/handlers.js';

import { vi } from "vitest";

// Mock matchMedia for React-Bootstrap / useMediaQuery
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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


/**
 * Starts the mock server before all tests run.
 * `onUnhandledRequest: 'error'` ensures that any request without a
 * corresponding handler will cause the test to fail, helping to catch
 * unexpected network requests.
 */
beforeAll(() => server.listen({
  onUnhandledRequest: 'error',
}));

/**
 * Resets the request handlers after each test to ensure test isolation.
 * This prevents handlers added or modified in one test from affecting others.
 */
afterEach(() => {
  server.resetHandlers(...handlers);
});

/**
 * Closes the mock server after all tests have completed to clean up.
 */
afterAll(() => server.close());
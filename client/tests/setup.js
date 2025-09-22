import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './api/server.js';
import { handlers } from './api/handlers.js';

beforeAll(() => server.listen({
  onUnhandledRequest: 'error',
}));
afterEach(() => {
  server.resetHandlers(...handlers);
});
afterAll(() => server.close());
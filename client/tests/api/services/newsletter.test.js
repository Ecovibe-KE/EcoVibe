import { describe, it, expect, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { subscribeNewsletter } from '../../../src/api/services/newsletter';
import { ENDPOINTS } from '../../../src/api/endpoints';
import api from '../../../src/api/axiosConfig';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

describe('newsletter service', () => {

  afterEach(() => {
    server.resetHandlers();
  });

  it('should subscribe newsletter successfully', async () => {
    const email = 'test@example.com';
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.newsletter_subscribers}`, () => {
        return HttpResponse.json({ message: 'Subscription successful' });
      })
    );

    const response = await subscribeNewsletter(email);
    expect(response.message).toBe('Subscription successful');
  });

  it('should handle server errors', async () => {
    const email = 'test@example.com';
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.newsletter_subscribers}`, () => {
        return new HttpResponse(
          null, 
          { status: 500, statusText: 'Internal Server Error' }
        );
      })
    );
    await expect(subscribeNewsletter(email)).rejects.toThrow('Request failed with status code 500');
  });
});

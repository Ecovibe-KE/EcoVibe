import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { addUsers } from '../../../src/api/services/usermanagement.js';
import { ENDPOINTS } from '../../../src/api/endpoints';
import api from '../../../src/api/axiosConfig';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

describe('user service', () => {

  it('should handle server errors', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.users}`, () => {
        return new HttpResponse(
          null,
          { status: 500, statusText: 'Internal Server Error' }
        );
      })
    );
    const clientData = { username: 'testuser', password: 'password' };
    await expect(addUsers(clientData)).rejects.toBe('Request failed with status code 500');
  });
});
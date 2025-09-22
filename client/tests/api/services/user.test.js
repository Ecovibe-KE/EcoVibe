import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../server';
import { createUser } from '../../../src/api/services/user';
import { ENDPOINTS } from '../../../src/api/endpoints';

const BASE_URL = "http://localhost:5000/api";

describe('user service', () => {
  it('should create a user successfully', async () => {
    const clientData = { username: 'testuser', password: 'password' };
    const response = await createUser(clientData);
    expect(response.message).toBe('User created successfully');
  });

  it('should handle server errors', async () => {
    server.use(
      http.post(`${BASE_URL}${ENDPOINTS.register}`, () => {
        return new HttpResponse(
          null, 
          { status: 500, statusText: 'Internal Server Error' }
        );
      })
    );
    const clientData = { username: 'testuser', password: 'password' };
    await expect(createUser(clientData)).rejects.toBe('Request failed with status code 500');
  });
});
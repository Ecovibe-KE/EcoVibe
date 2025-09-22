import { http, HttpResponse } from 'msw';

const API_BASE_URL = "http://localhost:5000/api/";

export const handlers = [
  http.post(`${API_BASE_URL}register`, () => {
    return HttpResponse.json({ message: 'User created successfully' });
  }),
];
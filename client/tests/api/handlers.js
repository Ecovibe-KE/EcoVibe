import {http, HttpResponse} from 'msw';
import api from '../../src/api/axiosConfig';
import {ENDPOINTS} from '../../src/api/endpoints';

const API_BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

export const handlers = [
    http.post(`${API_BASE_URL}${ENDPOINTS.register}`, () => {
        return HttpResponse.json({message: 'User created successfully'});
    }),
    http.post(`${API_BASE_URL}${ENDPOINTS.newsletter_subscribers}`, () => {
        return HttpResponse.json({message: 'Subscription successful'});
    }),
    http.post(`${API_BASE_URL}${ENDPOINTS.quote}`, () => {
        return HttpResponse.json({message: 'Quote Submitted successful'});
    }),
];
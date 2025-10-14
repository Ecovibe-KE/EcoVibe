import {describe, it, expect, vi, beforeEach} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '../server';
import {
    sendQuoteRequest
} from '../../../src/api/services/quote.js';
import {ENDPOINTS} from '../../../src/api/endpoints';
import api from '../../../src/api/axiosConfig';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

describe('sendQuoteRequest', () => {
    const mockContactData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        company: "Test Corp",
        service: "Policy Framework",
        projectDetails: "Policy Framework"
    };

    const mockSuccessResponse = {
        id: 'quote-123',
        status: 'received',
        message: 'Quote request submitted successfully'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset MSW handlers to default
        server.resetHandlers();
    });

    it('should successfully send a quote request', async () => {
        // Arrange
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return HttpResponse.json(mockSuccessResponse, { status: 200 });
            })
        );

        // Act
        const result = await sendQuoteRequest(mockContactData);

        // Assert
        expect(result).toEqual(mockSuccessResponse);
    });

    it('should send the correct contact data in the request', async () => {
        // Arrange
        let receivedBody = null;
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, async ({ request }) => {
                receivedBody = await request.json();
                return HttpResponse.json(mockSuccessResponse, { status: 200 });
            })
        );

        // Act
        await sendQuoteRequest(mockContactData);

        // Assert
        expect(receivedBody).toEqual(mockContactData);
    });

    it('should handle server errors (500)', async () => {
        // Arrange
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        // Act & Assert
        await expect(sendQuoteRequest(mockContactData)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
        // Arrange
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return HttpResponse.error();
            })
        );

        // Act & Assert
        await expect(sendQuoteRequest(mockContactData)).rejects.toThrow();
    });

    it('should handle 400 Bad Request with validation errors', async () => {
        // Arrange
        const validationErrors = {
            errors: {
                email: 'Invalid email format',
                name: 'Name is required'
            }
        };
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return HttpResponse.json(validationErrors, { status: 400 });
            })
        );

        // Act & Assert
        await expect(sendQuoteRequest(mockContactData)).rejects.toThrow();
    });

    it('should handle 404 Not Found', async () => {
        // Arrange
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return new HttpResponse(null, { status: 404 });
            })
        );

        // Act & Assert
        await expect(sendQuoteRequest(mockContactData)).rejects.toThrow();
    });

    it('should handle 429 Too Many Requests', async () => {
        // Arrange
        server.use(
            http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                return new HttpResponse(null, {
                    status: 429,
                    headers: {
                        'Retry-After': '60'
                    }
                });
            })
        );

        // Act & Assert
        await expect(sendQuoteRequest(mockContactData)).rejects.toThrow();
    });


    describe('with different form data scenarios', () => {
        it('should handle minimal required fields', async () => {
            // Arrange
            const minimalData = {
                name: "Jane Doe",
                email: "jane@example.com",
                service: "Consulting",
                projectDetails: "Basic consultation"
            };

            let receivedBody = null;
            server.use(
                http.post(`${BASE_URL}${ENDPOINTS.quote}`, async ({ request }) => {
                    receivedBody = await request.json();
                    return HttpResponse.json(mockSuccessResponse, { status: 200 });
                })
            );

            // Act
            await sendQuoteRequest(minimalData);

            // Assert
            expect(receivedBody).toEqual(minimalData);
        });

        it('should handle optional fields as empty strings', async () => {
            // Arrange
            const dataWithOptionalFields = {
                name: "Jane Doe",
                email: "jane@example.com",
                phone: "",
                company: "",
                service: "Web Development",
                projectDetails: "Project details"
            };

            let receivedBody = null;
            server.use(
                http.post(`${BASE_URL}${ENDPOINTS.quote}`, async ({ request }) => {
                    receivedBody = await request.json();
                    return HttpResponse.json(mockSuccessResponse, { status: 200 });
                })
            );

            // Act
            await sendQuoteRequest(dataWithOptionalFields);

            // Assert
            expect(receivedBody).toEqual(dataWithOptionalFields);
        });

        it('should handle special characters in fields', async () => {
            // Arrange
            const specialCharData = {
                name: 'María José Martínez',
                email: 'maria.jose@example.com',
                phone: '+1 (555) 123-4567',
                company: 'Compañía & Sons ©',
                service: 'Web Development',
                projectDetails: 'Project with <html> & special chars "quotes"'
            };

            let receivedBody = null;
            server.use(
                http.post(`${BASE_URL}${ENDPOINTS.quote}`, async ({ request }) => {
                    receivedBody = await request.json();
                    return HttpResponse.json(mockSuccessResponse, { status: 200 });
                })
            );

            // Act
            await sendQuoteRequest(specialCharData);

            // Assert
            expect(receivedBody).toEqual(specialCharData);
        });

        it('should handle different service types', async () => {
            // Arrange
            const services = [
                'Web Development',
                'Mobile App Development',
                'UI/UX Design',
                'Consulting',
                'Maintenance'
            ];

            for (const service of services) {
                const serviceData = {
                    ...mockContactData,
                    service: service
                };

                let receivedBody = null;
                server.use(
                    http.post(`${BASE_URL}${ENDPOINTS.quote}`, async ({ request }) => {
                        receivedBody = await request.json();
                        return HttpResponse.json(mockSuccessResponse, { status: 200 });
                    })
                );

                // Act
                await sendQuoteRequest(serviceData);

                // Assert
                expect(receivedBody.service).toBe(service);
            }
        });
    });

    describe('form validation scenarios', () => {
        it('should handle invalid email format', async () => {
            // Arrange
            const invalidEmailData = {
                ...mockContactData,
                email: 'invalid-email'
            };

            server.use(
                http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                    return HttpResponse.json({
                        error: 'Invalid email format'
                    }, { status: 400 });
                })
            );

            // Act & Assert
            await expect(sendQuoteRequest(invalidEmailData)).rejects.toThrow();
        });

        it('should handle missing required fields', async () => {
            // Arrange - Missing name and email
            const missingFieldsData = {
                phone: "+1234567890",
                company: "Test Corp",
                service: "Web Development",
                projectDetails: "Project details"
            };

            server.use(
                http.post(`${BASE_URL}${ENDPOINTS.quote}`, () => {
                    return HttpResponse.json({
                        errors: {
                            name: 'Name is required',
                            email: 'Email is required'
                        }
                    }, { status: 400 });
                })
            );

            // Act & Assert
            await expect(sendQuoteRequest(missingFieldsData)).rejects.toThrow();
        });
    });
});
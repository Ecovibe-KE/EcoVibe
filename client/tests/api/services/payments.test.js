import {describe, it, expect, afterEach, vi, beforeEach} from 'vitest';
import {http, HttpResponse} from 'msw';
import {server} from '../server';
import {
    fetchAllPayments,
    fetchMyPayments,
    initiateMpesaPayment,
    cancelTransaction,
    fetchPaymentStatus,
    fetchTransactionHistory,
    verifyPayment,
    downloadInvoicePDF
} from '../../../src/api/services/payments.js';
import {ENDPOINTS} from '../../../src/api/endpoints';
import api from '../../../src/api/axiosConfig';

const BASE_URL = String(api.defaults.baseURL || "").replace(/\/$/, "");

// Add global MSW error handling to prevent unhandled request errors
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterAll(() => {
  server.close();
});

describe('Payment Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('fetchAllPayments', () => {
    it('should fetch all payments successfully', async () => {
      const mockPayments = [{id: 1, amount: 100}, {id: 2, amount: 200}];

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.allPayments}`, () => {
          return HttpResponse.json({
            data: {
              invoices: mockPayments // Changed from 'payments' to 'invoices'
            }
          });
        })
      );

      const result = await fetchAllPayments();
      expect(result).toEqual(mockPayments);
    });

    it('should return empty array when payments not found in response', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.allPayments}`, () => {
          return HttpResponse.json({
            data: {} // Different structure to trigger the warning
          });
        })
      );

      const result = await fetchAllPayments();
      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.allPayments}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await fetchAllPayments();
      expect(result).toEqual([]);
    });
  });

  describe('fetchMyPayments', () => {
    it('should fetch user payments successfully', async () => {
      const mockUserPayments = [{id: 1, amount: 100, user_id: 123}];

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.myPayments}`, () => {
          return HttpResponse.json({
            data: {
              invoices: mockUserPayments // Changed from 'payments' to 'invoices'
            }
          });
        })
      );

      const result = await fetchMyPayments();
      expect(result).toEqual(mockUserPayments);
    });

    it('should return empty array when user payments not found in response', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.myPayments}`, () => {
          return HttpResponse.json({
            data: {} // Different structure to trigger the warning
          });
        })
      );

      const result = await fetchMyPayments();
      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.myPayments}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await fetchMyPayments();
      expect(result).toEqual([]);
    });
  });

  describe('initiateMpesaPayment', () => {
    it('should initiate M-Pesa payment successfully', async () => {
      const paymentData = {
        amount: 100,
        phone_number: '254712345678',
        invoice_id: 'inv_123',
        description: 'Test payment'
      };

      const mockResponse = {CheckoutRequestID: 'ws_CO_123', ResponseCode: '0'};

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.mpesaStkPush}`, async () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await initiateMpesaPayment(paymentData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      const paymentData = {
        amount: 100,
        phone_number: '254712345678',
        invoice_id: 'inv_123',
        description: 'Test payment'
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.mpesaStkPush}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(initiateMpesaPayment(paymentData)).rejects.toThrow();
    });
  });

  // ... rest of your test cases remain the same
  describe('cancelTransaction', () => {
    it('should cancel transaction successfully', async () => {
      const transactionData = {
        invoice_id: 'inv_123',
        transaction_id: 'txn_456'
      };

      const mockResponse = {message: 'Transaction cancelled successfully'};

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.cancelTransaction}`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await cancelTransaction(transactionData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      const transactionData = {
        invoice_id: 'inv_123',
        transaction_id: 'txn_456'
      };

      server.use(
        http.post(`${BASE_URL}${ENDPOINTS.cancelTransaction}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(cancelTransaction(transactionData)).rejects.toThrow();
    });
  });

  describe('fetchPaymentStatus', () => {
    it('should fetch payment status successfully', async () => {
      const invoiceId = 'inv_123';
      const mockResponse = {status: 'completed', amount: 100};

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.paymentStatus}/${invoiceId}`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await fetchPaymentStatus(invoiceId);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      const invoiceId = 'inv_123';

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.paymentStatus}/${invoiceId}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(fetchPaymentStatus(invoiceId)).rejects.toThrow();
    });
  });

  describe('fetchTransactionHistory', () => {
    it('should fetch transaction history without user ID successfully', async () => {
      const mockTransactions = [{id: 1, amount: 100}, {id: 2, amount: 200}];

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.transactionHistory}`, () => {
          return HttpResponse.json({
            data: {
              transactions: mockTransactions
            }
          });
        })
      );

      const result = await fetchTransactionHistory();
      expect(result).toEqual(mockTransactions);
    });

    it('should fetch transaction history with user ID successfully', async () => {
      const userId = 'user_123';
      const mockTransactions = [{id: 1, amount: 100, user_id: userId}];

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.transactionHistory}`, ({ request }) => {
          const url = new URL(request.url);
          const user_id = url.searchParams.get('user_id');

          if (user_id === userId) {
            return HttpResponse.json({
              data: {
                transactions: mockTransactions
              }
            });
          }

          return new HttpResponse(null, { status: 404 });
        })
      );

      const result = await fetchTransactionHistory(userId);
      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array when transactions not found in response', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.transactionHistory}`, () => {
          return HttpResponse.json({
            data: {} // Different structure to trigger the warning
          });
        })
      );

      const result = await fetchTransactionHistory();
      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.transactionHistory}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const result = await fetchTransactionHistory();
      expect(result).toEqual([]);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const transactionId = 'txn_123';
      const mockResponse = {verified: true, transaction_id: transactionId};

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.verifyPayment}/${transactionId}`, () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await verifyPayment(transactionId);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on API failure', async () => {
      const transactionId = 'txn_123';

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.verifyPayment}/${transactionId}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(verifyPayment(transactionId)).rejects.toThrow();
    });
  });

  describe('downloadInvoicePDF', () => {
    it('should download invoice PDF successfully', async () => {
      const invoiceId = 'inv_123';
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.invoicePDF}/${invoiceId}`, () => {
          return new HttpResponse(mockBlob, {
            headers: {
              'Content-Type': 'application/pdf'
            }
          });
        })
      );

      const result = await downloadInvoicePDF(invoiceId);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw error on API failure', async () => {
      const invoiceId = 'inv_123';

      server.use(
        http.get(`${BASE_URL}${ENDPOINTS.invoicePDF}/${invoiceId}`, () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      await expect(downloadInvoicePDF(invoiceId)).rejects.toThrow();
    });
  });
});
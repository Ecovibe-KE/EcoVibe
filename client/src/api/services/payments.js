import { ENDPOINTS } from "../endpoints";
import api from "../axiosConfig";

// Fetch all payments (for ADMIN/SUPER_ADMIN)
export const fetchAllPayments = async () => {
  try {
    const response = await api.get(ENDPOINTS.allPayments);
    if (response.data && response.data.data && response.data.data.payments) {
      console.log("Payments found:", response.data.data.payments);
      return response.data.data.payments;
    } else {
      console.warn("Payments array not found in expected location");
      return [];
    }
  } catch (error) {
    console.error("API Error fetching payments:", error);
    return [];
  }
};

// Fetch user's payments (for CLIENT)
export const fetchMyPayments = async () => {
  try {
    const response = await api.get(ENDPOINTS.myPayments);
    if (response.data && response.data.data && response.data.data.payments) {
      console.log("User payments found:", response.data.data.payments);
      return response.data.data.payments;
    } else {
      console.warn("User payments array not found in expected location");
      return [];
    }
  } catch (error) {
    console.error("API Error fetching user payments:", error);
    return [];
  }
};

// Initiate M-Pesa STK Push payment
export const initiateMpesaPayment = async (paymentData) => {
  try {
    const payload = {
      amount: paymentData.amount,
      phone_number: paymentData.phone_number,
      invoice_id: paymentData.invoice_id,
      description: paymentData.description,
    };

    const response = await api.post(ENDPOINTS.mpesaStkPush, payload);
    console.log("M-Pesa payment initiated:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error initiating M-Pesa payment:", error);
    throw error;
  }
};

// Cancel transaction
export const cancelTransaction = async (transactionData) => {
  try {
    const payload = {
      invoice_id: transactionData.invoice_id,
      transaction_id: transactionData.transaction_id,
    };

    const response = await api.post(ENDPOINTS.cancelTransaction, payload);
    console.log("Transaction cancelled:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error cancelling transaction:", error);
    throw error;
  }
};

// Fetch payment status
export const fetchPaymentStatus = async (invoiceId) => {
  try {
    const response = await api.get(`${ENDPOINTS.paymentStatus}/${invoiceId}`);
    console.log("Payment status:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error fetching payment status:", error);
    throw error;
  }
};

// Fetch transaction history for a user
export const fetchTransactionHistory = async (userId = null) => {
  try {
    const endpoint = userId
      ? `${ENDPOINTS.transactionHistory}?user_id=${userId}`
      : ENDPOINTS.transactionHistory;

    const response = await api.get(endpoint);
    if (
      response.data &&
      response.data.data &&
      response.data.data.transactions
    ) {
      console.log(
        "Transaction history found:",
        response.data.data.transactions,
      );
      return response.data.data.transactions;
    } else {
      console.warn("Transactions array not found in expected location");
      return [];
    }
  } catch (error) {
    console.error("API Error fetching transaction history:", error);
    return [];
  }
};

// Verify payment
export const verifyPayment = async (transactionId) => {
  try {
    const response = await api.get(
      `${ENDPOINTS.verifyPayment}/${transactionId}`,
    );
    console.log("Payment verification:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error verifying payment:", error);
    throw error;
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (invoiceId) => {
  try {
    const response = await api.get(`${ENDPOINTS.invoicePDF}/${invoiceId}`, {
      responseType: "blob",
    });
    console.log("PDF downloaded for invoice:", invoiceId);
    return response.data;
  } catch (error) {
    console.error("API Error downloading PDF:", error);
    throw error;
  }
};

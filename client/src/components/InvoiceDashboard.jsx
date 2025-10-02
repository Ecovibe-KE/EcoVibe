import React, { useState, useEffect, useCallback } from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";
import {
  fetchAllPayments,
  fetchMyPayments,
  initiateMpesaPayment,
  cancelTransaction,
} from "../api/services/payments.js";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const InvoiceDashboard = () => {
  // Get user data from localStorage or context
  const userData =
    typeof localStorage !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || '{"role":"CLIENT"}')
      : { role: "CLIENT" };

  const currentUserRole = userData.role;
  const currentUserPhone = userData.phone_number;

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    phone_number: "",
    invoice_id: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [cancellingTransaction, setCancellingTransaction] = useState(null);

  const [servicesData, setServicesData] = useState({});
  const [transactionData, setTransactionData] = useState({});

  const fetchInvoices = useCallback(async () => {
    try {
      let invoicesData;
      if (currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN") {
        invoicesData = await fetchAllPayments();
      } else {
        invoicesData = await fetchMyPayments();
      }
      setInvoices(invoicesData);

      if (invoicesData && Array.isArray(invoicesData)) {
        const services = {};
        const transactions = {};

        invoicesData.forEach((invoice) => {
          if (invoice.services && Array.isArray(invoice.services)) {
            services[invoice.id] = invoice.services;
          }

          if (invoice.transaction) {
            transactions[invoice.id] = {
              transactionId: invoice.transaction.id,
              status: invoice.transaction.status,
            };
          }
        });

        setServicesData(services);
        setTransactionData(transactions);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoice data");
    }
  }, [currentUserRole]);

  useEffect(() => {
    fetchInvoices();

    if (currentUserPhone) {
      setPaymentData((prev) => ({
        ...prev,
        phone_number: currentUserPhone.replace("+", ""), // Remove + for M-Pesa format
      }));
    }
  }, [currentUserPhone, fetchInvoices]);

  const calculateTotals = () => {
    const totalPaid = invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const outstanding = invoices
      .filter((inv) => inv.status === "Pending" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);

    return { totalPaid, outstanding };
  };

  const { totalPaid, outstanding } = calculateTotals();

  const handlePayClick = (invoice) => {
    setSelectedInvoice(invoice);
    if (!currentUserPhone) {
      toast.error("Phone number not found. Please update your profile.");
      return;
    }
    setPaymentData({
      amount: invoice.amount.toString(),
      phone_number: currentUserPhone.replace("+", ""),
      invoice_id: invoice.id,
      description: `Payment for ${invoice.description}`,
    });
    setShowPaymentModal(true);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await initiateMpesaPayment(paymentData);

      // Handle successful payment initiation
      console.log("Payment initiated:", response);

      // Show success message
      toast.success(
        "Payment initiated successfully! Check your phone to complete the payment.",
      );

      setShowPaymentModal(false);

      // Refresh invoices to get updated transaction data
      fetchInvoices();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransaction = async (invoiceId) => {
    setCancellingTransaction(invoiceId);

    try {
      const transaction = transactionData[invoiceId];
      const cancelData = {
        invoice_id: invoiceId,
        transaction_id: transaction?.transactionId,
      };

      await cancelTransaction(cancelData);

      toast.success("Transaction cancelled successfully!");

      // Refresh invoices to get updated data
      fetchInvoices();
    } catch (error) {
      console.error("Cancel transaction error:", error);
      toast.error("Failed to cancel transaction. Please try again.");
    } finally {
      setCancellingTransaction(null);
    }
  };

  const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (err) => {
        reject(err);
      };
    });
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      toast.success("Generating fallback PDF...");

      const doc = new jsPDF();

      try {
        // Load logo from /public/logo.png
        const logoBase64 = await getBase64ImageFromURL("/logo.png");
        doc.addImage(logoBase64, "PNG", 14, 10, 30, 30); // position & size
      } catch (e) {
        console.warn("Logo not found or failed to load:", e);
      }

      // Title
      doc.setFontSize(18);
      doc.text("Invoice", 105, 20, { align: "center" });

      // Invoice details
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${invoice.id}`, 14, 50);
      doc.text(`Date: ${invoice.date}`, 14, 57);
      doc.text(`Due Date: ${invoice.dueDate}`, 14, 64);
      doc.text(`Status: ${invoice.status}`, 14, 71);

      // Amount
      doc.setFontSize(14);
      doc.text(`Amount: Ksh ${invoice.amount.toLocaleString()}`, 14, 85);

      // Description
      doc.setFontSize(12);
      doc.text("Description:", 14, 100);
      doc.text(invoice.description || "-", 14, 107);

      // Services table - use actual data from API
      const services = servicesData[invoice.id] || [];
      if (services.length > 0) {
        autoTable(doc, {
          startY: 120,
          head: [["#", "Service"]],
          body: services.map((service, index) => [index + 1, service]),
          theme: "grid",
        });
      } else {
        doc.text("No additional services.", 14, 120);
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        "This is not the final official receipt.\n Please request the official receipt from the support team.",
        14,
        pageHeight - 14,
      );

      // Save PDF
      doc.save(`${invoice.id}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Error generating PDF");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Paid: "success",
      Pending: "warning",
      Overdue: "danger",
      Draft: "secondary",
    };

    return (
      <span className={`badge bg-${statusColors[status] || "secondary"}`}>
        {status}
      </span>
    );
  };

  const getTransactionStatusBadge = (status) => {
    const statusColors = {
      completed: "success",
      pending: "warning",
      failed: "danger",
    };

    return status ? (
      <span className={`badge bg-${statusColors[status] || "secondary"}`}>
        {status}
      </span>
    ) : null;
  };

  const renderServices = (invoiceId) => {
    const services = servicesData[invoiceId] || [];

    return (
      <div className="mt-3">
        <h6>Services</h6>
        {services.length > 0 ? (
          <ul className="list-unstyled">
            {services.map((service, index) => (
              <li key={index}>✅ {service}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No services listed</p>
        )}
      </div>
    );
  };

  const renderPaymentModal = () => {
    if (!showPaymentModal) return null;

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Make Payment</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPaymentModal(false)}
                disabled={loading}
              ></button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                {selectedInvoice && (
                  <div className="mb-3">
                    <strong>Invoice Details:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      <p>
                        <strong>Invoice #:</strong> {selectedInvoice.id}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {selectedInvoice.description}
                      </p>
                      <p>
                        <strong>Due Date:</strong> {selectedInvoice.dueDate}
                      </p>
                      <p>
                        <strong>Amount:</strong> Ksh{" "}
                        {selectedInvoice.amount.toLocaleString()}
                      </p>
                      <p>
                        <strong>Services:</strong>
                      </p>
                      <ul>
                        {servicesData[selectedInvoice.id]?.map(
                          (service, index) => <li key={index}>✅ {service}</li>,
                        ) || <li>No services listed</li>}
                      </ul>
                    </div>
                  </div>
                )}

                <Input
                  type="number"
                  label="Amount (KES)"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                  required
                  disabled
                />

                <Input
                  type="tel"
                  label="M-Pesa Phone Number"
                  name="phone_number"
                  value={paymentData.phone_number}
                  onChange={handleInputChange}
                  placeholder="254724509881"
                  required
                  helpText="Enter your M-Pesa registered phone number"
                />

                <Input
                  type="text"
                  label="Payment Description"
                  name="description"
                  value={paymentData.description}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>
              <div className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="success" disabled={loading}>
                  {loading ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedInvoice) return null;

    const transaction = transactionData[selectedInvoice.id];

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Invoice Details - {selectedInvoice.id}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDetailsModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Invoice Date</strong>
                        </td>
                        <td>{selectedInvoice.date}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Due Date</strong>
                        </td>
                        <td>{selectedInvoice.dueDate}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Amount</strong>
                        </td>
                        <td>Ksh {selectedInvoice.amount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Status</strong>
                        </td>
                        <td>{getStatusBadge(selectedInvoice.status)}</td>
                      </tr>
                      {transaction && transaction.transactionId && (
                        <>
                          <tr>
                            <td>
                              <strong>Transaction ID</strong>
                            </td>
                            <td>{transaction.transactionId}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Transaction Status</strong>
                            </td>
                            <td>
                              {getTransactionStatusBadge(transaction.status)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {renderServices(selectedInvoice.id)}

              {/* Transaction Actions */}
              {transaction && transaction.status === "pending" && (
                <div className="mt-4 p-3 border rounded">
                  <h6>Transaction Actions</h6>
                  <p className="text-muted">
                    You have a pending transaction for this invoice.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => handleCancelTransaction(selectedInvoice.id)}
                    disabled={cancellingTransaction === selectedInvoice.id}
                  >
                    {cancellingTransaction === selectedInvoice.id
                      ? "Cancelling..."
                      : "Cancel Transaction"}
                  </Button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button
                variant="primary"
                onClick={() => handleDownloadPDF(selectedInvoice)}
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoiceDetails = (invoice) => {
    if (!invoice) return null;

    const transaction = transactionData[invoice.id];

    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5>Invoice Details - {invoice.id}</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td>
                      <strong>Invoice Date</strong>
                    </td>
                    <td>
                      <strong>Due Date</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>{invoice.date}</td>
                    <td>{invoice.dueDate}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Amount</strong>
                    </td>
                    <td>
                      <strong>Status</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Ksh {invoice.amount.toLocaleString()}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                  </tr>
                  {transaction && transaction.transactionId && (
                    <>
                      <tr>
                        <td>
                          <strong>Transaction ID</strong>
                        </td>
                        <td>
                          <strong>Transaction Status</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>{transaction.transactionId}</td>
                        <td>{getTransactionStatusBadge(transaction.status)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {renderServices(invoice.id)}

          <div className="mt-3">
            {(invoice.status === "Pending" || invoice.status === "Overdue") && (
              <Button
                variant="success"
                onClick={() => handlePayClick(invoice)}
                className="me-2"
              >
                Pay Now
              </Button>
            )}

            {transaction && transaction.status === "pending" && (
              <Button
                variant="danger"
                onClick={() => handleCancelTransaction(invoice.id)}
                disabled={cancellingTransaction === invoice.id}
              >
                {cancellingTransaction === invoice.id
                  ? "Cancelling..."
                  : "Cancel Transaction"}
              </Button>
            )}

            <Button
              variant="primary"
              onClick={() => handleDownloadPDF(invoice)}
              className="ms-2"
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      {/* Summary Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h4 className="card-title">Ksh {totalPaid.toLocaleString()}</h4>
              <p className="card-text">Total Paid</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h4 className="card-title">Ksh {outstanding.toLocaleString()}</h4>
              <p className="card-text">Outstanding</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h4 className="card-title">{invoices.length}</h4>
              <p className="card-text">
                {currentUserRole === "CLIENT"
                  ? "My Invoices"
                  : "Total Invoices"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details for selected invoice */}
      {selectedInvoice && renderInvoiceDetails(selectedInvoice)}

      {/* Invoice History */}
      <div className="card">
        <div className="card-header">
          <h5>Invoice History</h5>
          <p className="text-muted mb-0">
            {currentUserRole === "CLIENT"
              ? "Your invoice history"
              : "All client invoices"}
          </p>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  {currentUserRole !== "CLIENT" && <th>Client</th>}
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    {currentUserRole !== "CLIENT" && <td>{invoice.client}</td>}
                    <td>
                      <strong>{invoice.id}</strong>
                    </td>
                    <td>{invoice.date}</td>
                    <td>{invoice.description}</td>
                    <td>Ksh {invoice.amount.toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          invoice.status === "Overdue"
                            ? "text-danger fw-bold"
                            : ""
                        }
                      >
                        {invoice.dueDate}
                      </span>
                    </td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>
                      <div className="btn-group">
                        <Button
                          action="view"
                          label="Details"
                          onClick={() => handleViewDetails(invoice)}
                          size="sm"
                          outline
                        />
                        {(invoice.status === "Pending" ||
                          invoice.status === "Overdue") && (
                          <Button
                            action="add"
                            label="Pay"
                            onClick={() => handlePayClick(invoice)}
                            size="sm"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderPaymentModal()}
      {renderDetailsModal()}
    </div>
  );
};

export default InvoiceDashboard;

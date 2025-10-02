export const ENDPOINTS = {
  // Ping
  ping: "/ping",

  // Auth
  register: "/register",
  login: "/login",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // Contact
  contact: "/contact",

  // Verify
  verify: "/verify",
  resendVerification: "/resend-verification",

  // Blog
  blogs: "/blogs",
  blogById: (id) => `/blogs/${id}`,
  adminBlogs: "/admin/blogs",

  // Users
  users: "/users",
  userManagement: "/user-management",

  // Newsletter
  newsletter_subscribers: "/newsletter-subscribers",

  // Profile
  me: "/me",
  changePassword: "/change-password",

  // Payments & Invoices
  allPayments: "/api/invoices",
  myPayments: "/api/invoices",
  mpesaStkPush: "/api/mpesa/stk-push",
  cancelTransaction: "/api/transaction/cancel",
  paymentStatus: "/payments/status",
  transactionHistory: "/payments/transactions",
  verifyPayment: "/payments/verify",
  invoicePDF: "/invoices/pdf",

  // New endpoints for invoice management
  invoices: "/api/invoices",
  invoiceById: (id) => `/api/invoices/${id}`,
  payments: "/api/payments",
  paymentById: (id) => `/api/payments/${id}`,

  // Services
  services: "/services",

  // Add more endpoints as needed here
};
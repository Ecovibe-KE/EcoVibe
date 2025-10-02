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


   // Tickets
  tickets: "/tickets",
  ticketById: (id) => `/tickets/${id}`,
  ticketMessages: (id) => `/tickets/${id}/messages`,
  ticketStats: "/tickets/stats",


  // Payments & Invoices
  allPayments: "/invoices",
  myPayments: "/clientInvoices",
  mpesaStkPush: "/mpesa/stk-push",
  cancelTransaction: "/transaction/cancel",
  paymentStatus: "/payments/status",
  transactionHistory: "/payments/transactions",
  verifyPayment: "/payments/verify",
  invoicePDF: "/invoices/pdf",

  // New endpoints for invoice management
  payments: "/payments",

  // Services
  services: "/services",

  // Add more endpoints as needed here
};



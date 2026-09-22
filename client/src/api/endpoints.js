export const ENDPOINTS = {
  // Ping
  ping: "/ping",

  // Dashboard
  dashboard: "/dashboard",

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

  // Resource Centre
  documents: "/documents",

  // Profile
  me: "/me",
  changePassword: "/change-password",

  // Bookings
  bookings: "/bookings",
  bookingById: (id) => `/bookings/${id}`,

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
  payments: "/payments",

  // Services
  services: "/services",

  // Quote
  quote: "/quote",

  // Partnerships & Funding
  partnerships: "/partnerships",
  partnershipById: (id) => `/partnerships/${id}`,
  partnershipStatus: (id) => `/partnerships/${id}/status`,
};

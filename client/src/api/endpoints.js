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

  // All payments
  allPayments: "/payments/all",
  myPayments: "/payments/my-payments",
  mpesaStkPush: "/mpesa/stk-push",
  cancelTransaction: "/mpesa/cancel-transaction",
  paymentStatus: "/payments/status",
  transactionHistory: "/payments/transactions",
  verifyPayment: "/payments/verify",
  invoicePDF: "/invoices/pdf",

  // Add more endpoints as needed here

  // services
  services: "/services",
};

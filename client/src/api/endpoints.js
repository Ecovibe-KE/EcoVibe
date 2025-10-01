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

  // services
  services: "/services",

   // Tickets
  tickets: "/tickets",
  ticketById: (id) => `/tickets/${id}`,
  ticketMessages: (id) => `/tickets/${id}/messages`,
  ticketStats: "/tickets/stats",

};

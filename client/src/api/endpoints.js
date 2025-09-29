export const ENDPOINTS = {
  // Ping
  ping: "/ping",
  // Auth
  register: "/register",
  // Contact
  contact: "/contact",
  //verify
  verify: "/verify",
  resendVerification: "/resend-verification",
  // Blog
  blogs: "/blogs",
  blogById: (id) => `/blogs/${id}`,

  //Login
  login: "/login",

  //forgot-password
  forgotPassword: "/forgot-password",

  // users
  users: "/users",
  userManagement: "/user-management",

  // newsletter
  newsletter_subscribers: "/newsletter-subscribers",

  // Profile
  me: "/me",
  // Change password

  changePassword: "/change-password",

  // Add more endpoints as needed here
};

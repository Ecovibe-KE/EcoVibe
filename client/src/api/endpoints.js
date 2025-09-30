export const ENDPOINTS = {
  // Ping
  ping: "/ping",
  // Auth
  register: "/register",
  // Contact
  contact: "/contact",
  //verify
  verify: "/verify",
  // Blog
  blogs: "/blogs",
  blogById: (id) => `/blogs/${id}`,

  // users
  users: "/users",
  userManagement: "/user-management",

  // newsletter
  newsletter_subscribers: "/newsletter-subscribers",

  // resource centre
  documents: "/api/documents",
  // Add more endpoints as needed here
};

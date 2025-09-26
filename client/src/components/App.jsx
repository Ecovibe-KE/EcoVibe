import React, { useEffect, useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { UserContext } from "../context/UserContext.jsx";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import Footer from "./Footer.jsx";
import Homepage from "./Homepage";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import AboutUs from "./AboutUs.jsx";
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import UserManagement from "./admin/UserManagement.jsx";
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import SignUpForm from "./Signup.jsx";

// Lazy-loaded
const PrivacyPolicy = lazy(() => import("./PrivacyPolicy.jsx"));

// --- Layouts ---
const PublicLayout = () => (
  <div>
    <NavBar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Sidebar is already inside TopNavbar, so we don’t import Sidebar separately
const ManagementLayout = ({ navItems, userData }) => (
  <div className="flex h-screen">
    {/* TopNavbar also handles Sidebar internally */}
    <TopNavbar navItems={navItems} userData={userData} />
    <div className="flex flex-col flex-1">
      <main className="p-4 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  const { logEvent } = useAnalytics();
  const { user } = useContext(UserContext);
  const location = useLocation();

  // Track page views
  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  // Protect management routes
  const managementRoutes = [
    "/dashboard",
    "/bookings",
    "/resources",
    "/profile",
    "/payments",
    "/blog",
    "/services",
    "/dashboard/about",
    "/users",
    "/tickets",
  ];
  const isManagementRoute = managementRoutes.some((route) =>
    location.pathname.startsWith(route)
  );
  if (isManagementRoute && !user) {
    return <Navigate to="/login" replace />;
  }

  // Sidebar items per role
  const clientNavItems = [
    { to: "/dashboard/main", label: "Main" },
    { to: "/dashboard/bookings", label: "Bookings" },
    { to: "/dashboard/resources", label: "Resource Center" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/payments", label: "Payment History" },
    { to: "/dashboard/tickets", label: "Tickets" },
  ];

  const adminNavItems = [
    { to: "/dashboard/main", label: "Dashboard" },
    { to: "/dashboard/bookings", label: "Bookings" },
    { to: "/dashboard/resources", label: "Resources" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/payments", label: "Payments" },
    { to: "/dashboard/blog", label: "Blog Management" },
    { to: "/dashboard/services", label: "Service Management" },
    { to: "/dashboard/about", label: "About Us Management" },
    { to: "/dashboard/users", label: "User Management" },
    { to: "/dashboard/tickets", label: "Tickets" },
  ];

  return (
    <>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Management routes */}
          <Route
            element={
              <ManagementLayout
                navItems={user?.role === "Client" ? clientNavItems : adminNavItems}
                userData={user}
              />
            }
          >
            <Route path="/dashboard" element={<p>Dashboard Main</p>} />
            <Route path="/dashboard/bookings" element={<p>Bookings</p>} />
            <Route path="/dashboard/resources" element={<p>Resources</p>} />
            <Route path="/dashboard/profile" element={<p>Profile</p>} />
            <Route path="/dashboard/payments" element={<p>Payments</p>} />
            <Route
              path="/dashboard/blog"
              element={
                user?.role !== "Client" ? <p>Blog</p> : <Navigate to="/dashboard" replace />
              }
            />
            <Route
              path="/dashboard/services"
              element={
                user?.role !== "Client" ? <p>Services</p> : <Navigate to="/dashboard" replace />
              }
            />
            <Route
              path="/dashboard/about"
              element={
                user?.role !== "Client" ? (
                  <p>About (management)</p>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/dashboard/users"
              element={
                user?.role !== "Client" ? (
                  <UserManagement />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route path="/dashboard/tickets" element={<p>Tickets</p>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;

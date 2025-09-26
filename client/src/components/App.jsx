// App.jsx
import React, { useEffect, useContext, Suspense } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import NavBar from "./Navbar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import Footer from "./Footer.jsx";
import Homepage from "./Homepage";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import AboutUs from "./AboutUs.jsx";
import Blog from "./Blog.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import UserManagement from "./admin/UserManagement.jsx";
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { useAnalytics } from "../hooks/useAnalytics";

const PrivacyPolicy = React.lazy(() => import("./PrivacyPolicy.jsx"));

// Footer wrapper with page type
function FooterWrapper() {
  const location = useLocation();
  const pageType = React.useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/blog")) return "blog";
    if (path.startsWith("/services")) return "services";
    if (path.startsWith("/contact")) return "contact";
    return "landing";
  }, [location.pathname]);
  return <Footer pageType={pageType} />;
}

function App() {
  const { logEvent } = useAnalytics();
  const { user } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  // Management routes
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

  // Redirect unauthorized users
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
      {isManagementRoute ? (
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <TopNavbar
                  navItems={user.role === "Client" ? clientNavItems : adminNavItems}
                  userData={user}
                />
              }
            >
              <Route index element={<p>Dashboard Main</p>} />
              <Route path="bookings" element={<p>Bookings</p>} />
              <Route path="resources" element={<p>Resources</p>} />
              <Route path="profile" element={<p>Profile</p>} />
              <Route path="payments" element={<p>Payments</p>} />
              <Route
                path="blog"
                element={user.role !== "Client" ? <p>Blog</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="services"
                element={user.role !== "Client" ? <p>Services</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="about"
                element={user.role !== "Client" ? <p>About (management)</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="users"
                element={user.role !== "Client" ? <UserManagement /> : <Navigate to="/dashboard" replace />}
              />
              <Route path="tickets" element={<p>Tickets</p>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      ) : (
        // Public routes with NavBar and Footer
        <Routes>
          <Route
            element={
              <>
                <NavBar />
                <Outlet />
                <FooterWrapper />
              </>
            }
          >
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/privacy" element={<Suspense><PrivacyPolicy /></Suspense>} />
             <Route path="/login" element={<Login />} />
             <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      {/* Global Toast */}
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

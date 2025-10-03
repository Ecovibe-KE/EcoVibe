import { useAuth } from "../context/AuthContext";
import RequireRole from "../wrappers/RequireRole";
import Unauthorized from "../wrappers/Unauthorized";
import { Outlet } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAnalytics } from "../hooks/useAnalytics";

// Core layout and components
import NavBar from "./Navbar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import FooterWrapper from "./FooterWrapper.jsx";

// Public pages
import Homepage from "./Homepage.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import AboutUs from "./AboutUs.jsx";
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import SignUpForm from "./Signup.jsx";
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ProfilePage from "./ProfilePage.jsx";
import ResetPassword from "./ResetPassword.jsx";
import ClientTickets from "./ClientTickets.jsx";
import Footer from "./Footer.jsx";

// Admin pages
import UserManagement from "./admin/UserManagement.jsx";
import BlogManagementUi from "./admin/BlogManagment.jsx";
import ServiceAdmin from "./admin/ServiceAdmin.jsx";
import AdminTickets from "./admin/AdminTickets.jsx";
import InvoiceDashboard from "./InvoiceDashboard.jsx";

// Lazy loaded page
const PrivacyPolicy = lazy(() => import("./PrivacyPolicy.jsx"));

// Dashboard wrapper (for protected pages)
function DashboardLayout() {
  return (
    <>
      <TopNavbar />
    </>
  );
}

function App() {
  const location = useLocation();
  const { logEvent } = useAnalytics();

  // Track route changes with analytics
  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

    // Protects routes based on auth + account status
  const PrivateRoute = ({ children }) => {
    const { user, isInactive, isSuspended, isHydrating } = useAuth();

    // ⏳ Wait until AuthContext finishes hydration
    if (isHydrating) {
      return <div className="p-4">Loading…</div>;
      // or return null, or your spinner component
    }

    if (!user) return <Navigate to="/login" replace />;
    if (isInactive) return <Navigate to="/verify" replace />;
    if (isSuspended) return <Navigate to="/unauthorized" replace />;

    return <>{children}</>;
  };

  return (
    <>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <Routes>
          {/* =======================
              DASHBOARD (Protected)
          ======================= */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <TopNavbar />
              </PrivateRoute>
            }
          >
            {/* General dashboard pages - any active user */}
            <Route
              index
              element={
                <div className="p-4">
                  <h2>Dashboard Main</h2>
                  <p>Welcome to your dashboard!</p>
                </div>
              }
            />
            <Route
              path="main"
              element={
                <div className="p-4">
                  <h2>Dashboard Main</h2>
                  <p>Welcome to your dashboard!</p>
                </div>
              }
            />
            <Route
              path="bookings"
              element={
                <div className="p-4">
                  <h2>Bookings</h2>
                  <p>Manage your bookings here.</p>
                </div>
              }
            />
            <Route
              path="resources"
              element={
                <div className="p-4">
                  <h2>Resources</h2>
                  <p>Access your resources.</p>
                </div>
              }
            />
            <Route
              path="profile"
              element={
                <div className="p-4">
                  <h2>Profile</h2>
                  <ProfilePage />
                </div>
              }
            />
            <Route
              path="payments"
              element={
                <div className="p-4">
                  <h2>Payments</h2>
                  <InvoiceDashboard />
                </div>
              }
            />
            <Route
              path="tickets"
              element={
                <div className="p-4">
                  <h2>Ticktes</h2>
                  <ClientTickets />
                </div>
              }
            />

            {/* Role-restricted dashboard pages */}
            <Route
              path="services"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ServiceAdmin />
                </RequireRole>
              }
            />
            <Route
              path="users"
              element={
                <RequireRole allowedRoles={["admin", "super_admin"]}>
                  <UserManagement />
                </RequireRole>
              }
            />
            <Route
              path="blog"
              element={
                <RequireRole allowedRoles={["admin", "super_admin"]}>
                  <BlogManagementUi />
                </RequireRole>
              }
            />

            <Route
              path="about"
              element={
                <div className="p-4">
                  <h2>About Management</h2>
                  <p>Update about information.</p>
                </div>
              }
            />
            <Route
              path="tickets"
              element={
                <div className="p-4">
                  <h2>Tickets</h2>
                  <p>Manage support tickets.</p>
                </div>
              }
            />
            <Route
              path="tickets/admin"
              element={
                <RequireRole allowedRoles={["admin", "super_admin"]}>
                  <AdminTickets />
                </RequireRole>
              }
            />
          </Route>

          {/* =======================
              PUBLIC ROUTES
          ======================= */}
          <Route
            path="/"
            element={
              <>
                <NavBar />
                <Homepage />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <>
                <NavBar />
                <Homepage />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <NavBar />
                <SignUpForm />
              </>
            }
          />
          <Route
            path="/playground"
            element={
              <>
                <NavBar />
                <Playground />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <NavBar />
                <Contact />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <NavBar />
                <AboutUs />
              </>
            }
          />
          <Route
            path="/verify"
            element={
              <>
                <NavBar />
                <VerifyPage />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <NavBar />
                <Blog />
              </>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <>
                <NavBar />
                <BlogPost />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <NavBar />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <NavBar />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <NavBar />
                <Terms />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <NavBar />
                <Login />
              </>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <>
                <NavBar />
                <ForgotPassword />
              </>
            }
          />
          <Route
            path="/reset-password"
            element={
              <>
                <NavBar />
                <ResetPassword />
              </>
            }
          />
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Shared footer for public pages */}
      <FooterWrapper />

      {/* Global toast notifications */}
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
import Homepage from "./components/Homepage"; // ✅ Corrected path
import { useEffect, Suspense } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Logout from "./pages/Logout"; // We might replace with a button + context
import PasswordReset from "./pages/PasswordReset";

// ✅ NEW AUTH IMPORTS
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboard from "./pages/ClientDashboard";

function App() {
  const { logEvent } = useAnalytics();
  const location = useLocation();

  const managementRoutes = [
    "/dashboard",
    "/bookings",
    "/resources",
    "/profile",
    "/payments",
    "/blog",
    "/services",
    "/mgmtabout",
    "/users",
    "/tickets",
  ];

  const isManagementRoute = managementRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  return (
    <AuthProvider>
      <>
        {/* Show NavBar only for non-management routes */}
        {!isManagementRoute && <NavBar />}

        {isManagementRoute ? (
          <div className="d-flex vh-100">
            <NavPanel />
            <main role="main" className="flex-fill bg-light overflow-auto">
              <Suspense fallback={<div className="p-4">Loading…</div>}>
                <Routes>
                  <Route path="/dashboard/*" element={<p>Dashboard</p>} />
                  <Route path="/bookings/*" element={<p>Bookings</p>} />
                  <Route path="/resources/*" element={<p>Resources</p>} />
                  <Route path="/profile/*" element={<p>Profile</p>} />
                  <Route path="/payments/*" element={<p>Payments</p>} />
                  <Route path="/blog/*" element={<p>Blog</p>} />
                  <Route path="/services/*" element={<p>Services</p>} />
                  <Route path="/mgmtabout/*" element={<p>About (management)</p>} />
                  <Route path="/users/*" element={<p>Users</p>} />
                  <Route path="/tickets/*" element={<p>Tickets</p>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        ) : (
          /* Public routes - normal layout */
          <Routes>
            <Route index element={<Homepage />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/about" element={<p>About (Public)</p>} />

            {/* ✅ AUTH ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        )}

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
    </AuthProvider>
  );
}

export default App;

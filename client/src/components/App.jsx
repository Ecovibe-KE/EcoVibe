import Homepage from "./Homepage";
import { useEffect, Suspense } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import UserManagement from "./admin/UserManagement.jsx";
import TopNavbar from "./TopNavbar.jsx";
import AboutUs from "./AboutUs.jsx";

function App() {
  const { logEvent } = useAnalytics();
  const location = useLocation();

  const isManagementRoute = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  return (
    <>
      {/* Non-management routes - show NavBar */}
      {!isManagementRoute && <NavBar />}

      {/* Management routes - show NavPanel layout */}
      {isManagementRoute ? (
        <div className="d-flex vh-100">
          <NavPanel />
          <div className="flex-fill d-flex flex-column">
            <TopNavbar />
            <main
              role="main"
              className="flex-fill bg-light overflow-auto"
              style={{ marginTop: "70px" }}
            >
              <Suspense fallback={<div className="p-4">Loading…</div>}>
                <Routes>
                  <Route path="/dashboard" element={<p>Dashboard Main</p>} />
                  <Route path="/dashboard/bookings" element={<p>Bookings</p>} />
                  <Route path="/dashboard/resources" element={<p>Resources</p>} />
                  <Route path="/dashboard/profile" element={<p>Profile</p>} />
                  <Route path="/dashboard/payments" element={<p>Payments</p>} />
                  <Route path="/dashboard/blog" element={<p>Blog</p>} />
                  <Route path="/dashboard/services" element={<p>Services</p>} />
                  <Route path="/dashboard/about" element={<p>About (management)</p>} />
                  <Route path="/dashboard/users" element={<UserManagement />} />
                  <Route path="/dashboard/tickets" element={<p>Tickets</p>} />
                  <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      ) : (
        /* Public routes - normal layout */
        <Routes>
          <Route index element={<Homepage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}

      {/* Reusable toast */}
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

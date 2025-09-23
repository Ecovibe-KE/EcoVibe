import Homepage from "./Homepage";
import { useEffect, Suspense } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
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
      {/*  Non-management paths - show NavBar*/}
      {!isManagementRoute && <NavBar />}

      {/* Management routes - show NavPanel layout */}
      {isManagementRoute ? (
        <div className="d-flex vh-100">
          <NavPanel />
          <main role="main" className="flex-fill bg-light overflow-auto">
            <Suspense fallback={<div className="p-4">Loading…</div>}>
              <Routes>
                <Route path="/dashboard" element={<Outlet />}>
                  <Route path="main" element={<p>Dashboard</p>} />
                  <Route index element={<Navigate to="main" replace />} />
                  <Route path="bookings/*" element={<p>Bookings</p>} />
                  <Route path="resources/*" element={<p>Resources</p>} />
                  <Route path="profile/*" element={<p>Profile</p>} />
                  <Route path="payments/*" element={<p>Payments</p>} />
                  <Route path="blog/*" element={<p>Blog</p>} />
                  <Route path="services/*" element={<p>Services</p>} />
                  <Route path="about/*" element={<p>About (management)</p>} />
                  <Route path="users/*" element={<p>Users</p>} />
                  <Route path="tickets/*" element={<p>Tickets</p>} />
                  <Route path="*" element={<Navigate to="main" replace />} />
                </Route>
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
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}
      {/*Reusable toast*/}
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

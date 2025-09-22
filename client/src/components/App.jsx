import { useEffect, useMemo, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAnalytics } from "../hooks/useAnalytics";

import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Homepage from "./Homepage.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import About from "./About.jsx";
import Blog from "./Blog.jsx";
import Footer from "./Footer.jsx";

// Footer Wrapper to detect page type
function FooterWrapper() {
  const location = useLocation();

  const pageType = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/blog")) return "blog";
    if (path.startsWith("/services")) return "services";
    if (path.startsWith("/contact")) return "contact";
    return "landing";
  }, [location.pathname]);

  if (import.meta.env?.MODE === "development") {
    console.debug("Rendering FooterWrapper with pageType:", pageType);
  }

  return <Footer pageType={pageType} />;
}

function App() {
  const location = useLocation();
  const { logEvent } = useAnalytics();

  // Management routes list
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
    location.pathname.startsWith(route),
  );

  // Analytics event
  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  return (
    <>
      {/* NavBar for public routes */}
      {!isManagementRoute && <NavBar />}

      {/* Management layout */}
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
                <Route
                  path="/mgmtabout/*"
                  element={<p>About (management)</p>}
                />
                <Route path="/users/*" element={<p>Users</p>} />
                <Route path="/tickets/*" element={<p>Tickets</p>} />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      ) : (
        /* Public layout */
        <Routes>
          <Route index element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}

      {/* Toast Notifications */}
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

      {/* Footer */}
      {!isManagementRoute && <FooterWrapper />}
    </>
  );
}

export default App;

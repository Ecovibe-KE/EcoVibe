import Homepage from "./Homepage";
import { useEffect, useMemo, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import About from "./About";
import Blog from "./Blog";
import Footer from "./Footer.jsx";

// Landing Page Component
function LandingPage() {
  return (
    <div className="container-fluid">
      <p>Welcome to Ecovibe</p>
      <p>Something good is coming soon!</p>
    </div>
  );
}

// Client Page Component
function ClientPage() {
  return (
    <div className="container-fluid">
      <h1>Client Dashboard</h1>
      <p>This is where client-specific content will go.</p>
    </div>
  );
}

// Footer Wrapper to dynamically detect page type
function FooterWrapper() {
  const location = useLocation();
  const pageType = useMemo(
    () => (location.pathname.startsWith("/client") ? "client" : "landing"),
    [location.pathname]
  );

  if (import.meta.env?.MODE === "development") {
    // eslint-disable-next-line no-console
    console.debug("Rendering FooterWrapper with pageType:", pageType);
  }

  return <Footer pageType={pageType} />;
}

function App() {
  const { logEvent } = useAnalytics();
  const location = useLocation();

  const managementRoutes = ['/dashboard','/bookings','/resources','/profile','/payments','/blog','/services','/mgmtabout','/users','/tickets'];

  const isManagementRoute = managementRoutes.some(route =>
  location.pathname.startsWith(route)
  );

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
                  <Route path="/dashboard/*" element={<p>Dashboard</p>} />
                  <Route path="/bookings/*" element={<p>Bookings</p>} />
                  <Route path="/resources/*" element={<p>Resources</p>} />
                  <Route path="/profile/*" element={<p>Profile</p>}  />
                  <Route path="/payments/*" element={<p>Payments</p>}  />
                  <Route path="/blog/*" element={<p>Blog</p>}  />
                  <Route path="/services/*" element={<p>Services</p>}  />
                  <Route path="/mgmtabout/*" element={<p>About (management)</p>}  />
                  <Route path="/users/*" element={<p>Users</p>}  />
                  <Route path="/tickets/*" element={<p>Tickets</p>}  />
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
            <Route path="/about" element={<p>About(Public)</p>} />
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

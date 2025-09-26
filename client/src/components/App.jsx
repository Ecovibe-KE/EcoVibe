// App.jsx
import { useEffect, useMemo, Suspense, lazy } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAnalytics } from "../hooks/useAnalytics";

import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Homepage from "./Homepage.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import AboutUs from "./AboutUs.jsx";
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import UserManagement from "./admin/UserManagement.jsx";
import TopNavbar from "./TopNavbar.jsx";
import Footer from "./Footer.jsx";
import SignUpForm from "./Signup.jsx";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const PrivacyPolicy = lazy(() => import("./PrivacyPolicy.jsx"));

// Footer Wrapper
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

  // Analytics event
  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  return (
    <>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <Routes>
          {/* Dashboard routes */}
          <Route
            path="/dashboard/*"
            element={
              <>
                <TopNavbar />
                <Outlet />
                <FooterWrapper />
              </>
            }
          >
            <Route index element={<div className="p-4"><h2>Dashboard Main</h2><p>Welcome to your dashboard!</p></div>} />
            <Route path="main" element={<div className="p-4"><h2>Dashboard Main</h2><p>Welcome to your dashboard!</p></div>} />
            <Route path="bookings" element={<div className="p-4"><h2>Bookings</h2><p>Manage your bookings here.</p></div>} />
            <Route path="resources" element={<div className="p-4"><h2>Resources</h2><p>Access your resources.</p></div>} />
            <Route path="profile" element={<div className="p-4"><h2>Profile</h2><p>Manage your profile.</p></div>} />
            <Route path="payments" element={<div className="p-4"><h2>Payments</h2><p>View payment history.</p></div>} />
            <Route path="blog" element={<div className="p-4"><h2>Blog</h2><p>Manage blog content.</p></div>} />
            <Route path="services" element={<div className="p-4"><h2>Services</h2><p>Manage your services.</p></div>} />
            <Route path="about" element={<div className="p-4"><h2>About Management</h2><p>Update about information.</p></div>} />
            <Route path="users" element={<UserManagement />} />
            <Route path="tickets" element={<div className="p-4"><h2>Tickets</h2><p>Manage support tickets.</p></div>} />
          </Route>

          {/* Public routes */}
          {[
            { path: "/", element: <Homepage /> },
            { path: "/home", element: <Homepage /> },
            { path: "/playground", element: <Playground /> },
            { path: "/contact", element: <Contact /> },
            { path: "/about", element: <AboutUs /> },
            { path: "/verify", element: <VerifyPage /> },
            { path: "/blog", element: <Blog /> },
            { path: "/blog/:id", element: <BlogPost /> },
            { path: "/privacy", element: <PrivacyPolicy /> },
            { path: "/privacy-policy", element: <PrivacyPolicy /> },
            { path: "/terms", element: <Terms /> },
          ].map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  <NavBar />
                  {element}
                  <FooterWrapper />
                </>
              }
            />
          ))}

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

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
    </>
  );
}

export default App;

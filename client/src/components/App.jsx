import { useEffect, useMemo, Suspense } from "react";
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
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import UserManagement from "./admin/UserManagement.jsx";
import TopNavbar from "./TopNavbar.jsx";
import Footer from "./Footer.jsx";
import SignUpForm from "./Signup.jsx";
import "../css/signup.css";

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
  useEffect(() => {      // Reset form and reCAPTCHA

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
                  <Route path="/dashboard" element={<p>Dashboard Main</p>} />
                  <Route index element={<Navigate to="main" replace />} />
                  <Route path="/dashboard/bookings" element={<p>Bookings</p>} />
                  <Route
                    path="/dashboard/resources"
                    element={<p>Resources</p>}
                  />
                  <Route
                    path="/dashboard/resources"
                    element={<p>Resources</p>}
                  />
                  <Route path="/dashboard/profile" element={<p>Profile</p>} />
                  <Route path="/dashboard/payments" element={<p>Payments</p>} />
                  <Route path="/dashboard/blog" element={<p>Blog</p>} />
                  <Route path="/dashboard/services" element={<p>Services</p>} />
                  <Route
                    path="/dashboard/about"
                    element={<p>About (management)</p>}
                  />
                  <Route path="/dashboard/users" element={<UserManagement />} />
                  <Route path="/dashboard/tickets" element={<p>Tickets</p>} />
                  <Route
                    path="/dashboard/*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Route>
              </Routes>
            </Suspense>
          </main>
        </div>
      ) : (
        /* Public routes - normal layout */
        <Routes>
          <Route index element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
          <Route path="/signup" element={<SignUpForm />}/>
          <Route path="/login" element={
            <div className="justify-content-center align-items-center">
             <p className="">
              welcome to ecovibe
             </p>
             <p className="">
              something good is coming
             </p>
            </div>}/>
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

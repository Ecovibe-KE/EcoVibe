import { useEffect, Suspense, useMemo, lazy } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Homepage from "./Homepage";
import NavBar from "./Navbar.jsx";
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
import ProfilePage from "./ProfilePage.jsx";
import ServiceAdmin from "./admin/ServiceAdmin.jsx";

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

const PrivacyPolicy = lazy(() => import("./PrivacyPolicy.jsx"));

function App() {
  const { logEvent } = useAnalytics();
  const location = useLocation();

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
          {/* Dashboard routes - TopNavbar handles the layout and nested routing */}
          <Route
            path="/dashboard/*"
            element={
              <>
                <TopNavbar />
              </>
            }
          >
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
                  <p>View payment history.</p>
                </div>
              }
            />
            <Route
              path="blog"
              element={
                <div className="p-4">
                  <h2>Blog</h2>
                  <p>Manage blog content.</p>
                </div>
              }
            />
            <Route path="services" element={<ServiceAdmin />} />
            <Route
              path="about"
              element={
                <div className="p-4">
                  <h2>About Management</h2>
                  <p>Update about information.</p>
                </div>
              }
            />
            <Route path="users" element={<UserManagement />} />
            <Route
              path="tickets"
              element={
                <div className="p-4">
                  <h2>Tickets</h2>
                  <p>Manage support tickets.</p>
                </div>
              }
            />
          </Route>

          {/* Public routes - NO NESTED ROUTES */}
          <Route
            path="/"
            element={
              <>
                <NavBar />
                <Homepage />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <>
                <NavBar />
                <Homepage />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <NavBar />
                <SignUpForm />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/playground"
            element={
              <>
                <NavBar />
                <Playground />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <NavBar />
                <Contact />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <NavBar />
                <AboutUs />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/verify"
            element={
              <>
                <NavBar />
                <VerifyPage />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <NavBar />
                <Blog />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <>
                <NavBar />
                <BlogPost />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <NavBar />
                <PrivacyPolicy />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <NavBar />
                <PrivacyPolicy />
                <FooterWrapper />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <NavBar />
                <Terms />
                <FooterWrapper />
              </>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

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

import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import FooterWrapper from "./FooterWrapper.jsx";
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
import UserManagement from "./admin/UserManagement.jsx";

const PrivacyPolicy = lazy(() => import("./PrivacyPolicy.jsx"));

// Dashboard Layout (Protected pages, no footer)
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

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  return (
    <div className="app-wrapper">
      <div className="main-content">
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            {/* Dashboard / Protected routes (no footer) */}
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              <Route
                index
                element={
                  <div className="p-4">
                    <h2>Dashboard Main</h2>
                  </div>
                }
              />
              <Route
                path="main"
                element={
                  <div className="p-4">
                    <h2>Dashboard Main</h2>
                  </div>
                }
              />
              <Route
                path="bookings"
                element={
                  <div className="p-4">
                    <h2>Bookings</h2>
                  </div>
                }
              />
              <Route
                path="resources"
                element={
                  <div className="p-4">
                    <h2>Resources</h2>
                  </div>
                }
              />
              <Route
                path="profile"
                element={
                  <div className="p-4">
                    <h2>Profile</h2>
                  </div>
                }
              />
              <Route
                path="payments"
                element={
                  <div className="p-4">
                    <h2>Payments</h2>
                  </div>
                }
              />
              <Route
                path="blog"
                element={
                  <div className="p-4">
                    <h2>Blog</h2>
                  </div>
                }
              />
              <Route
                path="services"
                element={
                  <div className="p-4">
                    <h2>Services</h2>
                  </div>
                }
              />
              <Route
                path="about"
                element={
                  <div className="p-4">
                    <h2>About Management</h2>
                  </div>
                }
              />
              <Route path="users" element={<UserManagement />} />
              <Route
                path="tickets"
                element={
                  <div className="p-4">
                    <h2>Tickets</h2>
                  </div>
                }
              />
            </Route>

            {/* Public pages (footer shown) */}
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
              path="/signup"
              element={
                <>
                  <NavBar />
                  <SignUpForm />
                </>
              }
            />
            <Route path="/login" element={<Login />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer rendered only on public/non-protected pages */}
      <FooterWrapper />

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
    </div>
  );
}

export default App;

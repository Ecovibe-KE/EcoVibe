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
import Footer from "./Footer.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ProfilePage from "./ProfilePage.jsx";
import ResetPassword from "./ResetPassword.jsx";
import BlogManagementUi from "./admin/BlogManagment.jsx";


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
                <div className="p-4">
                  <h2>Profile</h2>
                  <ProfilePage />
                </div>

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
            <Route path="blog" element={<BlogManagementUi />} />
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
          </Route>

          {/* Public routes - NO NESTED ROUTES */}
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
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

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

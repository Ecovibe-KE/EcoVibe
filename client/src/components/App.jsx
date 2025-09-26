import { useEffect, useContext, Suspense, useMemo, lazy } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import NavBar from "./Navbar.jsx";
import TopNavbar from "./TopNavbar.jsx";
import Footer from "./Footer.jsx";
import Homepage from "./Homepage";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import AboutUs from "./AboutUs.jsx";
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";
import Terms from "./Terms.jsx";
import VerifyPage from "./Verify.jsx";
import UserManagement from "./admin/UserManagement.jsx";
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { useAnalytics } from "../hooks/useAnalytics";
import SignUpForm from "./Signup.jsx";
import "bootstrap-icons/font/bootstrap-icons.css";




const PrivacyPolicy = React.lazy(() => import("./PrivacyPolicy.jsx"));

// Footer wrapper with page type
function FooterWrapper() {
  const location = useLocation();
  const pageType = React.useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/about")) return "about";
    if (path.startsWith("/blog")) return "blog";
    if (path.startsWith("/services")) return "services";
    if (path.startsWith("/contact")) return "contact";
    return "landing";
  }, [location.pathname]);
  return <Footer pageType={pageType} />;
}

function App() {
  const { logEvent } = useAnalytics();
  const { user } = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  // Management routes
  const managementRoutes = [
    "/dashboard",
    "/bookings",
    "/resources",
    "/profile",
    "/payments",
    "/blog",
    "/services",
    "/dashboard/about", 
    "/users",
    "/tickets",
  ];

  const isManagementRoute = managementRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Redirect unauthorized users
  if (isManagementRoute && !user) {
    return <Navigate to="/login" replace />;
  }

  // Sidebar items per role
  const clientNavItems = [
    { to: "/dashboard/main", label: "Main" },
    { to: "/dashboard/bookings", label: "Bookings" },
    { to: "/dashboard/resources", label: "Resource Center" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/payments", label: "Payment History" },
    { to: "/dashboard/tickets", label: "Tickets" },
  ];

  const adminNavItems = [
    { to: "/dashboard/main", label: "Dashboard" },
    { to: "/dashboard/bookings", label: "Bookings" },
    { to: "/dashboard/resources", label: "Resources" },
    { to: "/dashboard/profile", label: "Profile" },
    { to: "/dashboard/payments", label: "Payments" },
    { to: "/dashboard/blog", label: "Blog Management" },
    { to: "/dashboard/services", label: "Service Management" },
    { to: "/dashboard/about", label: "About Us Management" },
    { to: "/dashboard/users", label: "User Management" },
    { to: "/dashboard/tickets", label: "Tickets" },
  ];

  return (
    <>
      {isManagementRoute ? (
        <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <TopNavbar
                  navItems={user.role === "Client" ? clientNavItems : adminNavItems}
                  userData={user}
                />
              }
            >
              <Route index element={<p>Dashboard Main</p>} />
              <Route path="bookings" element={<p>Bookings</p>} />
              <Route path="resources" element={<p>Resources</p>} />
              <Route path="profile" element={<p>Profile</p>} />
              <Route path="payments" element={<p>Payments</p>} />
              <Route
                path="blog"
                element={user.role !== "Client" ? <p>Blog</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="services"
                element={user.role !== "Client" ? <p>Services</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="about"
                element={user.role !== "Client" ? <p>About (management)</p> : <Navigate to="/dashboard" replace />}
              />
              <Route
                path="users"
                element={user.role !== "Client" ? <UserManagement /> : <Navigate to="/dashboard" replace />}
              />
              <Route path="tickets" element={<p>Tickets</p>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      ) : (
        // Public routes with NavBar and Footer
        <Routes>
          {/* Dashboard routes - TopNavbar handles the layout and nested routing */}
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
                  <p>Manage your profile.</p>
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
            <Route
              path="services"
              element={
                <div className="p-4">
                  <h2>Services</h2>
                  <p>Manage your services.</p>
                </div>
              }
            />
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

import { useEffect, useMemo, Suspense, useContext } from "react";
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
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import Header from "./Header";
import Footer from "./Footer.jsx";
import { UserContext } from "../context/UserContext.jsx";

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

  return <Footer pageType={pageType} />;
}

function App() {
  const location = useLocation();
  const { logEvent } = useAnalytics();
  const { user } = useContext(UserContext);

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
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);

  if (isManagementRoute && (!user || user.role === "Client")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {!isManagementRoute && <NavBar />}

      {isManagementRoute ? (
        <div className="d-flex vh-100">
          <NavPanel />
          <div className="flex-fill d-flex flex-column">
            <Header />
            <main role="main" className="flex-fill bg-light overflow-auto">
              <Suspense fallback={<div className="p-4">Loading…</div>}>
                <Routes>
                  <Route path="/dashboard" element={<Outlet />}>
                    {/* Relative paths for child routes */}
                    <Route index element={<p>Dashboard Main</p>} />
                    <Route path="bookings" element={<p>Bookings</p>} />
                    <Route path="resources" element={<p>Resources</p>} />
                    <Route path="profile" element={<p>Profile</p>} />
                    <Route path="payments" element={<p>Payments</p>} />
                    <Route path="blog" element={<p>Blog</p>} />
                    <Route path="services" element={<p>Services</p>} />
                    <Route path="about" element={<p>About (management)</p>} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="tickets" element={<p>Tickets</p>} />
                    <Route path="*" element={<Navigate to="." replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          {/* Public routes */}
          <Route index element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}

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

      {!isManagementRoute && <FooterWrapper />}
    </>
  );
}

export default App;

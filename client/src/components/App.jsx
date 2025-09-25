import Homepage from "./Homepage";
import { useEffect, Suspense } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import UserManagement from "./admin/UserManagement.jsx";
import TopNavbar from "./TopNavbar.jsx";
import AboutUs from "./AboutUs.jsx";
import "bootstrap/dist/js/bootstrap.bundle.min.js"

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
          <Route path="/dashboard/*" element={<TopNavbar />}>
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
          <Route path="/*" element={
            <>
              <NavBar />
              <Routes>
                <Route index element={<Homepage />} />
                <Route path="playground" element={<Playground />} />
                <Route path="contact" element={<Contact />} />
                <Route path="home" element={<Homepage />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </>
          } />
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
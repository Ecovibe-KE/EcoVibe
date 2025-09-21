import Homepage from "./Homepage";
import { useEffect, lazy, Suspense } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

const Dashboard = lazy(() => import("./Dashboard.jsx"));
const About = lazy(() => import("./About.jsx"));
const Blog = lazy(() => import("./Blog.jsx"));
const Bookings = lazy(() => import("./Bookings.jsx"));
const Payments = lazy(() => import("./Payments.jsx"));
const Services = lazy(() => import("./Services.jsx"));
const Tickets = lazy(() => import("./Tickets.jsx"));
const Profile = lazy(() => import("./Profile.jsx"));
const Resources = lazy(() => import("./Resources.jsx"));
const Users = lazy(() => import("./Users.jsx"));

function App() {
  const { logEvent } = useAnalytics();
  const location = useLocation();

  // Routes that should show the regular NavBar (public routes)
  const publicRoutes = ['/', '/home', '/playground', '/contact'];
  
  // Routes that should show NavPanel (management routes)  
  const managementRoutes = ['/dashboard','/bookings', '/resources', '/profile', '/payments', '/blog', '/services', '/about', '/users', '/tickets'];
  
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isManagementRoute = managementRoutes.includes(location.pathname);

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: location.pathname || "/",
      firebase_screen_class: "App",
    });
  }, [logEvent, location.pathname]);
    return (
        <>
          {/* Public routes - show NavBar */}
          {isPublicRoute && <NavBar />}

          {/* Management routes - show NavPanel layout */}
          {isManagementRoute ? (
            <div className="d-flex vh-100">
             <NavPanel />
              <main role="main" className="flex-fill bg-light overflow-auto">
                <Suspense fallback={<div className="p-4">Loading…</div>}>
                <Routes>
                  <Route path="/dashboard/*" element={<Dashboard />} />
                  <Route path="/bookings/*" element={<Bookings />} />
                  <Route path="/resources/*" element={<Resources />} />
                  <Route path="/profile/*" element={<Profile />} />
                  <Route path="/payments/*" element={<Payments />} />
                  <Route path="/blog/*" element={<Blog />} />
                  <Route path="/services/*" element={<Services />} />
                  <Route path="/about/*" element={<About />} />
                  <Route path="/users/*" element={<Users />} />
                  <Route path="/tickets/*" element={<Tickets />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Suspense>
              </main>
           </div>
          ) : (
           /* Public routes - normal layout */
          <Suspense fallback={<div className="p-4">Loading…</div>}>
          <Routes>
            <Route path="/playground" element={<Playground />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
         </Suspense>
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

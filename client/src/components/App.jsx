import Homepage from "./Homepage";
import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import NavPanel from "./NavPanel.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import Dashboard from "./Dashboard.jsx";
import About from "./About.jsx";
import Blog from "./Blog.jsx";
import Bookings from "./Bookings.jsx";
import Payments from "./Payments.jsx";
import Services from "./Services.jsx";
import Tickets from "./Tickets.jsx";
import Profile from "./Profile.jsx";
import Resources from "./Resources.jsx";
import Users from "./Users.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route, useLocation } from "react-router-dom";

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
      firebase_screen: "Home Page",
      firebase_screen_class: "App",
    });
  }, [logEvent]);
    return (
        <>
          {/* Public routes - show NavBar */}
          {isPublicRoute && <NavBar />}

          {/* Management routes - show NavPanel layout */}
          {isManagementRoute ? (
            <div className="d-flex vh-100">
             <NavPanel />
             <div className="flex-fill bg-light overflow-auto">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/tickets" element={<Tickets />} />
                </Routes>
              </div>
           </div>
          ) : (
           /* Dashboard and public routes - normal layout */
          <Routes>
           <Route path="/playground" element={<Playground />} />
           <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Homepage />} />
           <Route path="/home" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
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

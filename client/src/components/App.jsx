import { useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Added required CSS import
import Footer from "./Footer.jsx";

// Landing Page Component
function LandingPage() {
  return (
    <div className="container-fluid">
      <p>Welcome to Ecovibe</p>
      <p>Something good is coming soon!</p>
    </div>
  );
}

// Client Page Component
function ClientPage() {
  return (
    <div className="container-fluid">
      <h1>Client Dashboard</h1>
      <p>This is where client-specific content will go.</p>
    </div>
  );
}

// Footer Wrapper to dynamically detect page type
function FooterWrapper() {
  const location = useLocation();
  const pageType = useMemo(
    () => (location.pathname.startsWith("/client") ? "client" : "landing"),
    [location.pathname]
  );

  // ✅ Log to console to help debugging
  console.log("Rendering FooterWrapper with pageType:", pageType);

  return <Footer pageType={pageType} />;
}

function App() {
  const { logEvent } = useAnalytics() || {}; // ✅ Safe destructure (avoids undefined)

  useEffect(() => {
    if (logEvent) {
      logEvent("screen_view", {
        firebase_screen: "Home Page",
        firebase_screen_class: "App",
      });
    } else {
      console.warn("logEvent is undefined – check useAnalytics hook.");
    }
  }, [logEvent]);

  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <NavBar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/playground" element={<Playground />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/client" element={<ClientPage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>

        {/* Toast Notifications (safe, won't crash app if imported correctly) */}
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

        {/* ✅ Safe Footer Wrapper */}
        <FooterWrapper />
      </div>
    </Router>
  );
}

export default App;

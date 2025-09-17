import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Footer from "./Footer";

// Demo placeholder pages
function LandingPage() {
  return (
    <div className="container-fluid">
      <p>Welcome to Ecovibe</p>
      <p>Something good is coming soon!</p>
    </div>
  );
}

function ClientPage() {
  return (
    <div className="container-fluid">
      <h1>Client Dashboard</h1>
      <p>This is where client-specific content will go.</p>
    </div>
  );
}

function App() {
  // 1. Get the logEvent function from the hook
  const { logEvent } = useAnalytics();

  // 2. Log a screen_view event when the component mounts
  useEffect(() => {
    logEvent('screen_view', {
      firebase_screen: 'Home Page',
      firebase_screen_class: 'App'
    });
  }, [logEvent]); // Add logEvent to dependency array

  const [count, setCount] = useState(0)

   return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/playground" element={<Playground />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/client" element={<ClientPage />} />
      </Routes>
      <FooterWrapper />
    </Router>
  );
}

// Wrapper to detect current route and set footer type
function FooterWrapper() {
  const location = useLocation();
  const pageType = location.pathname.startsWith("/client") ? "client" : "landing";
  return <Footer pageType={pageType} />;
}

export default App;
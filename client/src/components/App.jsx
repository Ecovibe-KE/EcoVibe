import { useState, useEffect, useMemo } from 'react'
import { Routes, Route, useLocation } from "react-router-dom";
import { useAnalytics } from '../hooks/useAnalytics';
import Footer from "./Footer";


function LandingPage() {
  return (
    <div className="page-content">
      <p>Welcome to Ecovibe</p>
      <p>Something good is coming soon!</p>
    </div>
  );
}

function ClientPage() {
  return (
    <div className="page-content">
      <h1>Client Dashboard</h1>
      <p>This is where client-specific content will go.</p>
    </div>
  );
}

function App() {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent('screen_view', {
      firebase_screen: 'Home Page',
      firebase_screen_class: 'App'
    });
  }, [logEvent]);

  const [count, setCount] = useState(0);

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/client" element={<ClientPage />} />
        </Routes>
      </div>
      <FooterWrapper />
    </div>
  );
}


function FooterWrapper() {
  const location = useLocation();
  const pageType = useMemo(() => {
    return location.pathname.startsWith("/client") ? "client" : "landing";
  }, [location.pathname]);

  return <Footer pageType={pageType} />;
}

export default App;

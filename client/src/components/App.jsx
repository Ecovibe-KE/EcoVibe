import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent("screen_view", {
      firebase_screen: "Home Page",
      firebase_screen_class: "App",
    });
  }, [logEvent]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/playground" element={<Playground />} />
        <Route
          path="/"
          element={
            <div className="container-fluid">
              <p>Welcome to Ecovibe</p>
              <p>Something good is coming soon!</p>
            </div>
          }
        />
      </Routes>
    </>
  );
}
export default App;

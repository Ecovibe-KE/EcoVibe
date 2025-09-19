import { useState, useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";

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
    </>
  );
}
export default App;
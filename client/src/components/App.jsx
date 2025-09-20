import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";

// ✅ Add these imports (correct path based on your structure)
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import PasswordReset from "../pages/PasswordReset";

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
        <Route path="/contact" element={<Contact />} />

        {/* ✅ Now these will work */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/password-reset" element={<PasswordReset />} />

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

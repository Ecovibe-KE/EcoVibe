import Homepage from "./Homepage";
import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import SignUpForm from "./Signup.jsx";

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
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route
          path="/login"
          element={
            <>
              <div className="justify-content-center align-content-center">
                <p className="">Welcome to ecovibe</p>
                <p className="">Something good is coming</p>
              </div>
            </>
          }
        ></Route>
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

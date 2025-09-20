import Homepage from './Homepage';
import { useEffect } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import Contact from "./Contact.jsx";
import { ToastContainer } from "react-toastify";
import { Routes, Route } from "react-router-dom";

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
            <NavBar/>
            <Routes>
                <Route path="/playground" element={<Playground/>}/>
                <Route path="/contact" element={<Contact/>}/>
                <Route path="/" element={<Homepage/>  }/>


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

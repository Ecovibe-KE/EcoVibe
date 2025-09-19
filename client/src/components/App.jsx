import { useAnalytics } from '../hooks/useAnalytics';
import Homepage from './Homepage';
import React, {useState, useEffect} from "react";
import NavBar from "./Navbar.jsx";
import Playground from "./Playground.jsx";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import Contact from "./Contact.jsx";
import {ToastContainer} from "react-toastify";

/**
 * Root application component that sets up navigation, triggers an analytics screen view, and mounts global UI chrome.
 *
 * Renders the top navigation bar, route mappings for Home, Playground, and Contact pages, and a configured ToastContainer for notifications.
 * On mount (and when the analytics `logEvent` reference changes) it logs a `"screen_view"` event with `{ firebase_screen: "Home Page", firebase_screen_class: "App" }`.
 *
 * @returns {JSX.Element} The app's root JSX tree.
 */
function App() {
    const {logEvent} = useAnalytics();

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
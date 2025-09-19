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
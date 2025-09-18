import {useState, useEffect} from 'react'
import Button from '../utils/Button';
import Input from '../utils/Input.jsx';
import {useAnalytics} from '../hooks/useAnalytics';
import NavBar from "./Navbar.jsx";

function App() {
    const {logEvent} = useAnalytics();

    // 2. Log a screen_view event when the component mounts
    useEffect(() => {
        logEvent("screen_view", {
            firebase_screen: "Home Page",
            firebase_screen_class: "App",
        });
    }, [logEvent]); // Add logEvent to dependency array

    const [count, setCount] = useState(0);
    return (
        <>
            <NavBar></NavBar>
            <div className="container-fluid">
                <p>Welcome to Ecovibe</p>
                <p>Something good is coming soon!</p>

                <div className="container my-5">
                    <div className="row">
                        <div className="col-md-6">
                            <Input
                                type="text"
                                label="Name"
                                name="name"
                                placeholder="Enter your name"
                            />

                            <Input
                                type="email"
                                label="Email"
                                name="email"
                                placeholder="Enter your email"
                            />

                            <Button variant="success" borderRadius="40rem" className="mb-4">Sign up</Button>
                            <Button variant="success" borderRadius="40rem" className="mb-4">Login</Button>
                            <Button variant="success" borderRadius="40rem" className="mb-4">Get Started</Button>
                        </div>
                        <div className="col-md-6">

                            <Input
                                type="password"
                                label="Password"
                                name="password"
                                placeholder="Enter your password"
                            />

                            <Input
                                type="date"
                                label="Date"
                                name="date"
                                placeholder="Enter your Date"
                            />
                            <Input
                                type="time"
                                label="Time"
                                name="time"
                                placeholder="Enter your Time"
                            />

                        </div>

                    </div>
                </div>

            </div>

        </>
    )
}

export default App

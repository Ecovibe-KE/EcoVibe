import {useState} from 'react'
import Button from '../utils/Button.jsx';
import Input from '../utils/Input.jsx';

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
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

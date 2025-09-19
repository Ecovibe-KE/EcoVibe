import React from "react";
import Button from "../utils/Button.jsx";
import Input from "../utils/Input.jsx";

function handleClick() {
    alert("Button Clicked");
}

function handleAdd() {
    alert("Button Add");
}

function handleDelete() {
    alert("Button Delete");
}

function Playground() {
    return (
        <div>
            <div className="container-fluid">
                <h1>Playground</h1>

                {/*Standard button with default colors*/}
                <Button onClick={handleClick}>Click Me</Button>
                {/*Standard button with custom colors*/}
                <Button color="#3498db" hoverColor="#2980b9" onClick={handleClick}>
                    Blue Button
                </Button>
                {/*Outline button*/}
                <Button outline onClick={handleClick} borderRadius="40rem">
                    Outline Button
                </Button>
                {/*Action button*/}
                <Button action="add" label="Add Item" onClick={handleAdd} />
                {/*Action button with custom color*/}
                <Button
                    action="delete"
                    label="Remove"
                    color="#e74c3c"
                    hoverColor="#c0392b"
                    onClick={handleDelete}
                />
                {/*Disabled button*/}
                <Button disabled onClick={handleClick}>
                    Can't Click Me
                </Button>
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
        </div>
    );
}

export default Playground;

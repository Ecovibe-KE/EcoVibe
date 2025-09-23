import React, { useState, useEffect } from "react";

function TopNavbar() {
    const [userData, setUserData] = useState({
        name: "Sharon Maina",
        role: "Admin",
        avatar: "https://ui-avatars.com/api/?name=Sharon+Maina&background=4e73df&color=fff"
    });

    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedData = JSON.parse(storedUserData);
                setUserData(prevData => ({
                    ...prevData,
                    ...parsedData
                }));
            } catch (error) {
                console.error('Error parsing user data from localStorage:', error);
            }
        }
    }, []);

    return (
        <nav className="topbar">
            <div className="topbar-left">
                <button className="menu-toggle" id="sidebarToggle">
                    <i className="bi bi-list"></i>
                </button>
                <h1 className="page-title">Dashboard</h1>
            </div>

            <div className="topbar-right">
                <div className="user-profile">
                    <img
                        src={userData.avatar}
                        className="user-avatar"
                        alt="User Avatar"
                    />
                    <div className="user-info">
                        <span className="user-name">{userData.name}</span>
                        <span className="user-role">{userData.role}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default TopNavbar;
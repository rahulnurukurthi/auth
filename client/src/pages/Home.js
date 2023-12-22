// Home.js

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const Home = () => {
    const router = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const registrationStatus = queryParams.get('registration');

        const tokens = localStorage.getItem('token');
        if ((!registrationStatus === 'success') && (!tokens || tokens === null)) {
            // If not a new user and not logged in, redirect to the login page
            onClickLogout();
        }

        const { pathname } = location;
        router(pathname, { replace: true });
    }, []);

    // Logout functionality
    const onClickLogout = () => {
        localStorage.removeItem('token');
        router("/login");
    };

    return (
        <>
            <h2 style={{ color: "white" }}>Welcome to Global Voices!</h2>
            <button onClick={onClickLogout}>Logout</button>
        </>
    );
};

export default Home;

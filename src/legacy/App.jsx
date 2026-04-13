"use client";

// src/App.jsx
import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
    useNavigate,
} from "./next-router";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import Splash from "./components/Splash";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Contact from "./components/Contact";
import About from "./components/About"
import Navbar from "./components/Navbar";
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Booking from './components/Booking';
import Checkout from './components/Checkout';
import OpenTripBooking from './components/OpenTripBooking';
import AdminPanel from './components/AdminPanel';

// 💡 Bagian utama aplikasi yang menangani routing dan navbar
function AppWrapper() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isGuest, isAuthenticated, isAdmin, loading } = useAuth();
    const hideNavbar =
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/profile" ||
        location.pathname === "/booking" ||
        location.pathname === "/open-trip-booking" ||
        location.pathname === "/admin" ||
        location.pathname === "/edit-profile" ||
        location.pathname === "/checkout";
    const publicRoutes = ["/", "/login", "/register"];

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated && !isGuest && !isAdmin && !publicRoutes.includes(location.pathname)) {
            navigate("/");
            return;
        }

        if (isAdmin && location.pathname !== "/admin" && !publicRoutes.includes(location.pathname)) {
            navigate("/admin");
            return;
        }

        if (!isAdmin && location.pathname === "/admin") {
            navigate(isAuthenticated ? "/dashboard" : "/");
            return;
        }

        if (isAdmin && publicRoutes.includes(location.pathname)) {
            navigate("/admin");
            return;
        }

        if (isAuthenticated && publicRoutes.includes(location.pathname)) {
            navigate("/dashboard");
        }
    }, [loading, isAuthenticated, isGuest, isAdmin, location.pathname, navigate]);

    return (
        <div
            className="flex flex-col"
            style={{
                background: "linear-gradient(180deg, #3F4F44 4%, #F1F8E8 80%)",
            }}
        >
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/open-trip-booking" element={<OpenTripBooking />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
        </div>
    );
}


// 💡 Bungkus AppWrapper dengan Router dan AuthProvider
function App() {
    return (
        <AuthProvider>
            <Router>
                <AppWrapper />
            </Router>
        </AuthProvider>
    );
}

export default App;

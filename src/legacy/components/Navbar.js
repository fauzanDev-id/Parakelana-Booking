"use client";

import React from "react";
import { Link, useLocation } from "../next-router";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ username }) {
    const location = useLocation();
    const { isGuest, isAuthenticated, profile } = useAuth();
    
    const isActive = (path) => location.pathname === path;
    
    // Get display name and avatar
    const displayName = profile?.username || profile?.full_name || username || "User";
    const avatarUrl = profile?.avatar_url;
    
    return (
        <nav className="fixed top-3 sm:top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[96%] sm:w-[95%] max-w-7xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 via-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-60" />
            
            {/* Main Navbar */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-5 md:px-8 rounded-full shadow-2xl flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
                    <div className="bg-linear-to-br from-white to-gray-100 rounded-full p-1 sm:p-1.5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <img src="/images/reference/logo-parakelana.png" alt="Logo Parakelana" className="h-6 sm:h-7 w-6 sm:w-7 object-contain" />
                    </div>
                    <span className="hidden md:block font-bold text-sm md:text-base bg-linear-to-r from-white to-[#DAEBCE] bg-clip-text text-transparent">
                        PARAKELANA ADVENTURE
                    </span>
                </Link>

                {/* Menu */}
                <div className="flex space-x-1 sm:space-x-2 md:space-x-4 text-xs sm:text-sm font-medium">
                    <Link 
                        to="/dashboard" 
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                            isActive('/dashboard') 
                                ? 'bg-white/20 text-white shadow-lg' 
                                : 'hover:bg-white/10 text-gray-200 hover:text-white'
                        }`}
                    >
                        <span className="hidden xs:inline">Dashboard</span>
                        <span className="xs:hidden">Home</span>
                    </Link>
                    <Link 
                        to="/about" 
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                            isActive('/about') 
                                ? 'bg-white/20 text-white shadow-lg' 
                                : 'hover:bg-white/10 text-gray-200 hover:text-white'
                        }`}
                    >
                        About
                    </Link>
                    <Link 
                        to="/contact" 
                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                            isActive('/contact') 
                                ? 'bg-white/20 text-white shadow-lg' 
                                : 'hover:bg-white/10 text-gray-200 hover:text-white'
                        }`}
                    >
                        Contact
                    </Link>
                </div>

                {/* User Profile / Guest */}
                {isGuest ? (
                    <Link to="/profile" className="group">
                        <div className="flex items-center space-x-1.5 sm:space-x-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer">
                            <span className="text-xs sm:text-sm px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 font-medium">
                                Guest
                            </span>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                G
                            </div>
                        </div>
                    </Link>
                ) : isAuthenticated ? (
                    <Link to="/profile" className="group">
                        <div className="flex items-center space-x-1.5 sm:space-x-2.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-white/10 transition-all duration-300 cursor-pointer">
                            <span className="text-sm md:text-base hidden sm:inline text-gray-200 group-hover:text-white font-medium uppercase">
                                {displayName}
                            </span>
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt={displayName}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-[#DAEBCE]/30"
                                />
                            ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-[#DAEBCE] to-[#3F4F44] rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </Link>
                ) : (
                    <Link to="/login" className="text-xs sm:text-sm px-3 py-1 sm:py-1.5 rounded-full bg-[#DAEBCE]/20 hover:bg-[#DAEBCE]/30 text-[#DAEBCE] font-medium transition-all duration-300">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}

"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabase";
import { getUserProfile, createUserProfile } from "../utils/profileHelpers";

const ADMIN_EMAILS = ["parakelanaadv@gmail.com"];

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [logoutInProgress, setLogoutInProgress] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let authListener;

        const applySession = async (session) => {
            if (!isMounted) return;

            if (session?.user) {
                const normalizedEmail = String(session.user.email || "").toLowerCase();
                const sessionIsAdmin = ADMIN_EMAILS.includes(normalizedEmail);

                setUser(session.user);
                setIsGuest(false);
                setIsAdmin(sessionIsAdmin);
                setAdminEmail(sessionIsAdmin ? session.user.email || "" : "");
                localStorage.removeItem("guestMode");
                localStorage.removeItem("parakelanaAdminSession");

                let userProfile = await getUserProfile(session.user.id);
                if (!userProfile) {
                    userProfile = await createUserProfile(session.user);
                }

                setProfile(userProfile);

                localStorage.setItem("parakelanaProfile", JSON.stringify({
                    email: session.user.email,
                    uid: session.user.id,
                    name: userProfile?.full_name || session.user.user_metadata?.full_name || "",
                    username: userProfile?.username || session.user.email?.split('@')[0] || "user",
                    avatar_url: userProfile?.avatar_url || null
                }));
            } else {
                const adminSession = localStorage.getItem("parakelanaAdminSession");
                if (adminSession) {
                    try {
                        const parsedAdmin = JSON.parse(adminSession);
                        if (parsedAdmin?.isAdmin) {
                            setUser(null);
                            setProfile(null);
                            setIsGuest(false);
                            setIsAdmin(true);
                            setAdminEmail(parsedAdmin.email || "");
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        localStorage.removeItem("parakelanaAdminSession");
                    }
                }

                const guestMode = localStorage.getItem("guestMode") === "true";
                setUser(null);
                setProfile(null);
                setIsGuest(guestMode);
                setIsAdmin(false);
                setAdminEmail("");
            }

            setLoading(false);
        };

        const initializeAuth = async () => {
            try {
                // Get current session from Supabase
                const { data } = await supabase.auth.getSession();
                
                if (!isMounted) return;
                
                await applySession(data?.session || null);

                // Set up listener for auth changes
                if (isMounted) {
                    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
                        // Don't apply session if logout is in progress
                        if (!logoutInProgress && isMounted) {
                            await applySession(session);
                        }
                    });
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Auth initialization error:', error);
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
            if (authListener?.data?.subscription) {
                authListener.data.subscription.unsubscribe();
            }
        };
    }, [logoutInProgress]);

    // Function to switch to guest mode
    const setGuestMode = () => {
        localStorage.setItem("guestMode", "true");
        setUser(null);
        setIsGuest(true);
        setIsAdmin(false);
        setAdminEmail("");
        localStorage.removeItem("parakelanaAdminSession");
    };

    const setAdminMode = (email) => {
        localStorage.removeItem("guestMode");
        localStorage.removeItem("parakelanaProfile");
        localStorage.setItem("parakelanaAdminSession", JSON.stringify({
            isAdmin: true,
            email,
            loginAt: new Date().toISOString(),
        }));

        setUser(null);
        setProfile(null);
        setIsGuest(false);
        setIsAdmin(true);
        setAdminEmail(email || "");
        setLoading(false);
    };

    // Function to logout (clear both user and guest)
    const logout = async () => {
        setLogoutInProgress(true);
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all auth state regardless of signOut result
            localStorage.removeItem("guestMode");
            localStorage.removeItem("parakelanaProfile");
            localStorage.removeItem("parakelanaAdminSession");
            setUser(null);
            setProfile(null);
            setIsGuest(false);
            setIsAdmin(false);
            setAdminEmail("");
            setLogoutInProgress(false);
            setLoading(false);
        }
    };

    // Function to refresh profile data
    const refreshProfile = async () => {
        if (user?.id) {
            const userProfile = await getUserProfile(user.id);
            setProfile(userProfile);
            
            // Update localStorage
            if (userProfile) {
                localStorage.setItem("parakelanaProfile", JSON.stringify({
                    email: user.email,
                    uid: user.id,
                    name: userProfile?.full_name || "",
                    username: userProfile?.username || user.email?.split('@')[0] || "user",
                    avatar_url: userProfile?.avatar_url || null
                }));
            }
            return userProfile;
        }
        return null;
    };

    // Function to check if user is authenticated
    const isAuthenticated = () => {
        return user !== null && !isGuest;
    };

    const value = {
        user,
        profile,
        isGuest,
        loading,
        setGuestMode,
        setAdminMode,
        logout,
        refreshProfile,
        isAdmin,
        adminEmail,
        isAuthenticated: isAuthenticated(),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use Auth Context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

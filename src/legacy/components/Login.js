"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "../next-router";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setGuestMode } = useAuth();

    const ADMIN_EMAIL = "parakelanaadv@gmail.com";
    const ADMIN_PASSWORD = "ParakelanaAdmin123";

    const togglePassword = () => setShowPassword((s) => !s);

    const handleLogin = async () => {
        setError("");
        const normalizedEmail = email.trim().toLowerCase();
        
        // Validation
        if (!normalizedEmail || !password) {
            setError("Email dan password harus diisi.");
            return;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            setError("Format email tidak valid.");
            return;
        }
        
        // Password minimum length
        if (password.length < 1) {
            setError("Password harus diisi dengan benar.");
            return;
        }

        setLoading(true);
        try {
            // Admin login must also create a real Supabase authenticated session for RLS writes.
            if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                const { error: adminAuthError } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                });

                if (adminAuthError) {
                    throw new Error("Akun admin belum terdaftar di Supabase Auth atau password tidak sinkron.");
                }

                navigate("/admin");
                return;
            }

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: password,
            });

            if (signInError) throw signInError;

            // Store user data in localStorage as backup
            if (data?.user) {
                localStorage.setItem("parakelanaProfile", JSON.stringify({
                    email: data.user.email,
                    uid: data.user.id,
                    name: data.user.user_metadata?.full_name || "",
                }));
            }

            localStorage.removeItem("guestMode");
            if (rememberMe) {
                localStorage.setItem("rememberEmail", normalizedEmail);
            } else {
                localStorage.removeItem("rememberEmail");
            }
            navigate("/dashboard");
        } catch (err) {
            console.error("Login error:", err?.message);
            if (err?.message?.includes("Invalid login credentials")) {
                setError("Email atau password salah.");
            } else if (err?.message?.includes("Email not confirmed")) {
                setError("Email belum diverifikasi. Silakan check email Anda.");
            } else if (err?.message?.includes("User not found")) {
                setError("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
            } else {
                setError(err?.message || "Login gagal. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleLogin();
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const baseUrl = window.location.origin;
            const { data, error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${baseUrl}/dashboard`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });

            if (googleError) throw googleError;
            
            // Google login will redirect, but we'll store the intent
            localStorage.removeItem("guestMode");
        } catch (err) {
            console.error("Google login error:", err?.message);
            setError(err?.message || "Gagal login dengan Google. Silakan coba lagi.");
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        setGuestMode();
        navigate("/dashboard");
    };

    return (
        <div
            className="relative min-h-screen bg-cover bg-center flex items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            }}
        >
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: 'url(/images/legacy/BG_PARAKELANA.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            />

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 animate-fade-in-down">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            WELCOME BACK
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">
                            Sign in to continue your adventure
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-fade-in-down">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-red-400 text-xs">!</span>
                            </div>
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-[#DAEBCE]/30 focus-within:border-[#DAEBCE]/50 transition-all duration-300">
                            <FiMail className="text-gray-400 text-lg mr-3" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="bg-transparent focus:outline-none w-full text-white placeholder-gray-500 text-sm md:text-base"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-[#DAEBCE]/30 focus-within:border-[#DAEBCE]/50 transition-all duration-300">
                            <FiLock className="text-gray-400 text-lg mr-3" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="bg-transparent focus:outline-none w-full text-white placeholder-gray-500 text-sm md:text-base"
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="text-gray-400 hover:text-[#DAEBCE] transition-colors"
                            >
                                {showPassword ? (
                                    <FiEye className="text-lg" />
                                ) : (
                                    <FiEyeOff className="text-lg" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between mb-6 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border transition-all ${rememberMe ? 'bg-[#DAEBCE] border-[#DAEBCE]' : 'border-gray-400 bg-transparent'}`}>
                                {rememberMe && <FiCheck className="w-full h-full text-[#0a0a0a] flex items-center justify-center" />}
                            </div>
                            <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember Me</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-gray-400 hover:text-[#DAEBCE] transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-linear-to-r from-[#DAEBCE] to-[#9ec08f] text-[#0a0a0a] font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-[#DAEBCE]/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group mb-4"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                                <span>SIGNING IN...</span>
                            </>
                        ) : (
                            <>
                                <span>LOGIN</span>
                                <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white/10 border border-white/20 hover:border-[#DAEBCE]/50 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group mb-4 hover:bg-white/15 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>{loading ? "Connecting..." : "Login dengan Google"}</span>
                    </button>

                    {/* Guest Mode Button */}
                    <button
                        onClick={handleGuestMode}
                        className="w-full bg-white/10 border border-white/20 hover:border-[#DAEBCE]/50 rounded-xl px-4 py-3 transition-all duration-300 text-white text-sm font-medium mb-4 hover:bg-white/15"
                    >
                        Lanjutkan Sebagai Guest
                    </button>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-[#DAEBCE] font-semibold hover:text-white transition-colors"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    © 2026 Parakelana. All rights reserved.
                </p>
            </div>

            <style jsx>{`
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-down {
                    animation: fade-in-down 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Login;

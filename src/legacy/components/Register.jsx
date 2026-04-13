"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "../next-router";
import { supabase } from "../supabase";
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const togglePassword = () => setShowPassword((s) => !s);
    const toggleConfirmPassword = () => setShowConfirmPassword((s) => !s);

    const validateForm = () => {
        if (!fullName.trim()) {
            setError("Nama lengkap harus diisi.");
            return false;
        }
        if (!email.trim()) {
            setError("Email harus diisi.");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Format email tidak valid.");
            return false;
        }
        if (password.length < 6) {
            setError("Password minimal 6 karakter.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Password tidak cocok.");
            return false;
        }
        if (!agreeTerms) {
            setError("Anda harus setuju dengan syarat dan ketentuan.");
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        setError("");
        if (!validateForm()) return;

        setLoading(true);
        try {
            const normalizedEmail = email.trim().toLowerCase();
            // Sign up with Supabase
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (signUpError) throw signUpError;

            // Store full name in localStorage as backup
            localStorage.setItem("parakelanaProfile", JSON.stringify({ name: fullName }));
            localStorage.setItem("registerEmail", normalizedEmail);

            // Check if user is already confirmed (auto-confirm enabled on Supabase)
            if (data?.user) {
                navigate("/dashboard");
            } else {
                // If email confirmation required, show message
                setError("Registrasi berhasil! Silakan check email untuk verifikasi.");
            }
        } catch (err) {
            console.error("Register error:", err?.message);
            if (err?.message?.includes("already registered")) setError("Email sudah terdaftar.");
            else if (err?.message?.includes("invalid email")) setError("Format email tidak valid.");
            else if (err?.message?.includes("password")) setError("Password tidak memenuhi kriteria (min 6 karakter).");
            else if (err?.message?.includes("User already exists")) setError("Email sudah terdaftar.");
            else setError(err?.message || "Registrasi gagal. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleRegister();
    };

    const handleGoogleRegister = async () => {
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
            
            // Google register will redirect, but we'll store the intent
        } catch (err) {
            console.error("Google register error:", err?.message);
            setError(err?.message || "Gagal daftar dengan Google. Silakan coba lagi.");
            setLoading(false);
        }
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
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            JOIN US
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base">
                            Create an account to start your adventure
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

                    {/* Full Name Input */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-[#DAEBCE]/30 focus-within:border-[#DAEBCE]/50 transition-all duration-300">
                            <FiUser className="text-gray-400 text-lg mr-3" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-transparent focus:outline-none w-full text-white placeholder-gray-500 text-sm md:text-base"
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-[#DAEBCE]/30 focus-within:border-[#DAEBCE]/50 transition-all duration-300">
                            <FiMail className="text-gray-400 text-lg mr-3" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                    {/* Confirm Password Input */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 hover:border-[#DAEBCE]/30 focus-within:border-[#DAEBCE]/50 transition-all duration-300">
                            <FiLock className="text-gray-400 text-lg mr-3" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="bg-transparent focus:outline-none w-full text-white placeholder-gray-500 text-sm md:text-base"
                            />
                            <button
                                type="button"
                                onClick={toggleConfirmPassword}
                                className="text-gray-400 hover:text-[#DAEBCE] transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <FiEye className="text-lg" />
                                ) : (
                                    <FiEyeOff className="text-lg" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms Agreement */}
                    <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border transition-all shrink-0 mt-0.5 ${agreeTerms ? 'bg-[#DAEBCE] border-[#DAEBCE]' : 'border-gray-400 bg-transparent'}`}>
                            {agreeTerms && <FiCheck className="w-full h-full text-[#0a0a0a] flex items-center justify-center" />}
                        </div>
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-xs md:text-sm">
                            I agree to the Terms of Service and Privacy Policy
                        </span>
                    </label>

                    {/* Register Button */}
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full bg-linear-to-r from-[#DAEBCE] to-[#9ec08f] text-[#0a0a0a] font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-[#DAEBCE]/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group mb-6"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                                <span>CREATING...</span>
                            </>
                        ) : (
                            <>
                                <span>SIGN UP</span>
                                <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* OR Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-linear-to-r from-white/10 to-transparent" />
                        <span className="text-gray-500 text-xs font-medium">OR</span>
                        <div className="flex-1 h-px bg-linear-to-l from-white/10 to-transparent" />
                    </div>

                    {/* Social Register */}
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <button
                            onClick={handleGoogleRegister}
                            disabled={loading}
                            className="relative group bg-white/5 border border-white/10 hover:border-white/30 rounded-xl px-4 py-3 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <FcGoogle className="text-xl" />
                            <span className="text-white text-sm font-medium hidden sm:inline">Google</span>
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-[#DAEBCE] font-semibold hover:text-white transition-colors"
                        >
                            Sign In
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

export default Register;

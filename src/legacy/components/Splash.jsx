"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "../next-router";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Splash = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const { setGuestMode } = useAuth();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleGuestMode = () => {
        setGuestMode();
        navigate("/dashboard");
    };

    return (
        <div
            className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden"
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

            {/* Content */}
            <div className={`relative z-10 w-full max-w-md text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-[#DAEBCE]/40 flex items-center justify-center overflow-hidden bg-linear-to-br from-[#DAEBCE]/10 to-transparent">
                        <img src="/images/reference/logo-parakelana.png" alt="Parakelana" className="w-28 h-28 object-contain rounded-full" />
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    PARAKELANA
                </h1>

                {/* Tagline */}
                <p className="text-[#DAEBCE] font-semibold mb-4 text-lg">
                    Penyewaan Alat Pendakian Premium
                </p>

                {/* Description */}
                <p className="text-gray-300 text-base leading-relaxed mb-8">
                    Sewa peralatan pendakian berkualitas tanpa harus beli mahal. Wujudkan petualangan gunung impianmu bersama kami.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                    {/* Login Button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full rounded-xl border border-[#DAEBCE]/35 bg-[#0f1110]/55 px-6 py-3 text-white font-semibold transition-all duration-300 hover:border-[#DAEBCE]/60 hover:bg-[#111813]/75 flex items-center justify-center gap-2 group backdrop-blur-xl"
                    >
                        <span>Masuk</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Register Button */}
                    <button
                        onClick={() => navigate("/register")}
                        className="w-full bg-linear-to-r from-[#DAEBCE] to-[#9ec08f] text-[#0a0a0a] rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#DAEBCE]/30 flex items-center justify-center gap-2 group active:scale-95"
                    >
                        <span>Daftar Sekarang</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Guest Button */}
                    <button
                        onClick={handleGuestMode}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/30 rounded-xl px-6 py-3 text-gray-300 font-semibold transition-all duration-300 hover:bg-white/10 flex items-center justify-center gap-2 group"
                    >
                        <span>Lanjutkan Sebagai Guest</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Footer text */}
                <p className="text-gray-500 text-sm mt-8">
                    @parakelana.adventure
                </p>
            </div>
        </div>
    );
};

export default Splash;

"use client";

import React from "react";
import { FiAward, FiTarget, FiZap, FiHeart } from "react-icons/fi";

export default function About() {
    return (
        <div 
            className="min-h-screen w-full relative overflow-x-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            }}
        >
            {/* Animated Background Pattern */}
            <div 
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: `url(/images/legacy/BG_PARAKELANA.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            />
            
            {/* Floating Gradient Orbs */}
            <div className="absolute top-10 md:top-20 left-5 md:left-10 w-40 h-40 md:w-72 md:h-72 bg-linear-to-r from-[#2a2a2a]/30 to-[#3a3a3a]/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 md:bottom-40 right-5 md:right-20 w-56 h-56 md:w-96 md:h-96 bg-linear-to-r from-[#1a1a1a]/20 to-[#2a2a2a]/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="pt-32 pb-8 px-4 sm:px-6 md:px-8">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Logo */}
                        <div className="mb-8 animate-fade-in-down">
                            <img
                                src="/images/reference/logo-parakelana.png"
                                alt="Logo Parakelana"
                                className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-full mx-auto shadow-2xl"
                            />
                        </div>

                        {/* Title */}
                        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-white via-gray-100 to-[#DAEBCE] bg-clip-text text-transparent mb-4">
                                Tentang Parakelana
                            </h1>
                            <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto">
                                Penyedia perlengkapan hiking premium untuk petualangan Anda yang tak terlupakan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
                    {/* Description Section */}
                    <div className="mb-16 animate-fade-in-up w-full" style={{ animationDelay: '150ms' }}>
                        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[#DAEBCE]/10 transition-all duration-300 p-8 md:p-12">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/5 to-transparent pointer-events-none" />
                            <div className="relative">
                                <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-light">
                                    <span className="text-[#DAEBCE] font-semibold">Parakelana</span> hadir untuk mendukung petualangan Anda tanpa harus membeli perlengkapan baru yang mahal. Kami menyediakan layanan penyewaan alat-alat pendakian berkualitas premium seperti tenda, carrier, sleeping bag, dan perlengkapan lainnya, siap menemani setiap langkah Anda menjelajahi keindahan alam Indonesia.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Why Choose Us */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in-up text-center" style={{ animationDelay: '200ms' }}>
                            Mengapa Memilih Parakelana?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                            {[
                                {
                                    icon: FiHeart,
                                    title: "Praktis & Terjangkau",
                                    desc: "Sewa perlengkapan berkualitas tanpa perlu investasi mahal"
                                },
                                {
                                    icon: FiAward,
                                    title: "Peralatan Premium",
                                    desc: "Semua perlengkapan terawat dan telah melalui quality check ketat"
                                },
                                {
                                    icon: FiTarget,
                                    title: "Ramah Lingkungan",
                                    desc: "Mendukung petualangan berkelanjutan dan menjaga kelestarian alam"
                                }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="group animate-fade-in-up"
                                    style={{ animationDelay: `${250 + index * 50}ms` }}
                                >
                                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#DAEBCE]/20 hover:-translate-y-1 p-6 h-full">
                                        <div className="absolute inset-0 bg-linear-to-b from-[#DAEBCE]/5 to-transparent pointer-events-none" />
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-linear-to-br from-[#DAEBCE] to-[#a896a4] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <item.icon className="text-black text-xl" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#DAEBCE] transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-300 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vision & Mission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full">
                        {/* Vision */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#DAEBCE]/10 transition-all duration-300 p-8 md:p-10 w-full h-full">
                                <div className="absolute inset-0 bg-linear-to-b from-[#DAEBCE]/10 to-transparent pointer-events-none" />
                                <div className="relative">
                                    <div className="flex items-center mb-4">
                                        <FiTarget className="text-[#DAEBCE] text-3xl mr-3" />
                                        <h3 className="text-2xl font-bold text-white">Visi Kami</h3>
                                    </div>
                                    <p className="text-gray-300 text-lg leading-relaxed">
                                        Membuat kegiatan mendaki dan petualangan lebih mudah diakses oleh siapa saja, sambil tetap menjaga kelestarian alam dan membangun komunitas pendaki yang solid.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mission */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#DAEBCE]/10 transition-all duration-300 p-8 md:p-10 w-full h-full">
                                <div className="absolute inset-0 bg-linear-to-b from-[#DAEBCE]/10 to-transparent pointer-events-none" />
                                <div className="relative">
                                    <div className="flex items-center mb-4">
                                        <FiZap className="text-[#DAEBCE] text-3xl mr-3" />
                                        <h3 className="text-2xl font-bold text-white">Misi Kami</h3>
                                    </div>
                                    <ul className="space-y-3 text-gray-300">
                                        <li className="flex items-start">
                                            <span className="text-[#DAEBCE] mr-3 mt-1">✓</span>
                                            <span>Menyediakan peralatan berkualitas dengan harga terjangkau</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-[#DAEBCE] mr-3 mt-1">✓</span>
                                            <span>Edukas & keselamatan petualang</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-[#DAEBCE] mr-3 mt-1">✓</span>
                                            <span>Layanan profesional & amanah</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center animate-fade-in-up w-full" style={{ animationDelay: '500ms' }}>
                        <div className="relative bg-linear-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12 w-full">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 via-transparent to-transparent pointer-events-none" />
                            <div className="relative">
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    Siap untuk Petualangan?
                                </h3>
                                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                                    Mulai jelajahi alam dengan perlengkapan terbaik dari Parakelana
                                </p>
                                <button className="px-8 py-3 md:px-10 md:py-4 bg-linear-to-r from-[#DAEBCE] to-[#a896a4] text-black font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-[#DAEBCE]/30 transition-all duration-300 hover:scale-105">
                                    Mulai Sewa Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in-down {
                    animation: fade-in-down 0.6s ease-out;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}

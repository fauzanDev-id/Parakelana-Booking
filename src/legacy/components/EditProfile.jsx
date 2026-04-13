"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "../next-router";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../utils/profileHelpers";
import { FaUser, FaUserTag, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaCheckCircle } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import bgParakelana from "../assets/BG_PARAKELANA.png";

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [gender, setGender] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success"); // success or error

    useEffect(() => {
        // Load profile data from context
        if (profile) {
            setName(profile.full_name || "");
            setUsername(profile.username || "");
            setGender(profile.gender || "");
            setPhone(profile.phone || "");
            setEmail(profile.email || user?.email || "");
            setAddress(profile.address || "");
        } else if (user) {
            // If profile not loaded yet, try from localStorage
            try {
                const stored = localStorage.getItem("parakelanaProfile");
                if (stored) {
                    const p = JSON.parse(stored);
                    setName(p.name || "");
                    setUsername(p.username || "");
                    setEmail(user.email || p.email || "");
                }
            } catch (e) {
                console.error("Error loading from localStorage:", e);
            }
        }
    }, [profile, user]);

    const handleBack = () => {
        navigate("/profile");
    };

    const showNotification = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi: User harus login
        if (!user?.id) {
            showNotification("Anda harus login terlebih dahulu", "error");
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        // Validasi: Nama dan username wajib diisi
        if (!name.trim()) {
            showNotification("Nama lengkap wajib diisi", "error");
            return;
        }

        if (!username.trim()) {
            showNotification("Username wajib diisi", "error");
            return;
        }

        setSaving(true);
        try {
            const updatedData = {
                full_name: name.trim(),
                username: username.trim(),
                gender: gender.trim(),
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
            };

            const result = await updateUserProfile(user.id, updatedData);

            localStorage.setItem("parakelanaProfile", JSON.stringify({
                email: result?.email || email.trim(),
                uid: user.id,
                name: result?.full_name || name.trim(),
                username: result?.username || username.trim(),
                phone: result?.phone || phone.trim(),
                gender: result?.gender || gender.trim(),
                address: result?.address || address.trim(),
                avatar_url: result?.avatar_url || profile?.avatar_url || null,
            }));

            // Refresh profile and wait for it to complete
            await refreshProfile();

            showNotification("Profil berhasil diperbarui!", "success");

            setTimeout(() => {
                navigate("/profile");
            }, 800);
        } catch (error) {
            console.error("❌ Error updating profile:", error);
            showNotification("Gagal memperbarui profil. Coba lagi.", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full relative overflow-x-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            }}
        >
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${
                        toastType === "success" 
                            ? "bg-green-500/90 border-green-400/50 text-white" 
                            : "bg-red-500/90 border-red-400/50 text-white"
                    }`}>
                        {toastType === "success" ? (
                            <FaCheckCircle className="text-2xl" />
                        ) : (
                            <div className="text-2xl">⚠️</div>
                        )}
                        <span className="font-semibold text-lg">{toastMessage}</span>
                    </div>
                </div>
            )}

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
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 pb-12 px-4 md:px-8">
                {/* Back Button - Top Left Corner */}
                <button
                    onClick={handleBack}
                    className="absolute left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300 z-20"
                >
                    <FiArrowLeft className="text-base" />
                    <span className="text-sm font-semibold">Kembali</span>
                </button>

                <div className="max-w-4xl mx-auto pt-20 md:pt-24">
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Edit Profil
                        </h1>
                        <p className="text-gray-400">Perbarui informasi pribadi Anda</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Grid Layout for Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaUser className="text-[#DAEBCE]" />
                                    Nama Lengkap <span className="text-red-400">*</span>
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaUserTag className="text-[#DAEBCE]" />
                                    Username <span className="text-red-400">*</span>
                                </label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    placeholder="Nama pengguna"
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Jenis Kelamin */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaVenusMars className="text-[#DAEBCE]" />
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all text-white"
                                >
                                    <option value="" className="bg-gray-800">Pilih jenis kelamin</option>
                                    <option value="Laki-laki" className="bg-gray-800">Laki-laki</option>
                                    <option value="Perempuan" className="bg-gray-800">Perempuan</option>
                                </select>
                            </div>

                            {/* No. Telepon */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaPhone className="text-[#DAEBCE]" />
                                    No. Telepon
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    type="tel"
                                    placeholder="08123456789"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaEnvelope className="text-[#DAEBCE]" />
                                    Email
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Alamat */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 font-semibold text-white text-sm">
                                    <FaMapMarkerAlt className="text-[#DAEBCE]" />
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Masukkan alamat lengkap"
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAEBCE] focus:border-transparent transition-all resize-none text-white placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 px-6 py-3 border-2 border-white/20 text-gray-300 font-semibold rounded-lg hover:bg-white/5 hover:border-white/30 transition-all duration-200"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#DAEBCE]/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                            >
                                {saving && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                )}
                                <FaSave className={saving ? "animate-pulse" : ""} />
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-[#DAEBCE]/10 border border-[#DAEBCE]/30 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                        <span className="font-semibold text-[#DAEBCE]">💡 Tips:</span> Pastikan nomor telepon dan email Anda valid untuk memudahkan komunikasi terkait pesanan.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
}

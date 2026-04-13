"use client";

import React, { useEffect, useState } from "react";
import { 
    FiEdit2, 
    FiUser, 
    FiCalendar, 
    FiBell, 
    FiLock, 
    FiLogOut, 
    FiShoppingCart, 
    FiPlus, 
    FiMinus, 
    FiTrash2, 
    FiCamera, 
    FiImage,
    FiArrowLeft,
    FiX,
    FiChevronRight,
    FiUpload,
    FiPackage,
    FiAlertCircle,
    FiCheck
} from "react-icons/fi";
import lampu from "../assets/bakpao.png";
import bgParakelana from "../assets/BG_PARAKELANA.png";
import { useNavigate } from "../next-router";
import { useAuth } from "../context/AuthContext";
import { uploadProfilePhoto, updateUserProfile, getUserBookings } from "../utils/profileHelpers";

export default function Profile() {
    const navigate = useNavigate();
    const { isGuest, logout, user, profile, refreshProfile } = useAuth();
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
        const [cart, setCart] = useState(() => {
                    if (typeof window === "undefined") {
                        return [];
                    }
                const parsePrice = (p) => {
                    if (typeof p === 'number') return p;
                    if (!p) return 0;
                    try {
                        const s = String(p);
                        const cleaned = s.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.');
                        const n = parseFloat(cleaned);
                        return Number.isFinite(n) ? n : 0;
                    } catch (e) {
                        return 0;
                    }
                };

                try {
                    const cartData = localStorage.getItem("parakelanaCart");
                    if (!cartData) return [];
                    const parsed = JSON.parse(cartData);
                    const arr = Array.isArray(parsed) ? parsed : [];
                    // sanitize numeric fields using parsePrice
                    return arr.map(it => {
                        const priceNum = parsePrice(it.price);
                        const qty = Number(it.quantity || 0);
                        const days = Number(it.totalDays || 1);
                        return {
                            ...it,
                            price: priceNum,
                            quantity: qty,
                            totalDays: days,
                            totalPrice: Number(it.totalPrice) || (priceNum * Math.max(1, qty) * Math.max(1, days))
                        };
                    });
                } catch (error) {
                    console.error("Error parsing cart:", error);
                    return [];
                }
            });
    const [showCart, setShowCart] = useState(false);
    const [profileName, setProfileName] = useState("Namamu");

    useEffect(() => {
        if (user && !isGuest) {
            fetchBookings();
        }
    }, [user, isGuest]);

    const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
            const data = await getUserBookings(user.id);
            setBookings(data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ongoing':
                return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: FiPackage, text: 'Sedang Berjalan', color: 'text-blue-400' };
            case 'completed':
                return { bg: 'bg-green-500/20', border: 'border-green-500/30', icon: FiCheck, text: 'Selesai (Dikonfirmasi Admin)', color: 'text-green-400' };
            case 'late':
                return { bg: 'bg-red-500/20', border: 'border-red-500/30', icon: FiAlertCircle, text: 'Terlambat', color: 'text-red-400' };
            default:
                return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: FiPackage, text: 'Pending', color: 'text-gray-400' };
        }
    };

    const DAILY_LATE_FINE = 10000;

    const normalizeDate = (value) => {
        const d = new Date(value);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const getLateInfo = (booking) => {
        if (!booking?.rental_end_date) {
            return { lateDays: 0, estimatedPenalty: 0, isOverdueActive: false };
        }

        const dueDate = normalizeDate(booking.rental_end_date);
        const compareDate = booking.return_date ? normalizeDate(booking.return_date) : normalizeDate(new Date());

        const lateDays = Math.max(0, Math.ceil((compareDate - dueDate) / (1000 * 60 * 60 * 24)));
        const estimatedPenalty = lateDays * DAILY_LATE_FINE;
        const isOverdueActive = !booking.return_date && booking.status !== 'completed' && lateDays > 0;

        return {
            lateDays,
            estimatedPenalty,
            isOverdueActive
        };
    };

    const handleLogout = async () => {
        setProfileName("Namamu");
        setShowCart(false);
        await logout();
        navigate("/");
    };

    const handleBack = () => {
        navigate("/dashboard");
    };

    // Compress and resize image before upload
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Resize to max 800x800 while maintaining aspect ratio
                    const maxSize = 800;
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            }));
                        },
                        'image/jpeg',
                        0.8 // 80% quality
                    );
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file || !user?.id) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        setShowPhotoOptions(false);

        try {
            // Compress image before upload
            const compressedFile = await compressImage(file);
            
            // Upload photo to Supabase Storage
            const photoUrl = await uploadProfilePhoto(user.id, compressedFile);
            
            // Update profile with new photo URL
            await updateUserProfile(user.id, { avatar_url: photoUrl });
            
            // Refresh profile data in background
            refreshProfile();
            
            setUploadingPhoto(false);
            alert('Foto berhasil diupload!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            setUploadingPhoto(false);
            alert(`Gagal upload foto: ${error.message || 'Silakan coba lagi'}`);
        }
    };

    useEffect(() => {
        // Load profile name from profile context
        if (profile?.full_name) {
            setProfileName(profile.full_name);
        } else if (profile?.username) {
            setProfileName(profile.username);
        } else {
            // Fallback to localStorage
            try {
                const stored = localStorage.getItem("parakelanaProfile");
                if (stored) {
                    const p = JSON.parse(stored);
                    setProfileName(p.name || p.username || "User");
                }
            } catch (error) {
                console.error("Error loading from localStorage:", error);
            }
        }
    }, [profile]);

    const updateCartQuantity = (id, newQuantity) => {
        const updatedCart = cart.map(item => {
            if (item.id === id) {
                const qty = Math.max(1, Number(newQuantity || 1));
                const price = Number(item.price || 0);
                const days = Number(item.totalDays || 1);
                return {
                    ...item,
                    quantity: qty,
                    totalPrice: price * qty * days
                };
            }
            return item;
        }).filter(item => item.quantity > 0);
        
        setCart(updatedCart);
        localStorage.setItem("parakelanaCart", JSON.stringify(updatedCart));
    };

    const removeFromCart = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem("parakelanaCart", JSON.stringify(updatedCart));
    };

    const totalCartPrice = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

    // Guest Mode - Simple View
    if (isGuest) {
        return (
            <div
                className="min-h-screen w-full relative overflow-x-hidden flex items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
                }}
            >
                {/* Animated Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url(${bgParakelana})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                    }}
                />
                
                {/* Gradient Orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 max-w-md w-full px-4">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="absolute left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300"
                    >
                        <FiArrowLeft className="text-base" />
                        <span className="text-sm font-semibold">Kembali</span>
                    </button>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 text-center">
                        {/* Guest Icon */}
                        <div className="mb-6">
                            <div className="w-24 h-24 mx-auto bg-linear-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                G
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-white mb-2">Guest Mode</h1>
                        <p className="text-gray-400 mb-8">Anda masuk sebagai tamu</p>

                        {/* Info */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                            <p className="text-yellow-300 text-sm">
                                Login untuk mengakses fitur lengkap seperti booking, profile, dan riwayat pesanan.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] rounded-xl px-6 py-3 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#DAEBCE]/30 active:scale-95"
                            >
                                Login Sekarang
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-white/10 border border-white/20 hover:border-red-500/50 rounded-xl px-6 py-3 text-gray-300 hover:text-red-400 font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <FiLogOut />
                                <span>Keluar dari Guest Mode</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full relative overflow-x-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            }}
        >
            {/* Animated Background Pattern */}
            <div 
                className="absolute inset-0 opacity-35 pointer-events-none"
                style={{
                    backgroundImage: `url(/images/legacy/BG_PARAKELANA.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            />
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="pt-10 md:pt-12 pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="absolute left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300"
                    >
                        <FiArrowLeft className="text-base" />
                        <span className="text-sm font-semibold">Kembali</span>
                    </button>

                    <div className="max-w-4xl mx-auto">
                        {/* Profile Header */}
                        <div className="text-center mb-6 md:mb-8 animate-fade-in-down pt-12 md:pt-10">
                            {/* Profile Photo */}
                            <div className="relative inline-block mb-6">
                                <div
                                    className="relative w-32 h-32 cursor-pointer group"
                                    onClick={() => !uploadingPhoto && setShowPhotoOptions(true)}
                                >
                                    <div className="absolute inset-0 bg-linear-to-br from-[#DAEBCE]/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all" />
                                    <img
                                        src={profile?.avatar_url || lampu}
                                        alt="Profile"
                                        className="relative rounded-full w-full h-full object-cover border-4 border-[#DAEBCE]/30 shadow-2xl group-hover:border-[#DAEBCE]/50 group-hover:scale-105 transition-all duration-300"
                                    />
                                    {uploadingPhoto ? (
                                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-[#DAEBCE] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 right-0 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] p-2.5 rounded-full shadow-lg group-hover:scale-110 transition-transform cursor-pointer border-2 border-[#0a0a0a]">
                                            <FiEdit2 className="text-[#0a0a0a] text-base" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {profileName || "User"}
                            </h1>
                            <p className="text-gray-400 text-sm">Member Parakelana</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
                    {/* Menu Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        {[
                            {
                                icon: FiUser,
                                label: "Edit Profil",
                                onClick: () => navigate("/edit-profile"),
                                gradient: "from-blue-500/20 to-blue-600/10"
                            },
                            {
                                icon: FiCalendar,
                                label: "Booking",
                                onClick: () => setShowBookingModal(true),
                                gradient: "from-purple-500/20 to-purple-600/10"
                            },
                            {
                                icon: FiBell,
                                label: "Notifikasi",
                                onClick: () => { },
                                gradient: "from-yellow-500/20 to-yellow-600/10"
                            },
                            {
                                icon: FiLock,
                                label: "Ubah Password",
                                onClick: () => { },
                                gradient: "from-red-500/20 to-red-600/10"
                            },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    onClick={item.onClick}
                                    className="relative group cursor-pointer animate-fade-in-up"
                                    style={{ animationDelay: `${150 + idx * 50}ms` }}
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                    <div className={`relative bg-linear-to-br ${item.gradient} backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-6`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Icon className="text-[#DAEBCE] text-xl" />
                                                </div>
                                                <span className="font-semibold text-white text-base">{item.label}</span>
                                            </div>
                                            <FiChevronRight className="text-gray-400 group-hover:text-[#DAEBCE] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up relative z-10" style={{ animationDelay: '350ms' }}>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 px-6 py-4 flex items-center justify-center gap-3">
                                <FiShoppingCart className="text-[#DAEBCE] text-xl" />
                                <span className="text-white font-semibold">Keranjang</span>
                                {cart.length > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-red-500/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 px-6 py-4 flex items-center justify-center gap-3">
                                <FiLogOut className="text-red-400 text-xl" />
                                <span className="text-white font-semibold">Logout</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Shopping Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-linear-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="relative p-6 border-b border-white/10">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiShoppingCart className="text-[#DAEBCE] text-2xl" />
                                    <h2 className="text-2xl font-bold text-white">
                                        Keranjang ({cart.length})
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowCart(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiX className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        {/* Cart Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 font-semibold text-lg mb-6">Keranjang Anda kosong</p>
                                    <button
                                        onClick={() => {
                                            setShowCart(false);
                                            navigate("/dashboard");
                                        }}
                                        className="px-6 py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DAEBCE]/20 transition-all duration-300"
                                    >
                                        Lanjut Berbelanja
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {cart.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-4"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-lg mb-2">{item.name}</h4>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                <FiCalendar className="text-[#DAEBCE]" />
                                                                <span>{item.startDate} → {item.endDate}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-400">
                                                                {item.totalDays} hari
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                                                    >
                                                        <FiTrash2 className="text-lg" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                                                        <button
                                                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 rounded-md font-bold transition-colors flex items-center justify-center"
                                                        >
                                                            <FiMinus />
                                                        </button>
                                                        <span className="font-bold text-white w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                            className="bg-green-500/80 hover:bg-green-500 text-white w-8 h-8 rounded-md font-bold transition-colors flex items-center justify-center"
                                                        >
                                                            <FiPlus />
                                                        </button>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                                                        <p className="font-bold text-[#DAEBCE] text-lg">
                                                            Rp {Number(item.totalPrice || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-2xl border border-[#DAEBCE]/30 p-6 mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-300 font-semibold">Total Item:</span>
                                            <span className="font-bold text-white text-lg">
                                                {cart.reduce((sum, item) => sum + item.quantity, 0)} pcs
                                            </span>
                                        </div>
                                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                            <span className="font-bold text-white text-lg">Total Harga:</span>
                                            <span className="text-2xl font-bold text-[#DAEBCE]">
                                                Rp {Number(totalCartPrice || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setShowCart(false);
                                                navigate("/dashboard");
                                            }}
                                            className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#DAEBCE]/30 text-white font-semibold rounded-xl transition-all duration-300"
                                        >
                                            Lanjut Belanja
                                        </button>
                                        <button
                                            onClick={() => navigate('/checkout')}
                                            className="px-6 py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DAEBCE]/20 transition-all duration-300"
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Photo Options Modal */}
            {showPhotoOptions && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
                    <div className="relative w-full md:max-w-md bg-linear-to-br from-[#1a1a1a] to-[#0f0f0f] md:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="relative p-6 border-b border-white/10">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent" />
                            <div className="relative">
                                <button
                                    onClick={() => setShowPhotoOptions(false)}
                                    className="absolute top-0 left-0 text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiArrowLeft className="text-xl" />
                                </button>
                                <h2 className="text-center text-xl font-bold text-white">
                                    Ubah Foto Profil
                                </h2>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 pb-8">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Upload from Gallery */}
                                <label className="relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#DAEBCE]/30 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                <FiImage className="text-green-400 text-xl" />
                                            </div>
                                            <span className="text-white text-sm font-medium">Galeri</span>
                                        </div>
                                    </div>
                                </label>

                                {/* Upload from Camera */}
                                <label className="relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#DAEBCE]/30 rounded-2xl p-6 transition-all duration-300 group-hover:scale-105">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                <FiCamera className="text-blue-400 text-xl" />
                                            </div>
                                            <span className="text-white text-sm font-medium">Kamera</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative w-full max-w-3xl max-h-[80vh] bg-linear-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="relative p-6 border-b border-white/10 shrink-0">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FiPackage className="text-[#DAEBCE] text-2xl" />
                                    <h2 className="text-2xl font-bold text-white">
                                        Riwayat Booking
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiX className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingBookings ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-[#DAEBCE]/30 border-t-[#DAEBCE] rounded-full animate-spin"></div>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiPackage className="text-6xl text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 font-semibold text-lg mb-3">Belum ada booking</p>
                                    <p className="text-gray-500 text-sm mb-6">Mulai pesan peralatan adventure Anda sekarang</p>
                                    <button
                                        onClick={() => {
                                            setShowBookingModal(false);
                                            navigate("/dashboard");
                                        }}
                                        className="px-6 py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#DAEBCE]/20 transition-all duration-300"
                                    >
                                        Mulai Booking
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map((booking) => {
                                        const lateInfo = getLateInfo(booking);
                                        const isOverdue = booking.status === 'ongoing' && lateInfo.isOverdueActive;
                                        const statusInfo = isOverdue
                                            ? { ...getStatusBadge('late'), text: 'Terlambat (Belum Kembali)' }
                                            : getStatusBadge(booking.status);
                                        const StatusIcon = statusInfo.icon;
                                        const confirmedPenalty = Number(booking.penalty_amount || 0);
                                        const calculatedPenalty = isOverdue ? lateInfo.estimatedPenalty : 0;
                                        const shownPenalty = confirmedPenalty > 0 ? confirmedPenalty : calculatedPenalty;
                                        return (
                                            <div key={booking.id} className="relative group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-5">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">Order ID</p>
                                                        <p className="text-sm font-mono font-bold text-[#DAEBCE]">{booking.order_id}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusInfo.bg} border ${statusInfo.border}`}>
                                                        <StatusIcon className={`text-sm ${statusInfo.color}`} />
                                                        <span className={`text-xs font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div className="mb-4 pb-4 border-b border-white/10">
                                                    <p className="text-xs text-gray-400 mb-2">Peralatan:</p>
                                                    <div className="space-y-2">
                                                        {Array.isArray(booking.items) && booking.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-sm">
                                                                <span className="text-gray-300">{item.name} × {item.quantity}</span>
                                                                <span className="text-[#DAEBCE] font-semibold">Rp {Number(item.totalPrice || 0).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Dates */}
                                                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">Tanggal Kembali</p>
                                                        <p className="text-sm font-semibold text-white">{new Date(booking.rental_end_date).toLocaleDateString('id-ID')}</p>
                                                    </div>
                                                    {booking.return_date && (
                                                        <div>
                                                            <p className="text-xs text-gray-400 mb-1">Tanggal Dikembalikan</p>
                                                            <p className={`text-sm font-semibold ${booking.status === 'late' ? 'text-red-400' : 'text-green-400'}`}>
                                                                {new Date(booking.return_date).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Total & Penalty */}
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">Total Bayar</p>
                                                        <p className="text-lg font-bold text-[#DAEBCE]">Rp {Number(booking.total_price || 0).toLocaleString()}</p>
                                                    </div>
                                                    {shownPenalty > 0 && (
                                                        <div className="text-right">
                                                            <p className="text-xs text-red-400 mb-1">
                                                                Denda Keterlambatan {isOverdue ? `(estimasi ${lateInfo.lateDays} hari)` : ''}
                                                            </p>
                                                            <p className="text-lg font-bold text-red-400">Rp {Number(shownPenalty || 0).toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {isOverdue && (
                                                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                                                        <p className="text-xs text-red-300 font-semibold">
                                                            Melewati tanggal pengembalian. Denda berjalan Rp 10.000/hari.
                                                        </p>
                                                    </div>
                                                )}

                                                {booking.status === 'completed' && (
                                                    <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                                                        <p className="text-xs text-green-300 font-semibold">
                                                            Pengembalian sudah dikonfirmasi admin. Booking Anda selesai.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Metode Pembayaran */}
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-xs text-gray-400">Metode Pembayaran: <span className="text-white font-semibold">{booking.payment_method.toUpperCase()}</span></p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
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

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-fade-in-down {
                    animation: fade-in-down 0.6s ease-out;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

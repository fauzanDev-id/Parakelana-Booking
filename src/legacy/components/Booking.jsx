"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "../next-router";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../utils/profileHelpers";
import { FiArrowLeft, FiCalendar, FiShoppingCart, FiPlus, FiMinus, FiCheck, FiInfo, FiHome, FiCreditCard } from "react-icons/fi";
import bgPattern from "../assets/BG_PARAKELANA.png";

export default function Booking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isGuest } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationData, setNotificationData] = useState({
        type: 'success',
        title: '',
        message: '',
        data: null
    });
    const [datesLocked, setDatesLocked] = useState(false);
    const [liveStock, setLiveStock] = useState(null);
    const [productExists, setProductExists] = useState(true);

    // Load dates from existing cart items on mount and when location changes
    useEffect(() => {
        try {
            // Check if there are already items in cart
            const cartData = localStorage.getItem("parakelanaCart");
            if (cartData) {
                const cart = JSON.parse(cartData);
                if (Array.isArray(cart) && cart.length > 0) {
                    // Use dates from first item in cart
                    const firstItem = cart[0];
                    if (firstItem.startDate && firstItem.endDate) {
                        setStartDate(firstItem.startDate);
                        setEndDate(firstItem.endDate);
                        setDatesLocked(true);
                        return; // Exit early, dates are locked
                    }
                }
            }
            // If no items in cart, reset dates
            setStartDate("");
            setEndDate("");
            setDatesLocked(false);
        } catch (error) {
            console.error("Error loading dates from cart:", error);
            setDatesLocked(false);
        }
    }, [location.key]); // Re-run every time we navigate (location.key changes on each navigation)

    // Sample item dari location state
    const item = location.state?.item || {
        name: "Tenda",
        price: 40000,
        img: null,
        description: "Tenda berkualitas tinggi dengan kapasitas 2-3 orang, tahan cuaca ekstrem, material anti air premium."
    };
    const availableStock = Number(liveStock ?? item?.stock ?? 9999);

    useEffect(() => {
        const syncStock = async () => {
            try {
                const products = await getProducts({ activeOnly: true });
                if (!Array.isArray(products) || products.length === 0) {
                    setProductExists(false);
                    setLiveStock(0);
                    return;
                }

                const found = products.find((product) => {
                    if (item?.id) return product.id === item.id;
                    return String(product.name || "").toLowerCase() === String(item.name || "").toLowerCase();
                });

                if (!found) {
                    setProductExists(false);
                    setLiveStock(0);
                    return;
                }

                setProductExists(true);
                setLiveStock(Number(found.stock ?? 0));
                setQuantity((prev) => {
                    const maxStock = Number(found.stock ?? 0);
                    if (maxStock <= 0) return 1;
                    return Math.min(Math.max(1, prev), maxStock);
                });
            } catch (error) {
                console.error("Failed to sync stock:", error);
                setProductExists(false);
                setLiveStock(0);
            }
        };

        syncStock();
        window.addEventListener("parakelanaCatalogUpdated", syncStock);
        window.addEventListener("focus", syncStock);

        return () => {
            window.removeEventListener("parakelanaCatalogUpdated", syncStock);
            window.removeEventListener("focus", syncStock);
        };
    }, [item?.id, item?.name]);

    const calculateTotalDays = () => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isFinite(start) || !isFinite(end)) return 1;
        const diffTime = end - start;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        return diffDays;
    };

    // Calculate billing periods (2 days 1 night = 1 period)
    const calculateBillingPeriods = () => {
        const days = calculateTotalDays();
        // Every 2 days = 1 billing period
        return Math.ceil(days / 2);
    };

    // Format duration display (e.g., "2 Hari 1 Malam", "4 Hari 2 Malam")
    const formatDuration = () => {
        const periods = calculateBillingPeriods();
        const days = periods * 2;
        const nights = periods;
        return `${days} Hari ${nights} Malam`;
    };

    const billingPeriods = calculateBillingPeriods();

    const totalDays = calculateTotalDays();
    
    const parsePrice = (p) => {
        if (typeof p === 'number') return p;
        if (!p) return 0;
        try {
            const s = String(p);
            // keep digits, dots and commas, remove currency text and /Hari
            const cleaned = s.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.');
            const n = parseFloat(cleaned);
            return Number.isFinite(n) ? n : 0;
        } catch (e) {
            return 0;
        }
    };

    const priceNumber = parsePrice(item.price);
    // Price calculation: price per 2D1N * quantity * billing periods
    const totalPrice = Number(priceNumber || 0) * Number(quantity || 0) * Number(billingPeriods || 1);

    const handleBooking = async () => {
        // Check if user is guest - redirect to login
        if (isGuest) {
            setNotificationData({
                type: 'error',
                title: 'Login Diperlukan',
                message: 'Silakan login terlebih dahulu untuk melakukan pemesanan.'
            });
            setShowNotification(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            return;
        }

        if (!startDate || !endDate || quantity < 1) {
            setNotificationData({
                type: 'error',
                title: 'Data Belum Lengkap',
                message: 'Silakan isi tanggal mulai, tanggal selesai, dan jumlah barang dengan benar.'
            });
            setShowNotification(true);
            return;
        }

        if (!productExists) {
            setNotificationData({
                type: 'error',
                title: 'Produk Tidak Tersedia',
                message: 'Produk ini sudah dihapus admin. Silakan pilih produk lain.'
            });
            setShowNotification(true);
            return;
        }

        if (quantity > availableStock) {
            setNotificationData({
                type: 'error',
                title: 'Stok Tidak Cukup',
                message: `Stok ${item.name} tersisa ${availableStock} item.`
            });
            setShowNotification(true);
            return;
        }

        setIsLoading(true);
        
        // Simpan ke localStorage (shopping cart)
        const cartItem = {
            id: Date.now(),
            productId: item.id || null,
            name: item.name,
            price: Number(priceNumber || 0),
            img: item.img,
            stock: availableStock,
            quantity: Number(quantity || 0),
            startDate,
            endDate,
            totalDays: Number(totalDays || 1),
            billingPeriods: Number(billingPeriods || 1),
            totalPrice: Number(totalPrice || 0)
        };

        // Ambil cart yang sudah ada
        let existingCart = [];
        try {
            const cartData = localStorage.getItem("parakelanaCart");
            existingCart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(existingCart)) {
                existingCart = [];
            }
        } catch (error) {
            console.error("Error parsing cart:", error);
            existingCart = [];
        }
        
        // Cek apakah item sudah ada di cart dengan tanggal yang sama
        const existingItemIndex = existingCart.findIndex(
            c => c.name === item.name && c.startDate === startDate && c.endDate === endDate
        );

        if (existingItemIndex >= 0) {
            // Tambah quantity jika sudah ada (safely coerce numbers)
            const nextQty = Number(existingCart[existingItemIndex].quantity || 0) + Number(quantity || 0);
            if (nextQty > availableStock) {
                setNotificationData({
                    type: 'error',
                    title: 'Stok Tidak Cukup',
                    message: `Total ${item.name} di keranjang melebihi stok (${availableStock}).`
                });
                setShowNotification(true);
                setIsLoading(false);
                return;
            }

            existingCart[existingItemIndex].quantity = nextQty;
            existingCart[existingItemIndex].price = Number(existingCart[existingItemIndex].price || 0);
            existingCart[existingItemIndex].totalDays = Number(existingCart[existingItemIndex].totalDays || 1);
            existingCart[existingItemIndex].totalPrice =
                existingCart[existingItemIndex].price *
                existingCart[existingItemIndex].quantity *
                existingCart[existingItemIndex].totalDays;
        } else {
            // Tambah item baru ke cart
            existingCart.push(cartItem);
        }

        localStorage.setItem("parakelanaCart", JSON.stringify(existingCart));

        setNotificationData({
            type: 'success',
            title: `${item.name} Ditambahkan!`,
            message: 'Barang berhasil ditambahkan ke keranjang. Pilih produk lain atau lihat keranjang di Profile.',
            data: {
                quantity,
                startDate,
                endDate,
                totalPrice
            }
        });
        setShowNotification(true);
        setIsLoading(false);

        setTimeout(() => {
            navigate("/dashboard");
        }, 2500);
    };

    const handleCheckout = async () => {
        // Check if user is guest - redirect to login
        if (isGuest) {
            setNotificationData({
                type: 'error',
                title: 'Login Diperlukan',
                message: 'Silakan login terlebih dahulu untuk melakukan pemesanan.'
            });
            setShowNotification(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            return;
        }

        if (!startDate || !endDate || quantity < 1) {
            setNotificationData({
                type: 'error',
                title: 'Data Belum Lengkap',
                message: 'Silakan isi tanggal mulai, tanggal selesai, dan jumlah barang dengan benar.'
            });
            setShowNotification(true);
            return;
        }

        if (!productExists) {
            setNotificationData({
                type: 'error',
                title: 'Produk Tidak Tersedia',
                message: 'Produk ini sudah dihapus admin. Silakan pilih produk lain.'
            });
            setShowNotification(true);
            return;
        }

        if (quantity > availableStock) {
            setNotificationData({
                type: 'error',
                title: 'Stok Tidak Cukup',
                message: `Stok ${item.name} tersisa ${availableStock} item.`
            });
            setShowNotification(true);
            return;
        }

        setIsLoading(true);
        
        // Simpan ke localStorage (shopping cart)
        const cartItem = {
            id: Date.now(),
            productId: item.id || null,
            name: item.name,
            price: Number(priceNumber || 0),
            img: item.img,
            stock: availableStock,
            quantity: Number(quantity || 0),
            startDate,
            endDate,
            totalDays: Number(totalDays || 1),
            billingPeriods: Number(billingPeriods || 1),
            totalPrice: Number(totalPrice || 0)
        };

        // Ambil cart yang sudah ada
        let existingCart = [];
        try {
            const cartData = localStorage.getItem("parakelanaCart");
            existingCart = cartData ? JSON.parse(cartData) : [];
            if (!Array.isArray(existingCart)) {
                existingCart = [];
            }
        } catch (error) {
            console.error("Error parsing cart:", error);
            existingCart = [];
        }
        
        // Cek apakah item sudah ada di cart dengan tanggal yang sama
        const existingItemIndex = existingCart.findIndex(
            c => c.name === item.name && c.startDate === startDate && c.endDate === endDate
        );

        if (existingItemIndex >= 0) {
            // Tambah quantity jika sudah ada
            const nextQty = Number(existingCart[existingItemIndex].quantity || 0) + Number(quantity || 0);
            if (nextQty > availableStock) {
                setNotificationData({
                    type: 'error',
                    title: 'Stok Tidak Cukup',
                    message: `Total ${item.name} di keranjang melebihi stok (${availableStock}).`
                });
                setShowNotification(true);
                setIsLoading(false);
                return;
            }

            existingCart[existingItemIndex].quantity = nextQty;
            existingCart[existingItemIndex].price = Number(existingCart[existingItemIndex].price || 0);
            existingCart[existingItemIndex].totalDays = Number(existingCart[existingItemIndex].totalDays || 1);
            existingCart[existingItemIndex].totalPrice =
                existingCart[existingItemIndex].price *
                existingCart[existingItemIndex].quantity *
                existingCart[existingItemIndex].totalDays;
        } else {
            // Tambah item baru ke cart
            existingCart.push(cartItem);
        }

        localStorage.setItem("parakelanaCart", JSON.stringify(existingCart));

        setNotificationData({
            type: 'success',
            title: `${item.name} Ditambahkan!`,
            message: 'Mengarahkan ke halaman pembayaran...',
            data: {
                quantity,
                startDate,
                endDate,
                totalPrice
            }
        });
        setShowNotification(true);
        setIsLoading(false);

        setTimeout(() => {
            navigate("/checkout");
        }, 1500);
    };

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
            
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#DAEBCE]/5 to-transparent rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="pt-10 md:pt-12 pb-8 px-4 sm:px-6 md:px-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="absolute left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300"
                        >
                            <FiArrowLeft className="text-base" />
                            <span className="text-sm font-semibold">Kembali</span>
                        </button>

                        {/* Title */}
                        <div className="text-center mb-12 pt-12 md:pt-10 animate-fade-in-down">
                            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-white via-gray-100 to-[#DAEBCE] bg-clip-text text-transparent mb-3">
                                Booking Perlengkapan
                            </h1>
                            <p className="text-gray-400 text-sm md:text-base">
                                Pesan perlengkapan pilihan Anda untuk petualangan berikutnya
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
                    <div className="grid md:grid-cols-5 gap-6 mb-8 animate-fade-in-up">
                        {/* Item Details */}
                        <div className="md:col-span-2 relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 p-8 overflow-hidden group-hover:bg-white/15">
                                {/* Image Container */}
                                <div className="relative aspect-square bg-linear-to-br from-white/5 to-white/10 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                                    {item.img ? (
                                        <img src={item.img} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="text-6xl">🎒</div>
                                    )}
                                </div>

                                {/* Item Info */}
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        {item.name}
                                    </h2>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <p className="text-gray-300 text-sm mb-4">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-2xl border border-[#DAEBCE]/30 p-4 mb-4">
                                        <p className="text-gray-400 text-xs font-semibold mb-1">Harga Per 2 Hari 1 Malam</p>
                                        <p className="text-3xl font-bold text-[#DAEBCE]">
                                            Rp {Number(priceNumber || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2 bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                                            <FiCheck className="text-[#DAEBCE]" /> Garansi Kualitas
                                        </p>
                                        <p className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                                            <FiCheck className="text-[#DAEBCE]" /> Gratis Konsultasi
                                        </p>
                                        <p className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                                            <FiCheck className="text-[#DAEBCE]" /> Asuransi Tersedia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <div className="md:col-span-3 relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 p-8 overflow-hidden group-hover:bg-white/15">
                                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#DAEBCE]/20 flex items-center justify-center">
                                        <FiShoppingCart className="text-[#DAEBCE]" />
                                    </div>
                                    Detail Pemesanan
                                </h3>

                                <div className="space-y-6">
                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-gray-300 font-semibold mb-3 text-sm">
                                            📦 Jumlah Barang
                                        </label>
                                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 w-fit">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="bg-red-500/80 hover:bg-red-500 text-white w-9 h-9 rounded-lg font-bold transition-colors flex items-center justify-center"
                                            >
                                                <FiMinus className="text-base" />
                                            </button>
                                            <span className="text-xl font-bold text-white w-8 text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (availableStock > 0) {
                                                        setQuantity(Math.min(availableStock, quantity + 1));
                                                    }
                                                }}
                                                disabled={availableStock <= 0 || quantity >= availableStock}
                                                className="bg-green-500/80 hover:bg-green-500 text-white w-9 h-9 rounded-lg font-bold transition-colors flex items-center justify-center"
                                            >
                                                <FiPlus className="text-base" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">Stok tersedia: <span className="text-[#DAEBCE] font-semibold">{availableStock}</span></p>
                                    </div>

                                    {!productExists && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                            <p className="text-xs text-red-300 font-semibold">
                                                Produk ini sudah tidak tersedia di katalog admin.
                                            </p>
                                        </div>
                                    )}

                                    {/* Start Date */}
                                    <div>
                                        <label className="text-gray-300 font-semibold mb-3 text-sm flex items-center gap-2">
                                            <FiCalendar className="text-[#DAEBCE]" /> Tanggal Mulai
                                            {datesLocked && <span className="text-xs text-[#DAEBCE] bg-[#DAEBCE]/20 px-2 py-0.5 rounded-full">🔒 Terkunci</span>}
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => !datesLocked && setStartDate(e.target.value)}
                                            disabled={datesLocked}
                                            className={`w-full ${datesLocked ? 'bg-white/10 cursor-not-allowed' : 'bg-white/5'} border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50 transition-all`}
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="text-gray-300 font-semibold mb-3 text-sm flex items-center gap-2">
                                            <FiCalendar className="text-[#DAEBCE]" /> Tanggal Selesai
                                            {datesLocked && <span className="text-xs text-[#DAEBCE] bg-[#DAEBCE]/20 px-2 py-0.5 rounded-full">🔒 Terkunci</span>}
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => !datesLocked && setEndDate(e.target.value)}
                                            disabled={datesLocked}
                                            className={`w-full ${datesLocked ? 'bg-white/10 cursor-not-allowed' : 'bg-white/5'} border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50 transition-all`}
                                        />
                                    </div>

                                    {/* Locked Dates Info */}
                                    {datesLocked && (
                                        <div className="bg-[#DAEBCE]/10 border border-[#DAEBCE]/30 rounded-xl p-3">
                                            <p className="text-xs text-gray-300 flex items-center gap-2">
                                                <FiInfo className="text-[#DAEBCE]" /> 
                                                Tanggal booking mengikuti produk pertama Anda
                                            </p>
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {totalDays > 0 && (
                                        <div className="bg-linear-to-r from-[#DAEBCE]/20 to-transparent border border-[#DAEBCE]/30 rounded-xl p-4">
                                            <p className="text-gray-300 font-semibold">
                                                📅 Durasi Sewa: <span className="text-[#DAEBCE] font-bold text-lg">{formatDuration()}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Price Summary */}
                                    <div className="bg-linear-to-br from-white/10 to-transparent rounded-2xl border border-white/20 p-6 space-y-3">
                                        <div className="flex justify-between items-center text-gray-300">
                                            <span className="text-sm">Harga per Item:</span>
                                            <span className="font-bold text-white">Rp {Number(priceNumber || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300">
                                            <span className="text-sm">Jumlah Item:</span>
                                            <span className="font-bold text-white">{quantity} pcs</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300">
                                            <span className="text-sm">Durasi Sewa:</span>
                                            <span className="font-bold text-white">{formatDuration()}</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                            <span className="text-white font-bold">Total Harga:</span>
                                            <span className="text-2xl font-bold text-[#DAEBCE]">
                                                Rp {Number(totalPrice || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Booking Buttons */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleBooking}
                                            disabled={isLoading}
                                            className="w-full bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-bold py-3.5 rounded-xl hover:shadow-xl hover:shadow-[#DAEBCE]/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                                        >
                                            <FiShoppingCart className="text-lg" />
                                            {isLoading ? "Memproses..." : "Tambah Produk"}
                                        </button>

                                        <button
                                            onClick={handleCheckout}
                                            disabled={isLoading}
                                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3.5 rounded-xl hover:bg-white/15 hover:border-[#DAEBCE]/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                                        >
                                            <FiCreditCard className="text-lg" />
                                            Lanjut Pembayaran
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                        <FiInfo className="text-[#DAEBCE]" /> Pembayaran saat pengambilan atau transfer bank
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-6 text-center">
                                <p className="text-4xl mb-4">🚚</p>
                                <h4 className="font-bold text-white mb-2">Pengambilan Mudah</h4>
                                <p className="text-sm text-gray-400">Ambil barang sesuai jadwal yang disepakati</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-6 text-center">
                                <p className="text-4xl mb-4">🛡️</p>
                                <h4 className="font-bold text-white mb-2">Asuransi Tersedia</h4>
                                <p className="text-sm text-gray-400">Lindungi barang Anda dengan asuransi terpercaya</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                            <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-6 text-center">
                                <p className="text-4xl mb-4">💬</p>
                                <h4 className="font-bold text-white mb-2">Bantuan 24/7</h4>
                                <p className="text-sm text-gray-400">Tim support siap membantu Anda kapan saja</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Modal */}
            {showNotification && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100" />
                        <div className={`relative bg-linear-to-br ${
                            notificationData.type === 'success' 
                                ? 'from-[#DAEBCE]/20 to-transparent border-[#DAEBCE]/30' 
                                : 'from-red-500/20 to-transparent border-red-500/30'
                        } backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden animate-fade-in-up`}>
                            {/* Header */}
                            <div className="relative p-8 flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                                    notificationData.type === 'success'
                                        ? 'bg-[#DAEBCE]/20'
                                        : 'bg-red-500/20'
                                }`}>
                                    <span className="text-4xl">
                                        {notificationData.type === 'success' ? '✅' : '⚠️'}
                                    </span>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    {notificationData.title}
                                </h2>

                                {/* Message */}
                                <p className="text-gray-300 text-sm mb-6">
                                    {notificationData.message}
                                </p>

                                {/* Data Display (for success) */}
                                {notificationData.type === 'success' && notificationData.data && (
                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-3 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Jumlah:</span>
                                            <span className="text-white font-bold">{notificationData.data.quantity} pcs</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Periode:</span>
                                            <span className="text-white font-bold text-xs">
                                                {notificationData.data.startDate} → {notificationData.data.endDate}
                                            </span>
                                        </div>
                                        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                                            <span className="text-gray-300 font-semibold">Total:</span>
                                            <span className="text-[#DAEBCE] font-bold text-lg">
                                                Rp {Number(notificationData.data.totalPrice || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Button */}
                                <button
                                    onClick={() => {
                                        setShowNotification(false);
                                        if (notificationData.type === 'error') {
                                            setNotificationData({
                                                type: 'success',
                                                title: '',
                                                message: '',
                                                data: null
                                            });
                                        }
                                    }}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                                        notificationData.type === 'success'
                                            ? 'bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] hover:shadow-lg hover:shadow-[#DAEBCE]/20'
                                            : 'bg-linear-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/20'
                                    }`}
                                >
                                    <FiCheck className="text-lg" />
                                    OKE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

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

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
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

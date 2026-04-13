"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "../next-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { getProducts, reserveProductStock, saveBooking } from "../utils/profileHelpers";
import { FiArrowLeft, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { FaQrcode, FaCheckCircle } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import qrisImg from "../assets/QRIS-PARAKELANA.jpeg";
import bgParakelana from "../assets/BG_PARAKELANA.png";

export default function Checkout() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [cart, setCart] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [products, setProducts] = useState([]);

    const findProductByCartItem = (catalog, item) => {
        if (!Array.isArray(catalog)) return null;
        if (item?.productId) {
            const foundById = catalog.find((p) => p.id === item.productId);
            if (foundById) return foundById;
        }
        return catalog.find((p) => String(p.name || "").toLowerCase() === String(item.name || "").toLowerCase()) || null;
    };

    useEffect(() => {
        loadCart();
        loadProducts();

        const reloadProducts = () => {
            loadProducts();
        };

        window.addEventListener("focus", reloadProducts);
        window.addEventListener("parakelanaCatalogUpdated", reloadProducts);

        return () => {
            window.removeEventListener("focus", reloadProducts);
            window.removeEventListener("parakelanaCatalogUpdated", reloadProducts);
        };
    }, []);

    const syncCartWithLatestStock = async (cartInput = null, { notify = false } = {}) => {
        try {
            const latestProducts = await getProducts({ activeOnly: true });
            setProducts(Array.isArray(latestProducts) ? latestProducts : []);

            const sourceCart = Array.isArray(cartInput) ? cartInput : cart;

            // Do not mutate cart when products fail to load; keep user cart intact.
            if (!Array.isArray(latestProducts) || latestProducts.length === 0) {
                if (notify) {
                    showNotification("Data produk belum siap. Coba lagi beberapa saat.", "error");
                }
                return { latestProducts: [], adjustedCart: sourceCart };
            }

            const adjustedCart = [];
            let changed = false;

            sourceCart.forEach((item) => {
                const product = findProductByCartItem(latestProducts, item);
                if (!product) {
                    // Keep unmatched item so user can still see cart and resolve manually.
                    adjustedCart.push({
                        ...item,
                        productUnavailable: true,
                    });
                    return;
                }

                const available = Math.max(0, Number(product.stock ?? 0));
                const currentQty = Math.max(0, Number(item.quantity || 0));
                const nextQty = Math.min(currentQty, available);

                if (nextQty <= 0) {
                    adjustedCart.push({
                        ...item,
                        productId: product.id,
                        stock: available,
                        quantity: currentQty,
                        productUnavailable: true,
                    });
                    return;
                }

                if (nextQty !== currentQty) {
                    changed = true;
                }

                adjustedCart.push({
                    ...item,
                    productId: product.id,
                    stock: available,
                    quantity: nextQty,
                    productUnavailable: false,
                    totalPrice: Number(item.price || 0) * nextQty * Number(item.totalDays || 1),
                });
            });

            if (changed) {
                saveCart(adjustedCart);
                if (notify) {
                    showNotification("Keranjang disesuaikan dengan stok terbaru.", "error");
                }
            }

            return { latestProducts, adjustedCart };
        } catch (error) {
            console.error("Failed to sync cart stock:", error);
            return { latestProducts: [], adjustedCart: Array.isArray(cartInput) ? cartInput : cart };
        }
    };

    const loadProducts = async () => {
        try {
            const data = await getProducts({ activeOnly: true });
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]);
        }
    };

    const loadCart = () => {
        try {
            const data = localStorage.getItem("parakelanaCart");
            const parsed = data ? JSON.parse(data) : [];
            const arr = Array.isArray(parsed) ? parsed : [];
            
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
            
            const safe = arr.map(it => ({
                ...it,
                price: parsePrice(it.price),
                quantity: Number(it.quantity || 1),
                totalDays: Number(it.totalDays || 1),
                totalPrice: Number(it.totalPrice) || (parsePrice(it.price) * Math.max(1, it.quantity || 1) * Math.max(1, it.totalDays || 1))
            }));
            setCart(safe);
        } catch (e) {
            console.error("Failed to load cart:", e);
            setCart([]);
        }
    };

    const saveCart = (newCart) => {
        localStorage.setItem("parakelanaCart", JSON.stringify(newCart));
        setCart(newCart);
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        const targetItem = cart.find((item) => item.id === id);
        if (!targetItem) return;

        const catalogProduct = findProductByCartItem(products, targetItem);
        const maxStock = Number(catalogProduct?.stock ?? targetItem?.stock ?? 9999);
        if (newQty > maxStock) {
            showNotification(`Stok ${targetItem.name} tersisa ${maxStock}.`, "error");
            return;
        }

        const updated = cart.map(item =>
            item.id === id
                ? { ...item, quantity: newQty, totalPrice: item.price * newQty * item.totalDays }
                : item
        );
        saveCart(updated);
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        saveCart(updated);
        showNotification("Item dihapus dari keranjang", "success");
    };

    const totalPrice = cart.reduce((s, it) => s + Number(it.totalPrice || 0), 0);
    const totalItems = cart.reduce((s, it) => s + Number(it.quantity || 0), 0);

    const showNotification = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const generateOrderId = () => {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `PRKLNA-${timestamp}-${random}`;
    };

    const RECEIPT_BUCKET = "receipts";

    const buildReceiptText = (orderId, cartItems, finalPrice, method) => {
        const userName = profile?.full_name || profile?.name || "Pelanggan";
        const userPhone = profile?.phone || "-";

        const itemsText = cartItems.map((item, index) =>
            `${index + 1}. ${item.name} x ${item.quantity} = Rp ${Number(item.totalPrice || 0).toLocaleString('id-ID')}`
        ).join("\n");

        return [
            "STRUK PEMBAYARAN PARAKELANA RENTAL",
            "================================",
            `Order ID       : ${orderId}`,
            `Nama           : ${userName}`,
            `No. HP         : ${userPhone}`,
            `Metode Bayar   : ${String(method || '').toUpperCase()}`,
            `Waktu Transaksi: ${new Date().toLocaleString('id-ID')}`,
            "",
            "Detail Pesanan:",
            itemsText,
            "",
            `TOTAL          : Rp ${Number(finalPrice || 0).toLocaleString('id-ID')}`,
            "================================"
        ].join("\n");
    };

    const generateFallbackReceiptLink = (orderId, cartItems, finalPrice, method) => {
        const receiptText = buildReceiptText(orderId, cartItems, finalPrice, method);
        return `data:text/plain;charset=utf-8,${encodeURIComponent(receiptText)}`;
    };

    const uploadReceiptTextFile = async (orderId, cartItems, finalPrice, method) => {
        const receiptText = buildReceiptText(orderId, cartItems, finalPrice, method);
        const filePath = `${user.id}/${orderId}.txt`;
        const receiptBlob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });

        const { error: uploadError } = await supabase.storage
            .from(RECEIPT_BUCKET)
            .upload(filePath, receiptBlob, {
                cacheControl: "3600",
                upsert: true,
                contentType: "text/plain"
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from(RECEIPT_BUCKET)
            .getPublicUrl(filePath);

        return publicUrlData?.publicUrl || "";
    };

    const buildAdminMessage = (orderId, cartItems, finalPrice, method, customReceiptLink = "") => {
        const userName = profile?.full_name || profile?.name || "Pelanggan";
        const userPhone = profile?.phone || "-";

        const itemsText = cartItems.map(item =>
            `• ${item.name} × ${item.quantity}: Rp ${Number(item.totalPrice || 0).toLocaleString()}`
        ).join("\n");

        const receiptText = customReceiptLink?.trim()
            ? `🔗 Link Struk/Bukti: ${customReceiptLink.trim()}`
            : "🧾 Bukti pembayaran: Akan dikirim sebagai gambar di chat ini";

        return `*PARAKELANA RENTAL - NOTIFIKASI PESANAN*\n\n📋 Order ID: ${orderId}\n👤 Nama: ${userName}\n📱 Nomor: ${userPhone}\n\n📦 *DETAIL BARANG:*\n${itemsText}\n\n💰 Total: Rp ${Number(finalPrice || 0).toLocaleString()}\n💳 Metode: ${method.toUpperCase()}\n${receiptText}\n\n🕒 Waktu: ${new Date().toLocaleString('id-ID')}\n\nCatatan: Mohon cek pesanan saya, terima kasih.`;
    };

    const sendToWhatsApp = (message) => {

        const waNumber = "62816228844";
        const encodedMessage = encodeURIComponent(message);
        const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        
        window.open(waLink, "_blank");
    };

    const handlePay = async () => {
        if (cart.length === 0) {
            showNotification("Keranjang kosong", "error");
            return;
        }

        if (!user?.id) {
            showNotification("Anda harus login terlebih dahulu", "error");
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        // Validasi profile - gunakan context atau localStorage
        try {
            let userProfile = profile;
            
            // Fallback ke localStorage jika context kosong
            if (!userProfile || !(userProfile.full_name || userProfile.name) || !userProfile.phone) {
                try {
                    const stored = localStorage.getItem("parakelanaProfile");
                    if (stored) {
                        userProfile = JSON.parse(stored);
                    }
                } catch (e) {
                    // no-op
                }
            }

            // Final validation
            if (!(userProfile?.full_name || userProfile?.name) || !userProfile?.phone) {
                showNotification("Harap lengkapi profil Anda terlebih dahulu", "error");
                setTimeout(() => navigate("/edit-profile"), 1500);
                return;
            }
        } catch (err) {
            console.error("Error checking profile:", err);
            showNotification("Gagal memverifikasi profil", "error");
            return;
        }

        setProcessing(true);
        
        try {
            const { latestProducts, adjustedCart } = await syncCartWithLatestStock(cart, { notify: true });
            if (!Array.isArray(adjustedCart) || adjustedCart.length === 0) {
                showNotification("Keranjang kosong atau stok produk habis.", "error");
                setProcessing(false);
                return;
            }

            const unavailableItems = adjustedCart.filter((item) => item.productUnavailable);
            if (unavailableItems.length > 0) {
                showNotification(`Produk tidak tersedia: ${unavailableItems[0].name}. Hapus item tersebut dari keranjang.`, "error");
                setProcessing(false);
                return;
            }

            // Save cart data before clearing
            const cartData = [...adjustedCart];
            const finalTotal = cartData.reduce((s, it) => s + Number(it.totalPrice || 0), 0);

            // Validate stock availability before processing
            const requestedByProduct = cartData.reduce((acc, item) => {
                const product = findProductByCartItem(latestProducts, item);
                if (!product?.id) return acc;
                const key = product.id;
                const current = acc[key] || {
                    product,
                    requested: 0,
                };
                current.requested += Number(item.quantity || 0);
                acc[key] = current;
                return acc;
            }, {});

            const stockIssues = Object.values(requestedByProduct)
                .map(({ product, requested }) => {
                    const available = Number(product.stock ?? 0);
                    if (requested > available) {
                        return `Stok ${product.name} tidak cukup (tersisa ${available}, diminta ${requested}).`;
                    }
                    return null;
                })
                .filter(Boolean);

            if (stockIssues.length > 0) {
                showNotification(stockIssues[0], "error");
                setProcessing(false);
                return;
            }
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            const stockReservationItems = cartData
                .map((item) => {
                    const product = findProductByCartItem(latestProducts, item);
                    return {
                        productId: product?.id,
                        quantity: Number(item.quantity || 0),
                    };
                })
                .filter((item) => item.productId && item.quantity > 0);

            if (stockReservationItems.length === 0) {
                showNotification("Produk di keranjang tidak valid untuk diproses.", "error");
                setProcessing(false);
                return;
            }

            const reservationResult = await reserveProductStock(stockReservationItems);
            if (!reservationResult?.success) {
                showNotification(reservationResult?.message || "Gagal mengunci stok produk.", "error");
                setProcessing(false);
                return;
            }
            
            // Generate order ID and upload receipt text file to storage
            const orderId = generateOrderId();
            let generatedReceiptLink = "";
            try {
                generatedReceiptLink = await uploadReceiptTextFile(orderId, cartData, finalTotal, paymentMethod);
            } catch (receiptError) {
                console.warn("Failed to upload receipt file, using fallback link:", receiptError);
                generatedReceiptLink = generateFallbackReceiptLink(orderId, cartData, finalTotal, paymentMethod);
            }
            const finalAdminMessage = buildAdminMessage(orderId, cartData, finalTotal, paymentMethod, generatedReceiptLink);
            
            // Get the earliest start date and latest end date from cart items
            const startDates = cartData.map(item => new Date(item.startDate || Date.now()));
            const endDates = cartData.map(item => new Date(item.endDate || Date.now()));
            const rentalStartDate = new Date(Math.min(...startDates)).toISOString().split('T')[0];
            const rentalEndDate = new Date(Math.max(...endDates)).toISOString().split('T')[0];
            
            // Save booking to Supabase
            try {
                await saveBooking(user.id, {
                    orderId: orderId,
                    items: cartData,
                    startDate: rentalStartDate,
                    endDate: rentalEndDate,
                    totalPrice: finalTotal,
                    paymentMethod: paymentMethod,
                    notes: finalAdminMessage
                });
            } catch (bookingErr) {
                console.warn("Booking save error (non-critical):", bookingErr);
                // Don't throw, continue with payment
            }
            await loadProducts();
            window.dispatchEvent(new Event("parakelanaCatalogUpdated"));
            
            // Clear cart
            localStorage.removeItem("parakelanaCart");
            setCart([]);
            
            showNotification("Pembayaran berhasil! Pesanan sedang diproses.", "success");
            
            // Send to WhatsApp after payment success
            setTimeout(() => {
                sendToWhatsApp(finalAdminMessage);
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error("Payment error:", error);
            showNotification("Gagal memproses pembayaran", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleBack = () => {
        navigate("/dashboard");
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

            {/* Background */}
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
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="fixed left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300 z-20"
                >
                    <FiArrowLeft className="text-base" />
                    <span className="text-sm font-semibold">Kembali</span>
                </button>

                <div className="max-w-5xl mx-auto pt-24">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Checkout
                        </h1>
                        <p className="text-gray-400">Tinjau pesanan dan pilih metode pembayaran</p>
                    </div>

                    {cart.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-lg font-semibold text-white mb-3">Keranjang Kosong</p>
                            <p className="text-gray-400 mb-6">Yuk mulai berbelanja dan sewa peralatan adventure</p>
                            <button 
                                onClick={() => navigate('/dashboard')} 
                                className="px-8 py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#DAEBCE]/30 transition-all"
                            >
                                Lanjut Belanja
                            </button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4">Item Pesanan</h2>
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{item.name}</p>
                                                    <p className="text-sm text-gray-400">
                                                        Rp {Number(item.price || 0).toLocaleString()} / hari
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">Durasi: {item.totalDays || 1} hari</p>
                                                    {item.productUnavailable && (
                                                        <p className="text-xs text-red-300 mt-1">Produk ini tidak tersedia / stok habis.</p>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mx-4">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 bg-white/10 hover:bg-white/20 rounded text-gray-300 transition-all"
                                                    >
                                                        <FiMinus size={16} />
                                                    </button>
                                                    <span className="w-8 text-center font-semibold text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 bg-white/10 hover:bg-white/20 rounded text-gray-300 transition-all"
                                                    >
                                                        <FiPlus size={16} />
                                                    </button>
                                                </div>

                                                {/* Price & Delete */}
                                                <div className="text-right">
                                                    <p className="font-bold text-[#DAEBCE]">
                                                        Rp {Number(item.totalPrice || 0).toLocaleString()}
                                                    </p>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="mt-2 p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 transition-all"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
                                    <h2 className="text-xl font-bold text-white mb-4">Metode Pembayaran</h2>
                                    <div className="space-y-3">
                                        {/* COD */}
                                        <div 
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                                                paymentMethod === 'cod'
                                                    ? 'bg-[#DAEBCE]/10 border-[#DAEBCE] shadow-lg shadow-[#DAEBCE]/20'
                                                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                                            }`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                paymentMethod === 'cod'
                                                    ? 'border-[#DAEBCE] bg-[#DAEBCE]/20'
                                                    : 'border-gray-400'
                                            }`}>
                                                {paymentMethod === 'cod' && (
                                                    <div className="w-3 h-3 rounded-full bg-[#DAEBCE]"></div>
                                                )}
                                            </div>
                                            <MdPayment className={`text-2xl ${paymentMethod === 'cod' ? 'text-[#DAEBCE]' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-semibold text-white">Bayar di Tempat (COD)</p>
                                                <p className="text-sm text-gray-400">Bayar saat pengambilan barang</p>
                                            </div>
                                        </div>

                                        {/* QRIS */}
                                        <div 
                                            onClick={() => setPaymentMethod('qris')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                                                paymentMethod === 'qris'
                                                    ? 'bg-[#DAEBCE]/10 border-[#DAEBCE] shadow-lg shadow-[#DAEBCE]/20'
                                                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
                                            }`}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                paymentMethod === 'qris'
                                                    ? 'border-[#DAEBCE] bg-[#DAEBCE]/20'
                                                    : 'border-gray-400'
                                            }`}>
                                                {paymentMethod === 'qris' && (
                                                    <div className="w-3 h-3 rounded-full bg-[#DAEBCE]"></div>
                                                )}
                                            </div>
                                            <FaQrcode className={`text-2xl ${paymentMethod === 'qris' ? 'text-[#DAEBCE]' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-semibold text-white">QRIS</p>
                                                <p className="text-sm text-gray-400">Scan QR code untuk pembayaran</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QRIS Display */}
                                    {paymentMethod === 'qris' && (
                                        <div className="mt-6 p-4 bg-white/5 border border-[#DAEBCE]/30 rounded-xl flex flex-col items-center gap-3">
                                            <p className="text-sm font-semibold text-[#DAEBCE]">Scan QR Code untuk melanjutkan pembayaran</p>
                                            <img 
                                                src={qrisImg} 
                                                alt="QRIS" 
                                                className="w-48 h-48 object-contain p-2 bg-white/5 rounded-lg"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-6 space-y-3">
                                        <label className="block text-sm font-semibold text-gray-200">
                                            Link Struk Pembayaran
                                        </label>
                                        <div className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-300">
                                            Link struk dibuat otomatis saat transaksi berhasil, lalu dikirim ke admin via WhatsApp.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 h-fit sticky top-32">
                                <h2 className="text-xl font-bold text-white mb-6">Ringkasan Pesanan</h2>
                                
                                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm text-gray-300">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span>Rp {Number(item.totalPrice || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Subtotal</span>
                                        <span>Rp {Number(totalPrice || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Pajak (0%)</span>
                                        <span>Rp 0</span>
                                    </div>
                                    <div className="flex justify-between text-gray-300">
                                        <span>Ongkir (0%)</span>
                                        <span>Rp 0</span>
                                    </div>
                                </div>

                                <div className="mb-6 pb-6 border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-bold text-[#DAEBCE]">
                                            Rp {Number(totalPrice || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePay}
                                    disabled={processing || cart.length === 0}
                                    className="w-full py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#0a0a0a] font-semibold rounded-lg hover:shadow-lg hover:shadow-[#DAEBCE]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                                >
                                    {processing && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    )}
                                    <span>{processing ? 'Memproses...' : 'Konfirmasi Pesanan'}</span>
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Dengan melanjutkan, Anda setuju dengan syarat dan ketentuan kami
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

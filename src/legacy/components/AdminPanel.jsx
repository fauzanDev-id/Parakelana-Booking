"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiBox, FiCheckCircle, FiClock, FiEdit2, FiImage, FiLogOut, FiPackage, FiPlus, FiRefreshCw, FiSave, FiSearch, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { createProduct, deactivateProduct, getProducts, updateProduct } from "../utils/profileHelpers";
import bgPattern from "../assets/BG_PARAKELANA.png";
const DAILY_FINE = 10000;

const initialForm = {
    name: "",
    category: "popular",
    price: "",
    stock: "",
    img: "",
    description: "",
};

export default function AdminPanel() {
    const { logout, adminEmail } = useAuth();
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [form, setForm] = useState(initialForm);
    const [savingProduct, setSavingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        loadProducts();
        loadBookings();
    }, []);

    const parsePrice = (value) => {
        if (typeof value === "number") return value;
        const normalized = String(value || "").replace(/[^0-9]/g, "");
        return Number(normalized || 0);
    };

    const formatPrice = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}/Hari`;

    const loadProducts = async () => {
        try {
            const data = await getProducts({ activeOnly: false });
            setProducts(data || []);
        } catch (e) {
            console.error("Failed to load products:", e);
            setProducts([]);
        }
    };

    const loadBookings = async () => {
        setLoadingBookings(true);
        try {
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (e) {
            console.error("Failed to load bookings:", e);
            setBookings([]);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleProductImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({ ...prev, img: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        const priceValue = parsePrice(form.price);
        const stockValue = Number(form.stock || 0);

        if (!form.name.trim()) {
            alert("Nama produk wajib diisi.");
            return;
        }
        if (priceValue <= 0) {
            alert("Harga produk harus lebih dari 0.");
            return;
        }
        if (stockValue < 0) {
            alert("Stok tidak boleh negatif.");
            return;
        }

        setSavingProduct(true);

        try {
            if (editingProductId) {
                await updateProduct(editingProductId, {
                    name: form.name.trim(),
                    category: form.category,
                    price: priceValue,
                    stock: stockValue,
                    image_url: form.img,
                    description: form.description.trim(),
                    is_active: true,
                });
                cancelEditProduct();
            } else {
                await createProduct({
                    name: form.name.trim(),
                    category: form.category,
                    price: priceValue,
                    stock: stockValue,
                    image_url: form.img,
                    description: form.description.trim(),
                    is_active: true,
                });
                setForm(initialForm);
            }

            await loadProducts();
            window.dispatchEvent(new Event("parakelanaCatalogUpdated"));
        } catch (err) {
            console.error("Save product error:", err);
            alert(`Gagal menyimpan produk ke Supabase: ${err?.message || "Unknown error"}`);
        } finally {
            setSavingProduct(false);
        }
    };

    const startEditProduct = (product) => {
        setEditingProductId(product.id);
        setForm({
            name: product.name,
            category: product.category,
            price: String(product.priceValue || ""),
            stock: String(product.stock ?? ""),
            img: product.img || "",
            description: product.description || "",
        });
    };

    const cancelEditProduct = () => {
        setEditingProductId(null);
        setForm(initialForm);
    };

    const updateStock = async (id, nextStock) => {
        const stock = Math.max(0, Number(nextStock || 0));
        const current = products.find((p) => p.id === id);
        if (!current) return;

        try {
            await updateProduct(id, {
                name: current.name,
                category: current.category,
                price: current.priceValue,
                stock,
                image_url: current.img,
                description: current.description,
                is_active: current.is_active !== false,
            });
            await loadProducts();
            window.dispatchEvent(new Event("parakelanaCatalogUpdated"));
        } catch (err) {
            console.error("Update stock error:", err);
            alert("Gagal mengubah stok.");
        }
    };

    const removeProduct = async (id) => {
        if (!window.confirm("Hapus produk ini dari katalog user?")) return;
        try {
            await deactivateProduct(id);
            await loadProducts();
            window.dispatchEvent(new Event("parakelanaCatalogUpdated"));
            if (editingProductId === id) cancelEditProduct();
        } catch (err) {
            console.error("Deactivate product error:", err);
            alert("Gagal menghapus produk.");
        }
    };

    const normalizeDate = (value) => {
        const d = new Date(value);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const confirmReturn = async (booking) => {
        const dateInput = window.prompt("Masukkan tanggal kembali (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
        if (!dateInput) return;

        try {
            const due = normalizeDate(booking.rental_end_date);
            const returned = normalizeDate(dateInput);
            const lateDays = Math.max(0, Math.ceil((returned - due) / (1000 * 60 * 60 * 24)));
            const penalty = lateDays * DAILY_FINE;

            const { error } = await supabase
                .from("bookings")
                .update({
                    return_date: dateInput,
                    penalty_amount: penalty,
                    status: "completed",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", booking.id);

            if (error) throw error;

            await loadBookings();
            alert(`Pengembalian dikonfirmasi. Denda: Rp ${penalty.toLocaleString("id-ID")}.`);
        } catch (e) {
            console.error("Confirm return error:", e);
            alert("Gagal konfirmasi pengembalian.");
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchCategory = categoryFilter === "all" ? true : product.category === categoryFilter;
            const matchQuery = query.trim()
                ? product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase())
                : true;
            return matchCategory && matchQuery;
        });
    }, [products, categoryFilter, query]);

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const lowStock = products.filter((p) => Number(p.stock || 0) <= 5).length;
        const activeBookings = bookings.filter((b) => b.status === "ongoing").length;
        const completedBookings = bookings.filter((b) => b.status === "completed").length;
        return { totalProducts, lowStock, activeBookings, completedBookings };
    }, [products, bookings]);

    return (
        <div
            className="min-h-screen w-full relative overflow-x-hidden"
            style={{
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
            }}
        >
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage: `url(/images/legacy/BG_PARAKELANA.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-[#DAEBCE] mb-2">Admin Control Center</p>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Panel Admin Parakelana</h1>
                        <p className="text-gray-400 mt-2 text-sm md:text-base">Kelola seluruh katalog produk, stok, booking, pengembalian, dan update konten produk.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm px-4 py-2 rounded-full border border-white/15 bg-white/5 text-gray-300">
                            {adminEmail || "Admin"}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 hover:bg-red-500/30 transition-all inline-flex items-center gap-2"
                        >
                            <FiLogOut /> Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={FiBox} label="Total Produk" value={stats.totalProducts} />
                    <StatCard icon={FiClock} label="Stok Menipis" value={stats.lowStock} />
                    <StatCard icon={FiPackage} label="Booking Aktif" value={stats.activeBookings} />
                    <StatCard icon={FiCheckCircle} label="Booking Selesai" value={stats.completedBookings} />
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { id: "products", label: "Kelola Produk" },
                        { id: "bookings", label: "Riwayat & Konfirmasi" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                                activeTab === tab.id
                                    ? "bg-[#DAEBCE]/15 border-[#DAEBCE]/40 text-[#DAEBCE]"
                                    : "bg-white/5 border-white/15 text-gray-300 hover:border-white/30"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "products" && (
                    <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl font-bold text-white">{editingProductId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
                                {editingProductId && (
                                    <button
                                        type="button"
                                        onClick={cancelEditProduct}
                                        className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-gray-200 hover:border-white/40 text-sm inline-flex items-center gap-2"
                                    >
                                        <FiX /> Batal Edit
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <InputLabel label="Nama Produk">
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Contoh: Trekking Pole Carbon"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50"
                                    />
                                </InputLabel>

                                <div className="grid grid-cols-2 gap-3">
                                    <InputLabel label="Kategori">
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#DAEBCE]/50"
                                        >
                                            <option value="popular" className="bg-[#111]">Popular</option>
                                            <option value="other" className="bg-[#111]">Other</option>
                                        </select>
                                    </InputLabel>
                                    <InputLabel label="Stok">
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.stock}
                                            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                                            placeholder="0"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50"
                                        />
                                    </InputLabel>
                                </div>

                                <InputLabel label="Harga per Hari (angka)">
                                    <input
                                        value={form.price}
                                        onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                                        placeholder="Contoh: 25000"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50"
                                    />
                                </InputLabel>

                                <InputLabel label="Upload Gambar Produk">
                                    <label className="w-full rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-3 text-gray-300 cursor-pointer hover:border-[#DAEBCE]/50 transition-all inline-flex items-center gap-2">
                                        <FiUpload /> Pilih file gambar
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                                            className="hidden"
                                        />
                                    </label>
                                </InputLabel>

                                <InputLabel label="Atau URL Gambar">
                                    <input
                                        value={form.img.startsWith("data:") ? "" : form.img}
                                        onChange={(e) => setForm((prev) => ({ ...prev, img: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50"
                                    />
                                </InputLabel>

                                {form.img && (
                                    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                                        <p className="text-xs text-gray-400 mb-2 inline-flex items-center gap-2"><FiImage /> Preview gambar</p>
                                        <img src={form.img} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                                    </div>
                                )}

                                <InputLabel label="Deskripsi Produk">
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Contoh: Cocok untuk trekking malam, tahan air, ringan dibawa."
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50 resize-none"
                                    />
                                </InputLabel>

                                <button
                                    type="submit"
                                    disabled={savingProduct}
                                    className="w-full rounded-xl bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#081109] font-bold py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {editingProductId ? <FiSave /> : <FiPlus />}
                                    {savingProduct ? "Menyimpan..." : editingProductId ? "Simpan Perubahan" : "Tambah Produk"}
                                </button>
                            </form>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Cari nama produk atau deskripsi..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50"
                                    />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:border-[#DAEBCE]/50"
                                >
                                    <option value="all" className="bg-[#111]">Semua Kategori</option>
                                    <option value="popular" className="bg-[#111]">Popular</option>
                                    <option value="other" className="bg-[#111]">Other</option>
                                </select>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-4">Katalog Produk ({filteredProducts.length})</h2>
                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Tidak ada produk yang cocok dengan filter.</div>
                            ) : (
                                <div className="space-y-3 max-h-160 overflow-y-auto pr-1">
                                    {filteredProducts.map((product) => (
                                        <div key={product.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex gap-3">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                                    {product.img ? (
                                                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">{product.category}</p>
                                                            <h3 className="text-white font-semibold">{product.name}</h3>
                                                            <p className="text-[#DAEBCE] text-sm font-semibold mt-1">{formatPrice(product.priceValue)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => startEditProduct(product)}
                                                                className="p-2 rounded-lg bg-blue-500/15 text-blue-300 hover:bg-blue-500/30 transition-all"
                                                                title="Edit produk"
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                onClick={() => removeProduct(product.id)}
                                                                className="p-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 transition-all"
                                                                title="Hapus produk"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {product.description ? (
                                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                                                    ) : null}

                                                    <div className="mt-3 flex items-center gap-3">
                                                        <label className="text-xs text-gray-400">Stok</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={product.stock}
                                                            onChange={(e) => updateStock(product.id, e.target.value)}
                                                            className="w-24 bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#DAEBCE]/50"
                                                        />
                                                        <span className={`text-xs px-2 py-1 rounded-full ${Number(product.stock || 0) > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                                                            {Number(product.stock || 0) > 0 ? "Tersedia" : "Habis"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "bookings" && (
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Riwayat Booking & Konfirmasi Pengembalian</h2>
                            <button
                                onClick={loadBookings}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-gray-200 hover:border-[#DAEBCE]/40"
                            >
                                <FiRefreshCw /> Refresh
                            </button>
                        </div>

                        {loadingBookings ? (
                            <div className="py-12 text-center text-gray-400">Memuat data booking...</div>
                        ) : bookings.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">Belum ada data booking.</div>
                        ) : (
                            <div className="space-y-4 max-h-155 overflow-y-auto pr-1">
                                {bookings.map((booking) => {
                                    const canConfirm = booking.status !== "completed";
                                    return (
                                        <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-400">Order ID</p>
                                                    <p className="font-mono text-sm text-[#DAEBCE] font-bold">{booking.order_id}</p>
                                                    <p className="text-xs text-gray-400 mt-2">User ID: <span className="text-gray-300">{booking.user_id}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <StatusBadge status={booking.status} />
                                                    <p className="text-xs text-gray-400 mt-2">Total: <span className="text-white font-semibold">Rp {Number(booking.total_price || 0).toLocaleString("id-ID")}</span></p>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs text-gray-300">
                                                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                                    <p className="text-gray-400">Jatuh Tempo Kembali</p>
                                                    <p className="text-white font-semibold mt-1">{new Date(booking.rental_end_date).toLocaleDateString("id-ID")}</p>
                                                </div>
                                                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                                    <p className="text-gray-400">Return Date</p>
                                                    <p className="text-white font-semibold mt-1">{booking.return_date ? new Date(booking.return_date).toLocaleDateString("id-ID") : "Belum dikembalikan"}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <span className="text-xs text-gray-400">Denda tersimpan: <span className="text-red-300 font-semibold">Rp {Number(booking.penalty_amount || 0).toLocaleString("id-ID")}</span></span>
                                                {canConfirm ? (
                                                    <button
                                                        onClick={() => confirmReturn(booking)}
                                                        className="px-3 py-2 rounded-xl bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#081109] text-sm font-semibold inline-flex items-center gap-2"
                                                    >
                                                        <FiSave /> Konfirmasi Pengembalian
                                                    </button>
                                                ) : (
                                                    <span className="px-3 py-2 rounded-xl border border-green-400/30 bg-green-500/15 text-xs text-green-300 inline-flex items-center gap-2">
                                                        <FiCheckCircle /> Sudah selesai
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function InputLabel({ label, children }) {
    return (
        <label className="block">
            <p className="text-sm text-gray-300 font-semibold mb-2">{label}</p>
            {children}
        </label>
    );
}

function StatCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</p>
                <Icon className="text-[#DAEBCE]" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function StatusBadge({ status }) {
    if (status === "completed") {
        return <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">Selesai</span>;
    }
    if (status === "late") {
        return <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30">Terlambat</span>;
    }
    if (status === "ongoing") {
        return <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">Berjalan</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-300 border border-gray-500/30">Pending</span>;
}

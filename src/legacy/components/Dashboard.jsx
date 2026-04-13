"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from "../next-router";
import { FiHeart, FiSearch, FiArrowRight, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import { getProducts } from '../utils/profileHelpers';

// Import images from src/assets
import tenda2 from '../assets/tenda2.png';
import carrier from '../assets/carrier.png';
import sleepingBag from '../assets/sleeping_Bags.png';
import matras from '../assets/matras.png';
import jaket from '../assets/jaket.png';
import sarungTangan from '../assets/sarungtangan.png';
import headlamp from '../assets/alat.jpeg';

import kompor from '../assets/kompor.png';
import cookingSet from '../assets/cookingset.png';
import lampu from '../assets/bakpao.png';
import pole from '../assets/trackingpole.png';
import gas from '../assets/gas.png';
import kursi from '../assets/kursi.png';
import meja from '../assets/meja.png';

import gunungPrau from '../assets/gunung_prau.jpeg';
import sindoro from '../assets/sindoro.jpg';
import rinjani from '../assets/rinjani.jpg';
import campingImg from '../assets/camping.jpeg';
import viewImg from '../assets/View.jpeg';
import viewAltImg from '../assets/View2.jpeg';
import bgPattern from '../assets/BG_PARAKELANA.png';


const popularItems = [
    { name: 'Tenda', price: 'Rp 40.000/Hari', img: tenda2, category: 'popular' },
    { name: 'Carrier', price: 'Rp 25.000/Hari', img: carrier, category: 'popular' },
    { name: 'Sleeping Bags', price: 'Rp 10.000/Hari', img: sleepingBag, category: 'popular' },
    { name: 'Matras', price: 'Rp 5.000/Hari', img: matras, category: 'popular' },
    { name: 'Jaket', price: 'Rp 25.000/Hari', img: jaket, category: 'popular' },
    { name: 'Sarung Tangan', price: 'Rp 7.000/Hari', img: sarungTangan, category: 'popular' },
    { name: 'Headlamp', price: 'Rp 10.000/Hari', img: headlamp, category: 'popular' },
    { name: 'Sleeping Pad', price: 'Rp 8.000/Hari', img: matras, category: 'popular' },
    { name: 'Raincoat', price: 'Rp 15.000/Hari', img: jaket, category: 'popular' },
    { name: 'Boots Hiking', price: 'Rp 35.000/Hari', img: headlamp, category: 'popular' },
    { name: 'Compass', price: 'Rp 12.000/Hari', img: pole, category: 'popular' },
    { name: 'Hat/Cap', price: 'Rp 8.000/Hari', img: sarungTangan, category: 'popular' },
    { name: 'Backpack 70L', price: 'Rp 50.000/Hari', img: carrier, category: 'popular' },
    { name: 'Thermal Gloves', price: 'Rp 9.000/Hari', img: sarungTangan, category: 'popular' },
    { name: 'Oxygen Mask', price: 'Rp 20.000/Hari', img: headlamp, category: 'popular' },
];

const otherItems = [
    { name: 'Kompor', price: 'Rp 10.000/Hari', img: kompor, category: 'other' },
    { name: 'Cooking Set', price: 'Rp 10.000/Hari', img: cookingSet, category: 'other' },
    { name: 'Lampu Bakpo', price: 'Rp 10.000/Hari', img: lampu, category: 'other' },
    { name: 'Tracking Pole', price: 'Rp 10.000/Hari', img: pole, category: 'other' },
    { name: 'Gas Portable', price: 'Rp 10.000/Hari', img: gas, category: 'other' },
    { name: 'Kursi Lipat', price: 'Rp 15.000/Hari', img: kursi, category: 'other' },
    { name: 'Meja Lipat', price: 'Rp 20.000/Hari', img: meja, category: 'other' },
    { name: 'Tali Sepatu', price: 'Rp 3.000/Hari', img: sarungTangan, category: 'other' },
    { name: 'Water Bottle', price: 'Rp 5.000/Hari', img: cookingSet, category: 'other' },
    { name: 'Backpack Rain Cover', price: 'Rp 8.000/Hari', img: carrier, category: 'other' },
    { name: 'Bantalan Leher', price: 'Rp 4.000/Hari', img: matras, category: 'other' },
    { name: 'Emergency Whistle', price: 'Rp 2.000/Hari', img: headlamp, category: 'other' },
    { name: 'Thermal Underwear', price: 'Rp 12.000/Hari', img: jaket, category: 'other' },
    { name: 'Map & GPS', price: 'Rp 25.000/Hari', img: pole, category: 'other' },
    { name: 'First Aid Kit', price: 'Rp 30.000/Hari', img: lampu, category: 'other' },
    { name: 'Tent Stakes', price: 'Rp 5.000/Hari', img: kompor, category: 'other' },
    { name: 'Rope 50M', price: 'Rp 18.000/Hari', img: pole, category: 'other' },
    { name: 'Carabiner Set', price: 'Rp 22.000/Hari', img: gas, category: 'other' },
    { name: 'Harness', price: 'Rp 35.000/Hari', img: carrier, category: 'other' },
    { name: 'Karabiners Lock', price: 'Rp 8.000/Hari', img: meja, category: 'other' },
];

const openTrips = [
    {
        name: 'Gunung Prau',
        posterTag: 'Sunrise Camp',
        atmosphere: 'Golden dawn escape',
        location: 'Dieng, Jawa Tengah',
        duration: '2 Hari 1 Malam',
        price: 'Rp 425.000',
        priceValue: 425000,
        status: 'open',
        slotInfo: '12 slot tersisa',
        desc: 'Open trip santai dengan bonus sunrise Bukit Sikunir, leader berpengalaman, dan itinerary ramah pendaki pemula.',
        img: gunungPrau,
        highlights: ['Transport PP', 'Leader & briefing', 'Dokumentasi trip'],
        schedules: ['21-22 Maret 2026', '18-19 April 2026'],
        posterTone: 'from-amber-200/25 via-yellow-100/10 to-transparent',
        infoTone: 'from-amber-300/15 to-emerald-200/5',
        accentTone: 'text-amber-100',
        actionTone: 'from-[#f4df8f] to-[#d5f1bb]',
    },
    {
        name: 'Gunung Sindoro',
        posterTag: 'Summit Attack',
        atmosphere: 'Cold ridge edition',
        location: 'Temanggung, Jawa Tengah',
        duration: '2 Hari 1 Malam',
        price: 'Rp 575.000',
        priceValue: 575000,
        status: 'open',
        slotInfo: '8 slot tersisa',
        desc: 'Trip intens untuk pendaki yang ingin summit attack dengan support logistik rapi dan ritme pendakian terukur.',
        img: sindoro,
        highlights: ['Transport PP', 'Simaksi', 'Konsumsi basecamp'],
        schedules: ['28-29 Maret 2026', '25-26 April 2026'],
        posterTone: 'from-cyan-200/20 via-slate-100/10 to-transparent',
        infoTone: 'from-sky-300/10 to-blue-100/5',
        accentTone: 'text-cyan-100',
        actionTone: 'from-[#d8f4ff] to-[#bfe1d7]',
    },
    {
        name: 'Gunung Rinjani',
        posterTag: 'Lake Expedition',
        atmosphere: 'Premium alpine batch',
        location: 'Lombok, Nusa Tenggara Barat',
        duration: '4 Hari 3 Malam',
        price: 'Rp 2.350.000',
        priceValue: 2350000,
        status: 'coming-soon',
        slotInfo: 'Rilis batch berikutnya',
        desc: 'Paket ekspedisi dengan camp premium, porter tim, dan konsep perjalanan kecil agar pengalaman tetap eksklusif.',
        img: rinjani,
        highlights: ['Camping gear', 'Porter tim', 'Meal trip'],
        schedules: ['Mei 2026'],
        posterTone: 'from-violet-200/20 via-rose-100/10 to-transparent',
        infoTone: 'from-fuchsia-200/10 to-purple-100/5',
        accentTone: 'text-fuchsia-100',
        actionTone: 'from-[#ffffff]/15 to-[#ffffff]/10',
    },
    {
        name: 'Gunung Merapi',
        posterTag: 'Volcano Rush',
        atmosphere: 'Fast hike special',
        location: 'Sleman, DI Yogyakarta',
        duration: '1 Hari',
        price: 'Rp 315.000',
        priceValue: 315000,
        status: 'open',
        slotInfo: '15 slot tersisa',
        desc: 'Pendakian cepat dengan fokus sunrise dan landscape kawah, cocok untuk tim kecil yang ingin trip singkat namun padat.',
        img: viewAltImg,
        highlights: ['Transport lokal', 'Guide lokal', 'Snacks'],
        schedules: ['30 Maret 2026', '13 April 2026'],
        posterTone: 'from-orange-300/20 via-red-200/10 to-transparent',
        infoTone: 'from-orange-300/10 to-amber-100/5',
        accentTone: 'text-orange-100',
        actionTone: 'from-[#ffd3b5] to-[#f0e3a5]',
    },
    {
        name: 'Gunung Semeru',
        posterTag: 'Mahameru Camp',
        atmosphere: 'Endurance trail edition',
        location: 'Lumajang, Jawa Timur',
        duration: '3 Hari 2 Malam',
        price: 'Rp 1.450.000',
        priceValue: 1450000,
        status: 'coming-soon',
        slotInfo: 'Menunggu pembukaan jalur',
        desc: 'Open trip highland endurance dengan itinerary penuh dan titik camp strategis untuk mengejar puncak dengan aman.',
        img: campingImg,
        highlights: ['Transport PP', 'Guide & porter tim', 'Perizinan'],
        schedules: ['Segera diumumkan'],
        posterTone: 'from-emerald-200/20 via-lime-100/10 to-transparent',
        infoTone: 'from-green-300/10 to-emerald-100/5',
        accentTone: 'text-emerald-100',
        actionTone: 'from-[#ffffff]/15 to-[#ffffff]/10',
    },
    {
        name: 'Gunung Kerinci',
        posterTag: 'Summit Beyond Java',
        atmosphere: 'Cross-island signature',
        location: 'Jambi, Sumatera',
        duration: '4 Hari 3 Malam',
        price: 'Rp 2.650.000',
        priceValue: 2650000,
        status: 'open',
        slotInfo: '6 slot tersisa',
        desc: 'Trip lintas pulau untuk pendaki yang ingin pengalaman summit Sumatera dengan support penuh dari tim open trip.',
        img: viewImg,
        highlights: ['Airport transfer', 'Homestay', 'Leader ekspedisi'],
        schedules: ['9-12 Mei 2026'],
        posterTone: 'from-blue-200/20 via-teal-100/10 to-transparent',
        infoTone: 'from-sky-300/10 to-cyan-100/5',
        accentTone: 'text-sky-100',
        actionTone: 'from-[#d4f0ff] to-[#daf5df]',
    },
];

export default function DashboardMobile() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlist, setWishlist] = useState([]);
    const [catalogItems, setCatalogItems] = useState([]);

    const loadCatalog = () => {
        getProducts({ activeOnly: true })
            .then((data) => {
                setCatalogItems(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error('Failed to load products:', error);
                setCatalogItems([]);
            });
    };

    useEffect(() => {
        loadCatalog();

        const handleCatalogUpdated = () => {
            loadCatalog();
        };

        const handleFocus = () => {
            loadCatalog();
        };

        window.addEventListener('parakelanaCatalogUpdated', handleCatalogUpdated);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('parakelanaCatalogUpdated', handleCatalogUpdated);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleItemClick = (item) => {
        if (item?.stock !== undefined && Number(item.stock || 0) <= 0) return;
        navigate("/booking", { state: { item } });
    };

    const handleOpenTripClick = (trip) => {
        if (trip.status !== 'open') return;
        navigate('/open-trip-booking', { state: { trip } });
    };

    const toggleWishlist = (e, itemName) => {
        e.stopPropagation();
        setWishlist(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const displayedPopularItems = catalogItems.filter((item) => item.category === 'popular');
    const displayedOtherItems = catalogItems.filter((item) => item.category !== 'popular');

    // Combine all items for search
    const allItems = [...displayedPopularItems, ...displayedOtherItems];

    // Filter items based on search query
    const filteredItems = searchQuery.trim()
        ? allItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

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

            {/* Floating Gradient Orbs for Effect - Responsive */}
            <div className="absolute top-10 md:top-20 left-5 md:left-10 w-40 h-40 md:w-72 md:h-72 bg-linear-to-r from-[#2a2a2a]/30 to-[#3a3a3a]/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 md:bottom-40 right-5 md:right-20 w-56 h-56 md:w-96 md:h-96 bg-linear-to-r from-[#1a1a1a]/20 to-[#2a2a2a]/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Content Container */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="pt-32 md:pt-36 pb-6 md:pb-8 px-4 sm:px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Title with Animation */}
                        <div className="mb-6 md:mb-8 animate-fade-in-down">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-white via-gray-100 to-[#DAEBCE] bg-clip-text text-transparent mb-2 md:mb-3">
                                Parakelana Rental
                            </h1>
                            <p className="text-gray-300 text-sm sm:text-base md:text-lg">
                                Sewa Perlengkapan Hiking Premium untuk Petualangan Anda
                            </p>
                        </div>

                        {/* Search Box with Glass Effect */}
                        <div className="relative max-w-3xl animate-fade-in-up">
                            <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/20 to-blue-500/20 rounded-2xl blur-xl" />
                            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:shadow-[#DAEBCE]/20 transition-all duration-300">
                                <FiSearch className="ml-5 text-gray-300 text-xl" />
                                <input
                                    type="text"
                                    placeholder="Cari perlengkapan hiking..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pb-8 md:pb-12">
                    {/* Search Results */}
                    {searchQuery.trim() && (
                        <div className="mb-8 md:mb-12 animate-fade-in">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    Hasil Pencarian
                                </h2>
                                <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                                    {filteredItems.length} produk
                                </span>
                            </div>
                            {filteredItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                                    {filteredItems.map((item, index) => (
                                        <div
                                            key={`${item.name}-${index}`}
                                            className={`group animate-fade-in-up ${item?.stock !== undefined && Number(item.stock || 0) <= 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="relative bg-white/15 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#DAEBCE]/20 hover:-translate-y-2">
                                                {/* Image Container */}
                                                <div className="relative aspect-square bg-linear-to-br from-white/10 to-white/20 p-4">
                                                    <img
                                                        src={item.img}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {/* Wishlist Button */}
                                                    <button
                                                        onClick={(e) => toggleWishlist(e, item.name)}
                                                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <FiHeart
                                                            className={`text-lg ${wishlist.includes(item.name) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                                                        />
                                                    </button>
                                                    {item?.stock !== undefined && Number(item.stock || 0) <= 0 && (
                                                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-red-500/85 text-white text-[10px] font-bold">
                                                            STOK HABIS
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="p-4 bg-linear-to-b from-white/5 to-white/15">
                                                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#DAEBCE] transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-base font-bold text-[#DAEBCE]">{item.price}</p>
                                                    {item?.stock !== undefined && (
                                                        <p className="text-xs text-gray-300 mt-1">Stok: {Number(item.stock || 0)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                                    <p className="text-gray-400">Tidak ada produk ditemukan untuk "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Popular Items */}
                    {!searchQuery.trim() && (
                        <>
                            <div className="mb-8 md:mb-12 animate-fade-in">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                                        Perlengkapan Populer
                                    </h2>
                                    <span className="px-3 py-1.5 md:px-4 md:py-2 bg-linear-to-r from-[#2a2a2a]/40 to-[#3a3a3a]/40 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                                        {displayedPopularItems.length} produk
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                                    {displayedPopularItems.map((item, index) => (
                                        <div
                                            key={`${item.name}-${index}`}
                                            className={`group animate-fade-in-up ${item?.stock !== undefined && Number(item.stock || 0) <= 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="relative bg-white/15 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#DAEBCE]/20 hover:-translate-y-2">
                                                {/* Image Container */}
                                                <div className="relative aspect-square bg-linear-to-br from-white/10 to-white/20 p-3 md:p-4">
                                                    {/* Popular Badge */}
                                                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
                                                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-linear-to-r from-[#2a2a2a] to-[#3a3a3a] text-white text-[10px] md:text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm">
                                                            POPULER
                                                        </span>
                                                    </div>
                                                    <img
                                                        src={item.img}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {/* Wishlist Button */}
                                                    <button
                                                        onClick={(e) => toggleWishlist(e, item.name)}
                                                        className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-9 md:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <FiHeart
                                                            className={`text-base md:text-lg ${wishlist.includes(item.name) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                                                        />
                                                    </button>
                                                    {item?.stock !== undefined && Number(item.stock || 0) <= 0 && (
                                                        <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 px-2 py-0.5 rounded-lg bg-red-500/85 text-white text-[10px] font-bold">
                                                            STOK HABIS
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="p-3 md:p-4 bg-linear-to-b from-white/5 to-white/15">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 md:mb-2 line-clamp-2 group-hover:text-[#DAEBCE] transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-base font-bold text-[#DAEBCE]">{item.price}</p>
                                                    {item?.stock !== undefined && (
                                                        <p className="text-[11px] text-gray-300 mt-1">Stok: {Number(item.stock || 0)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Other Items */}
                            <div className="mb-8 md:mb-12 animate-fade-in">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                                        Perlengkapan Lainnya
                                    </h2>
                                    <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm rounded-full border border-white/20">
                                        {displayedOtherItems.length} produk
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                                    {displayedOtherItems.map((item, index) => (
                                        <div
                                            key={`${item.name}-${index}`}
                                            className={`group animate-fade-in-up ${item?.stock !== undefined && Number(item.stock || 0) <= 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                            style={{ animationDelay: `${index * 30}ms` }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="relative bg-white/15 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#DAEBCE]/20 hover:-translate-y-2">
                                                {/* Image Container */}
                                                <div className="relative aspect-square bg-linear-to-br from-white/10 to-white/20 p-3 md:p-4">
                                                    <img
                                                        src={item.img}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {/* Wishlist Button */}
                                                    <button
                                                        onClick={(e) => toggleWishlist(e, item.name)}
                                                        className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-9 md:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <FiHeart
                                                            className={`text-base md:text-lg ${wishlist.includes(item.name) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                                                        />
                                                    </button>
                                                    {item?.stock !== undefined && Number(item.stock || 0) <= 0 && (
                                                        <span className="absolute bottom-2 left-2 md:bottom-3 md:left-3 px-2 py-0.5 rounded-lg bg-red-500/85 text-white text-[10px] font-bold">
                                                            STOK HABIS
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="p-3 md:p-4 bg-linear-to-b from-white/5 to-white/15">
                                                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 md:mb-2 line-clamp-2 group-hover:text-[#DAEBCE] transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm md:text-base font-bold text-[#DAEBCE]">{item.price}</p>
                                                    {item?.stock !== undefined && (
                                                        <p className="text-[11px] text-gray-300 mt-1">Stok: {Number(item.stock || 0)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Open Trip */}
                            <div className="mb-8 md:mb-12 animate-fade-in">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4 md:mb-6">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                                            Open Trip Pendakian
                                        </h2>
                                        <p className="text-sm md:text-base text-gray-400 mt-1">
                                            Pilih trip favorit, cek status keberangkatan, lalu booking slot langsung dari dashboard.
                                        </p>
                                    </div>
                                    <div className="self-start px-4 py-2 rounded-full border border-[#DAEBCE]/30 bg-[#DAEBCE]/10 text-[#DAEBCE] text-xs md:text-sm font-semibold">
                                        Batch mingguan Parakelana
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {openTrips.map((trip, index) => (
                                        <div
                                            key={index}
                                            className="group animate-fade-in-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="relative h-full bg-white/15 backdrop-blur-md rounded-[28px] overflow-hidden border border-white/20 hover:border-[#DAEBCE]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#DAEBCE]/20 hover:-translate-y-2">
                                                <div className={`absolute inset-0 bg-linear-to-br ${trip.infoTone} opacity-70`} />
                                                {/* Image */}
                                                <div className="relative h-52 sm:h-56 md:h-64 overflow-hidden">
                                                    <img
                                                        src={trip.img}
                                                        alt={trip.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className={`absolute inset-0 bg-linear-to-br ${trip.posterTone}`} />
                                                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                                                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3">
                                                        <span className={`px-3 py-1 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] ${trip.status === 'open' ? 'bg-emerald-400 text-[#04150c]' : 'bg-amber-300 text-[#271500]'}`}>
                                                            {trip.status === 'open' ? 'Open' : 'Coming Soon'}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-[11px] md:text-xs font-semibold bg-black/40 backdrop-blur-md text-white border border-white/15">
                                                            {trip.slotInfo}
                                                        </span>
                                                    </div>
                                                    <div className="absolute right-4 bottom-20 rotate-6 rounded-2xl border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-md shadow-xl">
                                                        <p className={`text-[10px] uppercase tracking-[0.32em] ${trip.accentTone}`}>{trip.posterTag}</p>
                                                        <p className="text-xs text-white/80 mt-1">{trip.atmosphere}</p>
                                                    </div>
                                                    <div className="absolute left-4 right-4 bottom-4">
                                                        <p className="text-[11px] md:text-xs uppercase tracking-[0.24em] text-[#DAEBCE] mb-2">
                                                            Open Trip Series
                                                        </p>
                                                        <h3 className="font-bold text-xl md:text-2xl text-white">
                                                            {trip.name}
                                                        </h3>
                                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] md:text-xs text-white/80">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 backdrop-blur-md">
                                                                <FiMapPin /> {trip.location}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 backdrop-blur-md">
                                                                <FiClock /> {trip.duration}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Info */}
                                                <div className="relative p-5 md:p-6 bg-linear-to-b from-white/5 to-black/35 h-[calc(100%-13rem)] flex flex-col">
                                                    <div className="flex items-center justify-between gap-3 mb-4">
                                                        <p className={`text-[11px] uppercase tracking-[0.28em] ${trip.accentTone}`}>
                                                            {trip.posterTag}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{trip.schedules[0]}</p>
                                                    </div>
                                                    <p className="text-sm md:text-base text-gray-300 leading-relaxed min-h-18">
                                                        {trip.desc}
                                                    </p>
                                                    <div className="mt-5 flex flex-wrap gap-2">
                                                        {trip.highlights.map((highlight) => (
                                                            <span
                                                                key={highlight}
                                                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] md:text-xs text-gray-200"
                                                            >
                                                                <FiUsers className="text-[#DAEBCE]" />
                                                                {highlight}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="mt-5 rounded-2xl border border-[#DAEBCE]/20 bg-[#DAEBCE]/10 p-4">
                                                        <p className="text-[11px] md:text-xs uppercase tracking-[0.2em] text-[#DAEBCE] mb-1">
                                                            Harga Trip
                                                        </p>
                                                        <div className="flex items-end justify-between gap-4">
                                                            <div>
                                                                <p className="text-2xl md:text-3xl font-bold text-white">{trip.price}</p>
                                                                <p className="text-xs text-gray-400 mt-1">per peserta</p>
                                                            </div>
                                                            <div className="text-right text-xs text-gray-300">
                                                                <p>Jadwal berikutnya</p>
                                                                <p className="text-white font-semibold mt-1">{trip.schedules[0]}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                                        {trip.schedules.slice(0, 2).map((schedule) => (
                                                            <div
                                                                key={schedule}
                                                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-gray-300"
                                                            >
                                                                {schedule}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenTripClick(trip)}
                                                        disabled={trip.status !== 'open'}
                                                        className={`mt-5 w-full rounded-2xl px-4 py-3.5 font-bold transition-all duration-300 flex items-center justify-center gap-2 ${trip.status === 'open' ? `bg-linear-to-r ${trip.actionTone} text-[#081109] hover:shadow-xl hover:shadow-[#DAEBCE]/20` : 'bg-white/10 text-gray-300 border border-white/10 cursor-not-allowed'}`}
                                                    >
                                                        <span>{trip.status === 'open' ? 'Booking Open Trip' : 'Coming Soon'}</span>
                                                        {trip.status === 'open' && <FiArrowRight />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
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
                    animation: fade-in 0.6s ease-out;
                }
            `}</style>
        </div>
    );
}

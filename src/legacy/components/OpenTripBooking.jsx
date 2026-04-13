"use client";

import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "../next-router";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiCalendar, FiCheck, FiMapPin, FiMessageSquare, FiUsers } from "react-icons/fi";
import bgPattern from "../assets/BG_PARAKELANA.png";

const defaultTrip = {
    name: "Gunung Prau",
    location: "Dieng, Jawa Tengah",
    duration: "2 Hari 1 Malam",
    price: "Rp 425.000",
    priceValue: 425000,
    status: "open",
    slotInfo: "12 slot tersisa",
    desc: "Open trip santai dengan itinerary sunrise dan ritme pendakian aman untuk pendaki pemula.",
    img: null,
    highlights: ["Transport PP", "Leader trip", "Dokumentasi"],
    schedules: ["21-22 Maret 2026", "18-19 April 2026"],
};

export default function OpenTripBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isGuest, profile } = useAuth();
    const trip = location.state?.trip || defaultTrip;

    const [selectedSchedule, setSelectedSchedule] = useState(trip.schedules?.[0] || "");
    const [participantCount, setParticipantCount] = useState(1);
    const [notes, setNotes] = useState("");
    const [sending, setSending] = useState(false);

    const totalPrice = useMemo(() => {
        return Number(trip.priceValue || 0) * Number(participantCount || 1);
    }, [participantCount, trip.priceValue]);

    const handleSubmit = async () => {
        if (trip.status !== "open") {
            return;
        }

        if (isGuest) {
            navigate("/login");
            return;
        }

        setSending(true);

        try {
            const customerName = profile?.full_name || profile?.username || "Pelanggan";
            const customerPhone = profile?.phone || "-";
            const message = [
                "*PARAKELANA OPEN TRIP - BOOKING BARU*",
                "",
                `Nama Trip: ${trip.name}`,
                `Lokasi: ${trip.location}`,
                `Jadwal Dipilih: ${selectedSchedule}`,
                `Durasi: ${trip.duration}`,
                `Peserta: ${participantCount} orang`,
                `Total Estimasi: Rp ${Number(totalPrice || 0).toLocaleString("id-ID")}`,
                "",
                `Nama Pemesan: ${customerName}`,
                `Nomor HP: ${customerPhone}`,
                notes.trim() ? `Catatan: ${notes.trim()}` : "Catatan: -",
                "",
                "Mohon bantu proses pendaftaran open trip ini."
            ].join("\n");

            const waNumber = "62816228844";
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");
            navigate("/dashboard");
        } finally {
            setSending(false);
        }
    };

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

            <div className="absolute -top-10 left-10 w-72 h-72 bg-[#DAEBCE]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300/5 rounded-full blur-3xl" />

            <div className="relative z-10 px-4 sm:px-6 md:px-10 pb-16">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="fixed left-4 sm:left-6 md:left-8 top-6 md:top-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-gray-200 hover:text-white hover:border-[#DAEBCE]/50 hover:bg-white/15 transition-all duration-300 z-20"
                >
                    <FiArrowLeft className="text-base" />
                    <span className="text-sm font-semibold">Kembali</span>
                </button>

                <div className="max-w-6xl mx-auto pt-24 md:pt-28">
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8">
                        <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl">
                            <div className="relative h-72 md:h-105 overflow-hidden">
                                {trip.img ? (
                                    <img src={trip.img} alt={trip.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-[#DAEBCE]/10 to-white/5" />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                                <div className="absolute top-5 left-5 flex flex-wrap gap-3">
                                    <span className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] text-[#081109]">
                                        Open
                                    </span>
                                    <span className="rounded-full bg-black/40 border border-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                                        {trip.slotInfo}
                                    </span>
                                </div>
                                <div className="absolute left-5 right-5 bottom-5">
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#DAEBCE] mb-2">Parakelana Open Trip</p>
                                    <h1 className="text-3xl md:text-5xl font-bold text-white">{trip.name}</h1>
                                    <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm text-white/90">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 backdrop-blur-md">
                                            <FiMapPin className="text-[#DAEBCE]" />
                                            {trip.location}
                                        </span>
                                        <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 backdrop-blur-md">
                                            <FiCalendar className="text-[#DAEBCE]" />
                                            {trip.duration}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                    {trip.desc}
                                </p>

                                <div className="grid sm:grid-cols-3 gap-3 mt-6">
                                    {trip.highlights.map((highlight) => (
                                        <div
                                            key={highlight}
                                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-200 flex items-center gap-3"
                                        >
                                            <FiCheck className="text-[#DAEBCE]" />
                                            <span>{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-4xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8 h-fit lg:sticky lg:top-24">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-[#DAEBCE] mb-2">Booking Slot</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white">Daftar Open Trip</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Harga per peserta</p>
                                    <p className="text-2xl font-bold text-[#DAEBCE]">{trip.price}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-200 mb-3">Pilih Jadwal Keberangkatan</label>
                                    <div className="grid gap-3">
                                        {trip.schedules.map((schedule) => (
                                            <button
                                                key={schedule}
                                                onClick={() => setSelectedSchedule(schedule)}
                                                className={`rounded-2xl border px-4 py-3 text-left transition-all ${selectedSchedule === schedule ? 'border-[#DAEBCE] bg-[#DAEBCE]/10 text-white' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'}`}
                                            >
                                                {schedule}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-200 mb-3">Jumlah Peserta</label>
                                    <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                                        <button
                                            onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                                            className="w-10 h-10 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center text-xl font-bold text-white">{participantCount}</span>
                                        <button
                                            onClick={() => setParticipantCount(participantCount + 1)}
                                            className="w-10 h-10 rounded-xl bg-[#DAEBCE] text-[#081109] font-bold hover:brightness-110 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-200 mb-3">Catatan Tambahan</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={5}
                                        placeholder="Contoh: butuh meeting point tertentu, punya riwayat asma ringan, atau ingin tanya perlengkapan pribadi."
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#DAEBCE]/50 transition-all resize-none"
                                    />
                                </div>

                                <div className="rounded-3xl border border-[#DAEBCE]/20 bg-[#DAEBCE]/10 p-5 space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-300">
                                        <span>Trip dipilih</span>
                                        <span className="font-semibold text-white">{trip.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-300">
                                        <span>Jadwal</span>
                                        <span className="font-semibold text-white">{selectedSchedule}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-300">
                                        <span>Peserta</span>
                                        <span className="font-semibold text-white">{participantCount} orang</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-white font-bold">Estimasi Total</span>
                                        <span className="text-2xl font-bold text-white">
                                            Rp {Number(totalPrice || 0).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={sending}
                                    className="w-full rounded-2xl bg-linear-to-r from-[#DAEBCE] to-[#b8d5a8] text-[#081109] font-bold py-4 px-4 hover:shadow-xl hover:shadow-[#DAEBCE]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FiMessageSquare className="text-lg" />
                                    <span>{sending ? "Memproses..." : "Booking Open Trip"}</span>
                                </button>

                                <p className="text-xs text-center text-gray-400">
                                    Booking akan membuka WhatsApp admin dengan format pendaftaran otomatis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
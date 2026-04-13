"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiInstagram, FiTwitter, FiYoutube, FiFacebook, FiClock, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import bgParakelana from "../assets/BG_PARAKELANA.png";

export default function Contact() {
    const [formData, setFormData] = useState({ nama: '', email: '', subject: '', pesan: '' });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nama.trim()) newErrors.nama = "Nama tidak boleh kosong";
        if (!formData.email.trim()) newErrors.email = "Email tidak boleh kosong";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email tidak valid";
        if (!formData.subject.trim()) newErrors.subject = "Subjek tidak boleh kosong";
        if (!formData.pesan.trim()) newErrors.pesan = "Pesan tidak boleh kosong";
        else if (formData.pesan.length < 10) newErrors.pesan = "Pesan minimal 10 karakter";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Form submitted:', formData);
            setSubmitted(true);
            setFormData({ nama: '', email: '', subject: '', pesan: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: FiMapPin,
            title: "Lokasi",
            info: "Jl. Mulawarman Sel. Dalam II No.113C, Kramas, Tembalang, Semarang 50278",
        },
        {
            icon: FiPhone,
            title: "Telepon",
            info: "+62-8162-2884-4",
        },
        {
            icon: FiMail,
            title: "Email",
            info: "parakelana_adventure@gmail.com",
        },
        {
            icon: FiClock,
            title: "Jam Operasional",
            info: "Senin-Jumat: 09:00-18:00 WIB",
        }
    ];

    const socialLinks = [
        { icon: FiInstagram, label: "Instagram", url: "#" },
        { icon: FiTwitter, label: "Twitter", url: "#" },
        { icon: FiYoutube, label: "YouTube", url: "#" },
        { icon: FiFacebook, label: "Facebook", url: "#" }
    ];

    const faqs = [
        {
            q: "Berapa lama waktu respon untuk pertanyaan saya?",
            a: "Kami biasanya merespon dalam 1-2 jam pada jam kerja. Untuk pertanyaan weekend, akan dijawab pada hari kerja berikutnya."
        },
        {
            q: "Apakah ada layanan konsultasi gratis?",
            a: "Ya, kami menawarkan konsultasi gratis untuk membantu Anda merencanakan petualangan. Hubungi kami sekarang."
        },
        {
            q: "Bagaimana cara booking rental?",
            a: "Anda bisa booking melalui aplikasi kami, WhatsApp, atau menghubungi langsung. Proses booking sangat mudah dan cepat."
        },
        {
            q: "Apakah ada diskon untuk group booking?",
            a: "Tentu ada! Kami menawarkan diskon khusus untuk group atau booking dalam jumlah besar. Hubungi tim kami untuk penawaran terbaik."
        }
    ];

    return (
        <div 
            className="min-h-screen w-full relative overflow-x-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
            }}
        >
            {/* Animated Background */}
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
                <div className="pt-32 pb-12 px-4 sm:px-6 md:px-8">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in-down">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                            Hubungi Kami
                        </h1>
                        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                            Ada pertanyaan atau ingin memulai petualangan? Tim kami siap membantu.
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {contactInfo.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 75}ms` }}>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                        <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-5">
                                            <div className="flex items-start gap-3 md:gap-4">
                                                <div className="w-11 h-11 rounded-lg bg-linear-to-br from-[#DAEBCE]/20 to-[#DAEBCE]/5 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                                    <Icon className="text-[#DAEBCE] text-lg" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-white font-semibold text-xs md:text-sm mb-0.5 truncate">{item.title}</h3>
                                                    <p className="text-gray-400 text-xs md:text-sm wrap-break-word line-clamp-2">{item.info}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Section */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 via-transparent to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-[#DAEBCE]/20 transition-all duration-300 p-6 md:p-8">
                                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Kirimkan Pesan</h2>

                                    {submitted && (
                                        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 animate-fade-in-down">
                                            <FiCheckCircle className="text-green-400 text-xl shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-green-400 font-semibold text-sm">Pesan Terkirim!</p>
                                                <p className="text-green-400/70 text-xs">Terima kasih. Kami akan merespon segera.</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-gray-300 text-xs md:text-sm font-medium mb-2 block">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                placeholder="Nama Anda"
                                                className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg md:rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                                    errors.nama
                                                        ? 'border-red-500/50 focus:border-red-400'
                                                        : 'border-white/10 focus:border-[#DAEBCE]/50 focus:bg-white/10'
                                                }`}
                                            />
                                            {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-gray-300 text-xs md:text-sm font-medium mb-2 block">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="your@email.com"
                                                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg md:rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                                        errors.email
                                                            ? 'border-red-500/50 focus:border-red-400'
                                                            : 'border-white/10 focus:border-[#DAEBCE]/50 focus:bg-white/10'
                                                    }`}
                                                />
                                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="text-gray-300 text-xs md:text-sm font-medium mb-2 block">Subjek</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="Topik pertanyaan"
                                                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg md:rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                                        errors.subject
                                                            ? 'border-red-500/50 focus:border-red-400'
                                                            : 'border-white/10 focus:border-[#DAEBCE]/50 focus:bg-white/10'
                                                    }`}
                                                />
                                                {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-gray-300 text-xs md:text-sm font-medium mb-2 block">Pesan</label>
                                            <textarea
                                                name="pesan"
                                                value={formData.pesan}
                                                onChange={handleChange}
                                                placeholder="Tuliskan pesan Anda..."
                                                rows="4"
                                                className={`w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/5 border rounded-lg md:rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none ${
                                                    errors.pesan
                                                        ? 'border-red-500/50 focus:border-red-400'
                                                        : 'border-white/10 focus:border-[#DAEBCE]/50 focus:bg-white/10'
                                                }`}
                                            />
                                            {errors.pesan && <p className="text-red-400 text-xs mt-1">{errors.pesan}</p>}
                                            <p className="text-gray-500 text-xs mt-1.5">Karakter: {formData.pesan.length}/500</p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-[#DAEBCE] to-[#b8a5b5] text-[#0a0a0a] font-semibold rounded-lg md:rounded-xl text-sm md:text-base hover:shadow-lg hover:shadow-[#DAEBCE]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin"></div>
                                                    <span className="hidden sm:inline">Mengirim...</span>
                                                    <span className="sm:hidden">Tunggu...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiSend className="text-base" />
                                                    <span>Kirim Pesan</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-5 md:space-y-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            {/* Map */}
                            <div className="relative group hidden md:block">
                                <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300">
                                    <iframe
                                        title="Sewa Alat Outdoor PARAKELANA"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.284!2d110.4037!3d-6.9726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708c5f8f8f8f8d%3A0x146dd8c2b2ca310!2sSewa%20Alat%20Outdoor%20PARAKELANA!5e0!3m2!1sen!2sus!4v1708400000000"
                                        className="w-full h-56 md:h-64 border-none"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                    <a
                                        href="https://maps.app.goo.gl/WECP6x3bPw5BHohE6"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white text-center font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                                    >
                                        Buka di Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-5 md:p-6">
                                    <h3 className="text-white font-semibold text-sm md:text-base mb-4">Ikuti Kami</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {socialLinks.map((social, index) => {
                                            const Icon = social.icon;
                                            return (
                                                <a
                                                    key={index}
                                                    href={social.url}
                                                    className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 group"
                                                >
                                                    <Icon className="text-[#DAEBCE] text-lg" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 p-5 md:p-6 text-center">
                                    <p className="text-gray-400 text-xs md:text-sm mb-4 leading-relaxed">Hubungi kami via WhatsApp untuk respon lebih cepat</p>
                                    <a 
                                        href="https://wa.me/62816228844" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-linear-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg md:rounded-lg text-xs md:text-sm hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <FiPhone className="text-base" />
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pb-16 md:pb-20 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-10 text-center">Pertanyaan Umum</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-[#DAEBCE]/10 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#DAEBCE]/30 transition-all duration-300 rounded-lg md:rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-white/5 transition-colors gap-3"
                                    >
                                        <span className="text-left text-white font-semibold text-xs md:text-sm line-clamp-2">{faq.q}</span>
                                        <FiChevronDown
                                            className={`text-[#DAEBCE] transition-transform duration-300 shrink-0 ${
                                                expandedFAQ === index ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {expandedFAQ === index && (
                                        <div className="px-4 md:px-6 pb-4 pt-3 text-gray-400 text-xs md:text-sm border-t border-white/10 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
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

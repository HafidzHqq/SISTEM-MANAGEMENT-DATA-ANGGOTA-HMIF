import React, { useEffect, useState } from "react";
import UserMenu from "../components/UserMenu";
import hmifLogo from "../assets/logo-hmif.png";
import googleLogo from "../assets/logo-google.png";

const ERROR_LABEL = {
    google_session_expired:
        "Sesi login Google gagal atau kedaluwarsa. Silakan coba login kembali.",
    domain_tidak_valid:
        "Akun tidak valid. Gunakan email dengan domain @student.itera.ac.id.",
    format_email_tidak_valid:
        "Format email mahasiswa tidak valid. Pastikan email berformat nama.nim@student.itera.ac.id.",
    bukan_sarjana:
        "Akun ini tidak terdaftar sebagai mahasiswa sarjana.",
    angkatan_tidak_valid:
        "Angkatan akun ini belum diizinkan untuk login.",
    bukan_informatika:
        "Login hanya tersedia untuk mahasiswa Informatika.",
    akun_nonaktif:
        "Akun Anda sedang nonaktif. Hubungi admin HMIF.",
};

export default function Login() {
    const handleGoogleLogin = () => {
        window.location.href = "/auth/google";
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState("User");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        setIsLoggedIn(!!token);
        setName(localStorage.getItem("name") || "User");
    }, []);

    const query = new URLSearchParams(window.location.search);
    const errorKey = query.get("error");
    const errorMessage = errorKey
        ? ERROR_LABEL[errorKey] ?? "Login gagal. Silakan coba beberapa saat lagi."
        : "";

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden bg-[#0a220c]">
            {/* Background Image with Dark Green Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="/images/bg_itera.jpg"
                    alt="Background ITERA"
                    className="h-full w-full object-cover opacity-35 mix-blend-luminosity scale-105"
                />
                <div className="absolute inset-0 bg-[#0a220c]/82" />
                {/* Dot Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.14]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)",
                        backgroundSize: "24px 24px"
                    }}
                />
            </div>

            {isLoggedIn && (
                <header className="absolute right-6 top-6 z-20">
                    <UserMenu />
                </header>
            )}

            {/* ── CARD WRAPPER ── */}
            <div className="relative z-10 w-full max-w-4xl rounded-[24px] border border-white/10 bg-[#0c2b10]/45 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "520px" }}>

                {/* Left Panel */}
                <div
                    className="hidden md:flex relative flex-col justify-between p-10 md:w-[42%] overflow-hidden border-r border-white/5"
                    style={{
                        background: "linear-gradient(145deg, #1c5e22 0%, #0a220c 100%)",
                    }}
                >
                    {/* Subtle light blobs */}
                    <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px]" />
                    <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[90px]" />

                    {/* Top section */}
                    <div className="relative z-10">
                        <p className="text-[0.68rem] font-bold tracking-[0.3em] uppercase text-emerald-400/80 mb-7">
                            HMIF ITERA
                        </p>
                        <h1 className="text-[2.2rem] font-serif font-bold leading-[1.15] text-white mb-6 tracking-normal">
                            Sistem<br />
                            <span className="text-[#F4C44C]">Management</span><br />
                            <span className="text-[#F4C44C]">Data</span><br />
                            Anggota
                        </h1>
                        <p className="text-[0.82rem] leading-relaxed text-slate-300 max-w-[240px]">
                            Platform autentikasi terpadu mahasiswa Informatika ITERA untuk kemudahan administrasi organisasi yang modern.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 mt-8 space-y-3.5">
                        <div className="rounded-2xl p-4 border border-white/5 bg-white/[0.04] backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/10">
                            <p className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-[#F4C44C] mb-1">
                                AKSES CEPAT
                            </p>
                            <p className="text-[0.78rem] text-slate-300 leading-relaxed">
                                Login praktis menggunakan Single Sign-On Google kampus.
                            </p>
                        </div>
                        <div className="rounded-2xl p-4 border border-white/5 bg-white/[0.04] backdrop-blur-md transition-all hover:bg-white/[0.07] hover:border-white/10">
                            <p className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-[#F4C44C] mb-1">
                                AMAN & RESMI
                            </p>
                            <p className="text-[0.78rem] text-slate-300 leading-relaxed">
                                Autentikasi ketat terbatas untuk mahasiswa Informatika aktif.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex flex-col bg-white md:w-[58%] flex-1">

                    {/* ── Main Content ── */}
                    <div className="flex flex-col items-center flex-1 px-8 sm:px-16 pt-10 md:pt-14 pb-8 justify-center">

                        {/* Logo Wrapper */}
                        <div className="relative flex items-center justify-center p-3 rounded-full bg-slate-50 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] mb-5">
                            <img
                                src={hmifLogo}
                                alt="Logo HMIF"
                                className="h-24 w-24 md:h-28 md:w-28 object-contain rounded-full"
                            />
                        </div>

                        {/* Heading */}
                        <h2 className="text-[1.8rem] font-serif font-bold tracking-tight text-slate-900">
                            Selamat Datang
                        </h2>

                        {/* Subtitle */}
                        <p className="mt-2.5 text-center text-[0.88rem] text-slate-500 leading-relaxed max-w-[280px]">
                            Gunakan akun Google Student resmi Anda dengan domain{" "}
                            <span className="font-bold text-[#b4902d] bg-[#F4C44C]/10 border border-[#F4C44C]/15 px-1.5 py-0.5 rounded block mt-1.5">
                                @student.itera.ac.id
                            </span>
                        </p>

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="mt-5 w-full max-w-sm rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600 shadow-sm animate-shake">
                                {errorMessage}
                            </p>
                        )}

                        {/* Google Login Button */}
                        {isLoggedIn ? (
                            <div className="mt-8 w-full max-w-sm rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm text-emerald-900 shadow-inner">
                                <span className="font-bold">Halo, {name}!</span> Anda sudah dalam sesi masuk.
                                <div className="mt-2 text-slate-600 text-[0.82rem] leading-relaxed">
                                    Silakan gunakan menu navigasi atau klik profil Anda di kanan atas untuk masuk ke Dashboard.
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-[0.9rem] text-[0.95rem] font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-[#F4C44C]/45 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#F4C44C]/20"
                            >
                                <img
                                    src={googleLogo}
                                    alt="Google"
                                    className="h-5.5 w-5.5 object-contain"
                                />
                                <span>Masuk dengan Google</span>
                            </button>
                        )}

                        {/* Support link */}
                        <a
                            href="mailto:hmif@itera.ac.id"
                            className="mt-6 text-[0.82rem] text-slate-400 transition hover:text-slate-600"
                        >
                            Butuh bantuan login?{" "}
                            <span className="underline underline-offset-2 font-semibold">
                                Hubungi Support Himpunan
                            </span>
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 text-center">
                        <hr className="border-slate-100 mb-5" />
                        <div className="flex items-center justify-center gap-3 text-[0.68rem] font-bold tracking-[0.12em] uppercase text-slate-400">
                            <a href="#" className="transition hover:text-slate-600">
                                Bantuan
                            </a>
                            <span className="text-slate-300">•</span>
                            <a href="#" className="transition hover:text-slate-600">
                                Kebijakan Privasi
                            </a>
                        </div>
                        <p className="mt-3 text-[0.68rem] text-slate-400 font-medium">
                            © 2026 HMIF ITERA
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

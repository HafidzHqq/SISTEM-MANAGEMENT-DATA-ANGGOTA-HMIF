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
        <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden bg-[#060c07]">
            {/* Background Image with Blur and Green Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="/images/bg_itera.jpg"
                    alt="Background ITERA"
                    className="h-full w-full object-cover blur-[2px] opacity-[0.45] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#0e2d11]/85 via-[#081e0a]/92 to-[#040e05]/95" />
            </div>

            {isLoggedIn && (
                <header className="absolute right-6 top-6 z-20">
                    <UserMenu />
                </header>
            )}

            {/* ── CARD WRAPPER ── */}
            <div className="relative z-10 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "520px" }}>

                <div
                    className="hidden md:flex relative flex-col justify-between p-10 md:w-[42%]"
                    style={{
                        background: "linear-gradient(160deg, #3db53d 0%, #2ea02e 35%, #228b22 100%)",
                    }}
                >
                    {/* Subtle light blobs */}
                    <div className="pointer-events-none absolute -top-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

                    {/* Top section */}
                    <div className="relative z-10">
                        <p className="text-[0.68rem] font-semibold tracking-[0.3em] uppercase text-white/60 mb-7">
                            HMIF ITERA
                        </p>
                        <h1 className="text-[2.5rem] font-extrabold leading-[1.1] text-white mb-6">
                            Sistem<br />
                            Management<br />
                            Data<br />
                            Anggota
                        </h1>
                        <p className="text-[0.82rem] leading-relaxed text-white/75 max-w-[240px]">
                            Platform untuk autentikasi cepat dan aman
                            menggunakan akun resmi kampus agar proses
                            administrasi HMIF menjadi lebih efisien.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="relative z-10 mt-8 space-y-3">
                        <div
                            className="rounded-2xl p-4"
                            style={{ background: "rgba(255,255,255,0.13)" }}
                        >
                            <p className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-white mb-1">
                                AKSES CEPAT
                            </p>
                            <p className="text-[0.78rem] text-white/72 leading-relaxed">
                                Login satu klik dengan akun Google kampus.
                            </p>
                        </div>
                        <div
                            className="rounded-2xl p-4"
                            style={{ background: "rgba(255,255,255,0.13)" }}
                        >
                            <p className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-white mb-1">
                                TERVERIFIKASI
                            </p>
                            <p className="text-[0.78rem] text-white/72 leading-relaxed">
                                Membatasi login untuk domain resmi mahasiswa.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="flex flex-col bg-white md:w-[58%] flex-1">

                    {/* ── Main Content (centered) ── */}
                    <div className="flex flex-col items-center flex-1 px-8 sm:px-14 pt-10 md:pt-16 pb-8">

                        {/* Logo */}
                        <img
                            src={hmifLogo}
                            alt="Logo HMIF"
                            className="h-28 w-28 md:h-40 md:w-40 object-contain rounded-full"
                        />

                        {/* Heading */}
                        <h2 className="mt-1 text-[1.9rem] font-extrabold tracking-tight text-gray-900">
                            WELCOME
                        </h2>

                        {/* Subtitle */}
                        <p className="mt-2 text-center text-[0.9rem] text-gray-500 leading-relaxed">
                            Log in with your credentials or{" "}
                            <span className="font-bold text-green-600">
                                @student.itera.ac.id
                            </span>{" "}
                            accounts.
                        </p>

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="mt-5 w-full max-w-sm rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                                {errorMessage}
                            </p>
                        )}

                        {/* Google Login Button */}
                        {isLoggedIn ? (
                            <div className="mt-8 w-full max-w-sm rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-sm text-emerald-900 shadow-sm">
                                Anda sudah login sebagai <span className="font-semibold">{name}</span>.
                                <div className="mt-2 text-slate-600">
                                    Gunakan menu di kanan atas untuk membuka Dashboard atau Logout.
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleGoogleLogin}
                                className="mt-8 flex w-full max-w-sm items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-[0.85rem] text-[0.95rem] font-semibold text-gray-700 shadow-sm transition duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                            >
                                <img
                                    src={googleLogo}
                                    alt="Google"
                                    className="h-5 w-5 object-contain"
                                />
                                <span>Login with Google</span>
                            </button>
                        )}

                        {/* Support link */}
                        <a
                            href="#support"
                            className="mt-5 text-[0.88rem] text-gray-400 transition hover:text-gray-600"
                        >
                            Unable to sign in?{" "}
                            <span className="underline underline-offset-2">
                                Contact support
                            </span>
                        </a>
                    </div>

                    {/* Ã¢â€â‚¬Ã¢â€â‚¬ Footer Ã¢â€â‚¬Ã¢â€â‚¬ */}
                    <div className="px-8 pb-8 text-center">
                        <hr className="border-gray-100 mb-5" />
                        <div className="flex items-center justify-center gap-3 text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-gray-400">
                            <a href="#" className="transition hover:text-gray-600">
                                Help &amp; Support
                            </a>
                            <span className="text-gray-300">Ã¢â‚¬Â¢</span>
                            <a href="#" className="transition hover:text-gray-600">
                                Privacy Policy
                            </a>
                        </div>
                        <p className="mt-3 text-[0.72rem] text-gray-400">
                            Ã‚(c) 2026 HMIF
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

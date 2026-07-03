import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import logoHmif from "../assets/logo-hmif.png";

const steps = [
    {
        number: "1",
        title: "Akses Website",
        description: "Pastikan berada di website Sistem Management Data Anggota.",
    },
    {
        number: "2",
        title: "Temukan Login",
        description: "Klik tombol Login yang berada pada pojok kanan atas halaman website.",
    },
    {
        number: "3",
        title: "Google SSO",
        description: "Login menggunakan akun Google ITERA resmi Anda.",
    },
    {
        number: "4",
        title: "Masuk Dashboard",
        description: "Klik menu atau tombol Dashboard pada dropdown akun di kanan atas.",
    },
    {
        number: "5",
        title: "Siap Digunakan",
        description: "Anda akan diarahkan ke Dashboard Anggota HMIF untuk menggunakan fitur.",
    },
];

const faqs = [
    {
        question: "Siapa yang dapat login?",
        answer: "Seluruh anggota HMIF yang memiliki akun Google ITERA aktif dapat login ke sistem menggunakan metode Google SSO.",
    },
    {
        question: "Mengapa saya tidak bisa login?",
        answer: "Pastikan akun Google yang dipakai adalah akun resmi ITERA, koneksi stabil, dan Anda sudah membuka halaman login terbaru.",
    },
    {
        question: "Siapa yang harus dihubungi jika mengalami kendala?",
        answer: "Silakan hubungi admin atau pengurus HMIF yang bertanggung jawab pada sistem agar kendala dapat ditindaklanjuti.",
    },
];

function IconInfo() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
    );
}

function IconArrowDown() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M12 5v14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            <path d="M6.5 13.5L12 19l5.5-5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconChevron() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function IconLightbulb() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
            <path
                d="M12 3a7 7 0 0 0-4 12.8V18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.2A7 7 0 0 0 12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path d="M10 21h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M10 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SocialChip({ label, href }) {
    return (
        <a 
            href={href || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/20 transition"
        >
            {label}
        </a>
    );
}

function MobileHamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const name = localStorage.getItem("name") || "User";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    return (
        <div className="relative md:hidden">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none transition active:scale-95 border border-slate-200"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/30 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-700">Akun Aktif</p>
                        <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{name}</p>
                    </div>
                    <div className="p-2 space-y-1">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                            onClick={() => setIsOpen(false)}
                        >
                            <span>Dashboard</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-red-50 hover:bg-red-100 px-4 py-2.5 text-sm font-bold text-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const [activeFaq, setActiveFaq] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("auth_token"));

        const handleScroll = () => {
            const scrollPos = window.scrollY + 200;
            const stepsEl = document.getElementById("steps");
            const faqEl = document.getElementById("faq");
            const dashboardEl = document.getElementById("dashboard");

            if (dashboardEl && scrollPos >= dashboardEl.offsetTop) {
                setActiveSection("contact");
            } else if (faqEl && scrollPos >= faqEl.offsetTop) {
                setActiveSection("faq");
            } else if (stepsEl && scrollPos >= stepsEl.offsetTop) {
                setActiveSection("guide");
            } else {
                setActiveSection("home");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-[#f7f9ff] text-slate-900 pb-0">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoHmif} alt="HMIF" className="h-11 w-11 rounded-full object-cover" />
                        <span className="text-xl font-black tracking-wider text-emerald-800 font-sans">
                            HMIF
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-9 text-[15px] font-semibold text-slate-600 md:flex">
                        <a className="transition hover:text-emerald-700" href="#guide">
                            Guide
                        </a>
                        <a className="transition hover:text-emerald-700" href="#faq">
                            FAQ
                        </a>
                        <Link className="transition hover:text-emerald-700" to="/dashboard">
                            Dashboard
                        </Link>
                    </nav>

                    {isLoggedIn ? (
                        <>
                            <div className="hidden md:block">
                                <UserMenu />
                            </div>
                            <MobileHamburgerMenu />
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-full bg-[#F4C44C] px-6 py-2.5 text-[15px] font-extrabold text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e0b23b] hover:shadow-md"
                        >
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </header>

            <main>
                <section
                    id="guide"
                    className="relative overflow-hidden px-4 min-h-[calc(100vh-73px)] flex items-center justify-center sm:px-6 lg:px-8 bg-[#0a220c]"
                >
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

                    <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center py-16 sm:py-24">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#0a220c] border border-white/5 px-4.5 py-1.5 text-xs font-bold tracking-[0.24em] text-white uppercase">
                            <span className="h-2 w-2 rounded-full bg-[#F4C44C] animate-pulse" />
                            <span>Sistem Management Data</span>
                        </div>
 
                        <h1 className="mt-8 max-w-4xl text-3xl font-serif font-bold leading-[1.2] tracking-normal text-white sm:text-5xl lg:text-[3.5rem]">
                            Sistem <span className="text-[#F4C44C]">Management Data Anggota</span>
                            <span className="block mt-2">HMIF</span>
                        </h1>
 
                        <p className="mt-6 max-w-2xl text-[1.05rem] sm:text-lg leading-relaxed text-emerald-100/75">
                            Ikuti langkah-langkah mudah di bawah ini untuk mengakses dashboard anggota HMIF dengan akun Google ITERA secara aman, cepat, dan efisien.
                        </p>
 
                        <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row justify-center w-full max-w-md sm:max-w-none">
                            <a
                                href="#steps"
                                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#F4C44C] px-8 py-4 text-base font-extrabold text-slate-900 shadow-[0_16px_28px_rgba(244,196,76,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e0b23b] hover:shadow-[0_20px_35px_rgba(244,196,76,0.28)] active:translate-y-0"
                            >
                                <span>Mulai Panduan</span>
                                <IconArrowDown />
                            </a>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 text-base font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 active:translate-y-0"
                            >
                                Portal Utama
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="steps" className="scroll-mt-24 bg-[#eef3ff] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Langkah-Langkah Login
                            </h2>
                            <div className="mx-auto mt-5 h-1.5 w-20 rounded-full bg-[#22c55e]" />
                        </div>

                        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
                            {steps.map((step) => (
                                <article
                                    key={step.number}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                                >
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbe7ff] text-2xl font-bold text-slate-700">
                                        {step.number}
                                    </div>
                                    <h3 className="mt-8 text-xl font-medium text-slate-800">{step.title}</h3>
                                    <p className="mt-3 text-[15px] leading-7 text-slate-500">
                                        {step.description}
                                    </p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-12 rounded-[1.5rem] border border-emerald-200 bg-[#dcf2ef] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#22c55e] text-white">
                                    <IconLightbulb />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#22c55e]">Tips Penting</h3>
                                    <p className="mt-1 max-w-5xl text-[15px] leading-7 text-slate-600 sm:text-lg">
                                        Selalu gunakan jaringan internet yang stabil dan pastikan browser Anda dalam versi terbaru untuk pengalaman terbaik saat mengakses Dashboard Anggota.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="scroll-mt-24 bg-[#f8f9ff] px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.55fr] lg:items-start">
                        <div>
                            <h2 className="max-w-lg text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                FAQ - Pertanyaan Sering Diajukan
                            </h2>
                            <p className="mt-6 max-w-md text-lg leading-8 text-slate-500">
                                Temukan jawaban cepat untuk kendala yang mungkin Anda hadapi saat proses login.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => {
                                const open = activeFaq === index;

                                return (
                                    <div
                                        key={faq.question}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
                                    >
                                        <button
                                            type="button"
                                            className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                                            onClick={() => setActiveFaq(open ? null : index)}
                                            aria-expanded={open}
                                        >
                                            <span className="text-[17px] font-semibold text-slate-800">
                                                {faq.question}
                                            </span>
                                            <span
                                                className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""
                                                    }`}
                                            >
                                                <IconChevron />
                                            </span>
                                        </button>

                                        {open && (
                                            <div className="px-6 pb-6 text-[15px] leading-7 text-slate-500">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="dashboard" className="bg-[#243449] px-4 py-16 text-white sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.8fr_0.9fr]">
                        <div>
                            <div className="flex items-center gap-4">
                                <img src={logoHmif} alt="HMIF ITERA" className="h-16 w-16 rounded-full object-cover" />
                                <div>
                                    <h3 className="text-3xl font-extrabold tracking-tight text-[#22c55e]">
                                        HMIF ITERA
                                    </h3>
                                    <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-300">
                                        Himpunan Mahasiswa Informatika Institut Teknologi Sumatera. Menjadi wadah kolaborasi dan inovasi mahasiswa informatika.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3">
                                <SocialChip label="IG" href="https://www.instagram.com/hmif.itera?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" />
                                <SocialChip label="IN" href="https://www.linkedin.com/company/hmif-itera" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-3xl font-bold tracking-tight text-white">Quick Links</h4>
                            <ul className="mt-6 space-y-4 text-[15px] text-slate-300">
                                <li>
                                    <a className="transition hover:text-white" href="#guide">
                                        Guide
                                    </a>
                                </li>
                                <li>
                                    <a className="transition hover:text-white" href="#faq">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <Link className="transition hover:text-white" to="/dashboard">
                                        Dashboard
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-3xl font-bold tracking-tight text-white">Hubungi Kami</h4>
                            <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-300"></p>
                            <div className="mt-8 h-px bg-white/10" />
                            <p className="mt-4 text-sm leading-6 text-slate-400">
                                (c) 2026 HMIF (Himpunan Mahasiswa Informatika). All rights reserved.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

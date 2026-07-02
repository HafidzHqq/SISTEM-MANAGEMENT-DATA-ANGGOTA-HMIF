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

function SocialChip({ label }) {
    return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white ring-1 ring-white/15">
            {label}
        </span>
    );
}

export default function Home() {
    const [activeFaq, setActiveFaq] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("auth_token"));
    }, []);

    return (
        <div className="min-h-screen bg-[#f7f9ff] text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logoHmif} alt="HMIF" className="h-11 w-11 rounded-full object-cover" />
                        <div className="leading-tight">
                            <div className="text-lg font-extrabold tracking-tight text-emerald-700">
                                HMIF Management
                            </div>
                            <div className="text-xs font-semibold tracking-[0.34em] text-slate-500">
                                SISTEM HMIF
                            </div>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-9 text-[15px] font-medium text-slate-600 md:flex">
                        <a className="transition hover:text-emerald-600" href="#guide">
                            Guide
                        </a>
                        <a className="transition hover:text-emerald-600" href="#faq">
                            FAQ
                        </a>
                        <Link className="transition hover:text-emerald-600" to="/dashboard">
                            Dashboard
                        </Link>
                    </nav>

                    {isLoggedIn ? (
                        <UserMenu />
                    ) : (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] px-6 py-3 text-[15px] font-bold text-emerald-950 shadow-[0_14px_24px_rgba(34,197,94,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1fbd58]"
                        >
                            <span>Login Now</span>
                            <span className="-mr-1">
                                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                                    <path d="M5 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    )}
                </div>
            </header>

            <main>
                <section
                    id="guide"
                    className="relative overflow-hidden px-4 min-h-[calc(100vh-73px)] flex items-center justify-center sm:px-6 lg:px-8"
                >
                    {/* Background Image with Blur and Green Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="/images/bg_itera.jpg"
                            alt="Background ITERA"
                            className="h-full w-full object-cover blur-[6px] scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#0c140e]/90 to-[#050806]/95" />
                    </div>

                    <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center py-16 sm:py-20">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-[0.28em] text-emerald-300 ring-1 ring-white/15">
                            <IconInfo />
                            <span>SISTEM MANAGEMENT DATA</span>
                        </div>
 
                        <h1 className="mt-8 max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Panduan Login{" "}
                            <span className="text-[#22c55e]">Sistem Management Data Anggota HMIF</span>
                        </h1>
 
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-100/75 sm:text-xl">
                            Ikuti langkah-langkah berikut untuk mengakses dashboard anggota HMIF dengan akun Google ITERA secara aman dan efisien.
                        </p>
 
                        <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row">
                            <a
                                href="#steps"
                                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#22c55e] px-8 py-4 text-base font-bold text-emerald-950 shadow-[0_16px_24px_rgba(34,197,94,0.3)] transition hover:-translate-y-0.5 hover:bg-[#1fbd58]"
                            >
                                <span>Mulai Panduan</span>
                                <IconArrowDown />
                            </a>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
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
                                <SocialChip label="IG" />
                                <SocialChip label="IN" />
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

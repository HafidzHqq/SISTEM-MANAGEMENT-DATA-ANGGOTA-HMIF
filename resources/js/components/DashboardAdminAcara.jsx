import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import eventWorkshop from "../assets/assets dash admin/acara/workshop.png";
import eventMeeting from "../assets/assets dash admin/acara/rapatpleno.png";
import qrImage from "../assets/sqanqr.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const FEATURED_EVENTS = [
    {
        title: "Workshop UI/UX Design Intermediate",
        description: "Fokus pada prototyping kompleks menggunakan Figma untuk skala tim.",
        image: eventWorkshop,
        tag: "SELESAI",
        footerLeft: "12 peserta",
        footerRight: "Lihat Rekap →",
    },
    {
        title: "Rapat Pleno Bulanan HMIF Sept",
        description: "Evaluasi kinerja departemen dan perencanaan program kerja triwulan.",
        image: eventMeeting,
        tag: "SELESAI",
        footerLeft: "Presensi: 45/48",
        footerRight: "Lihat Berita Acara →",
    },
];

function MetaRow({ children, type }) {
    return (
        <div className="flex items-start gap-3 text-[0.98rem] text-slate-800">
            {type === "calendar" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 3v3m8-3v3M4 8h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
            )}
            {type === "pin" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 21s6-5.2 6-11a6 6 0 10-12 0c0 5.8 6 11 6 11z" />
                    <circle cx="12" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.9" />
                </svg>
            )}
            {type === "clock" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 7v5l3 2m7-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
            )}
            <span>{children}</span>
        </div>
    );
}



export default function DashboardAdminAcara() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const userName = localStorage.getItem("name") || "Admin User";
    const nim = localStorage.getItem("nim") || "124140056";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#e7f5e5] font-sans text-gray-900">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-[252px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img
                            src={hmifLogo}
                            alt="HMIF"
                            className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20"
                        />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">
                            Himpunan Mahasiswa Informatika<br />ITERA
                        </p>
                    </div>

                    <nav className="flex-1 px-4 pt-2 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`group relative flex items-center gap-3 rounded-none px-4 py-3.5 text-[0.98rem] font-medium transition ${
                                        isActive
                                            ? "bg-white/10 text-white before:absolute before:right-0 before:top-0 before:h-full before:w-1 before:bg-[#7bd02c]"
                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                        <img
                                            src={item.icon}
                                            alt={item.label}
                                            className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95"
                                        />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4">
                        <div className="rounded-[14px] bg-white/10 px-4 py-3 shadow-inner shadow-black/10">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white/10">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                                        alt="Admin"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                                    <p className="truncate text-[0.7rem] text-white/55">{nim}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col md:ml-[252px]">
                    <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-slate-200/70 bg-white px-8 py-4 md:flex">
                        <div>
                            <p className="text-[1.05rem] font-semibold text-slate-800">Event Management</p>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <button className="transition hover:text-slate-900" aria-label="Notifikasi">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>
                            <span className="h-7 w-px bg-slate-300" />
                            <button onClick={handleLogout} className="flex items-center gap-2 text-[0.98rem] transition hover:text-slate-900">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17l5-5m0 0l-5-5m5 5H9m4 8a8 8 0 100-16" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </header>

                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                            <span className="text-sm font-bold text-slate-800">HMIF ITERA</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">
                            Logout
                        </button>
                    </header>

                    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7 pb-28 md:pb-10">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-[2.25rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Manajemen Acara</h1>
                                <p className="mt-2 text-[1rem] text-slate-700">Kelola jadwal, presensi, dan logistik acara HMIF.</p>
                            </div>
                            <button className="inline-flex items-center justify-center gap-3 rounded-[14px] bg-[#f5bf17] px-5 py-3.5 text-[0.98rem] font-semibold text-slate-900 shadow-[0_10px_22px_rgba(245,191,23,0.28)] transition hover:bg-[#ffd033]">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
                                    </svg>
                                </span>
                                Buat Acara Baru
                            </button>
                        </div>

                        <section className="w-full">
                            <div className="overflow-hidden rounded-[16px] border border-slate-300 bg-white shadow-[0_9px_18px_rgba(15,23,42,0.13)]">
                                <div className="grid min-h-[380px] xl:grid-cols-[1.18fr_0.82fr]">
                                    <div className="p-6 sm:p-7">
                                        <div className="inline-flex items-center rounded-full bg-[#def6d7] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#5baa19]">
                                            AKTIF
                                        </div>
                                        <p className="mt-3 text-[0.78rem] font-medium tracking-[0.14em] text-slate-400">ID: EV-2024-001</p>
                                        <h2 className="mt-4 max-w-[16ch] text-[2rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.35rem]">
                                            Seminar Teknologi Cloud Computing 2024
                                        </h2>

                                        <div className="mt-6 space-y-4">
                                            <MetaRow type="calendar">Kamis, 24 Oktober 2024</MetaRow>
                                            <MetaRow type="pin">Auditorium Utama Lt. 3</MetaRow>
                                            <MetaRow type="clock">Window: 08:30 - 09:30 WIB</MetaRow>
                                        </div>

                                        <div className="mt-7 flex flex-wrap gap-3">
                                            <button className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[0.96rem] font-medium text-slate-700 transition hover:bg-slate-50">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 18l6-6-6-6M9 6l-6 6 6 6" />
                                                </svg>
                                                Detail
                                            </button>
                                            <button className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[0.96rem] font-medium text-slate-700 transition hover:bg-slate-50">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a1 1 0 00-1 1v11m14-4v4a1 1 0 01-1 1h-4M8 19h8M9 17l9-9a2.121 2.121 0 10-3-3l-9 9V17h3z" />
                                                </svg>
                                                Edit
                                            </button>
                                        </div>

                                        <button className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#63bc2b] px-4 py-3 text-[0.98rem] font-medium text-slate-900 transition hover:bg-[#73cd35]">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v9m0 0l-3-3m3 3l3-3M5 19h14" />
                                            </svg>
                                            Download QR
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-200 xl:border-l xl:border-t-0">
                                        <div className="flex h-full flex-col items-center justify-center p-6 sm:p-8">
                                            <p className="text-[0.9rem] font-semibold uppercase tracking-[0.12em] text-slate-400">Auto-generated QR</p>
                                            <div className="mt-5 rounded-[18px] border-2 border-[#b6cbf6] bg-white p-3 shadow-sm">
                                                <div className="flex items-center justify-center bg-[#1f1717] p-4">
                                                    <img src={qrImage} alt="QR Code" className="h-[170px] w-[170px] object-contain" />
                                                </div>
                                            </div>
                                            <p className="mt-4 text-center text-[0.85rem] text-slate-400">Scan untuk presensi kehadiran anggota</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 grid gap-5 lg:grid-cols-3">
                            {FEATURED_EVENTS.map((event) => (
                                <article key={event.title} className="overflow-hidden rounded-[14px] border border-slate-300 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                                    <div className="relative h-[130px] overflow-hidden">
                                        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                                        <span className="absolute left-4 top-4 rounded-full bg-[#3b4a69] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
                                            {event.tag}
                                        </span>
                                    </div>
                                    <div className="p-4 sm:p-5">
                                        <h3 className="text-[1.05rem] font-bold leading-snug text-slate-900">{event.title}</h3>
                                        <p className="mt-3 text-[0.92rem] leading-6 text-slate-600">{event.description}</p>
                                        <div className="my-4 h-px bg-slate-300" />
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-[0.88rem] font-medium text-slate-500">{event.footerLeft}</p>
                                            <button className="text-[0.94rem] font-medium text-slate-500 transition hover:text-slate-900">
                                                {event.footerRight}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            <article className="flex min-h-[338px] flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-slate-500 bg-white/60 px-6 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-slate-900 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14M5 12h14" />
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-[1.55rem] font-bold leading-tight text-slate-900">
                                    Jadwalkan Acara <br /> Mendatang
                                </h3>
                                <p className="mt-4 max-w-[20ch] text-[0.98rem] leading-7 text-slate-700">
                                    Draf acara Anda dan simpan untuk diaktifkan nanti.
                                </p>
                            </article>
                        </section>

                    </main>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#185b21] md:hidden">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${
                                    isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white"
                                }`}
                            >
                                <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-0 invert" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

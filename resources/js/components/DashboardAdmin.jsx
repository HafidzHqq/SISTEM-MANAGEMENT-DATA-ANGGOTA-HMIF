import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconTotalAnggota from "../assets/assets dash admin/Icon-totalanggota.png";
import iconAcaraAktif from "../assets/assets dash admin/Icon-acaraaktif.png";
import iconHadirHariIni from "../assets/assets dash admin/Icon-hadirhariini.png";
import iconPersentaseKeaktifan from "../assets/assets dash admin/Icon-persentasekeaktifan.png";
import iconLiveHadir from "../assets/assets dash admin/Icon-livehadir.png";
import iconGrafikTotal from "../assets/assets dash admin/Icon-grafiktotalanggota.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

const SUMMARY_CARDS = [
    {
        label: "Total Anggota",
        value: "150",
        help: "+12%",
        icon: iconTotalAnggota,
        helperTone: "text-emerald-600",
        accent: "bg-[#1f5e22]",
    },
    {
        label: "Acara Aktif",
        value: "3",
        help: "This Month",
        icon: iconAcaraAktif,
        helperTone: "text-orange-500",
        accent: "bg-[#f59e0b]",
    },
    {
        label: "Hadir Hari Ini",
        value: "45",
        help: "Live",
        icon: iconLiveHadir,
        helperTone: "text-emerald-600",
        accent: "bg-[#1f5e22]",
    },
    {
        label: "Persentase Keaktifan",
        value: "92%",
        help: "Goal: 95%",
        icon: iconPersentaseKeaktifan,
        helperTone: "text-emerald-700",
        accent: "bg-[#1f5e22]",
    },
];

const DEPARTMENTS = [
    { label: "Keprofesian", value: 95 },
    { label: "Eksternal", value: 88 },
    { label: "Internal", value: 72 },
    { label: "Kominfo", value: 91 },
    { label: "BUMH", value: 84 },
];

const ACTIVITIES = [
    { title: "Budi Santoso joined the RISTEK division.", time: "2 minutes ago", tone: "bg-[#a7bffc]", icon: "👥" },
    { title: "Presensi Web Development Seminar opened.", time: "45 minutes ago", tone: "bg-[#0e2d5d]", icon: "✓" },
    { title: "New announcement sent to all Anggota Aktif.", time: "2 hours ago", tone: "bg-[#f8b38c]", icon: "✦" },
    { title: "Admin updated schedule for Makrab HMIF.", time: "Yesterday at 14:20", tone: "bg-[#9fbdf5]", icon: "≋" },
    { title: "System identified 3 missing reports from AKBES.", time: "Yesterday at 09:15", tone: "bg-[#b40c16]", icon: "⚠" },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

export default function DashboardAdmin() {
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
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
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
                                    <img src={item.icon} alt={item.label} className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4">
                        <div className="rounded-[14px] bg-white/10 px-4 py-3 shadow-inner shadow-black/10">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white/10">
                                    <img src={fotoProfile} alt="Admin" className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                                    <p className="truncate text-[0.7rem] text-white/55">{nim}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 md:ml-[252px] flex flex-col min-h-screen min-w-0 relative">
                    <header className="flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">
                            Logout
                        </button>
                    </header>

                    <header className="hidden items-center justify-between border-b border-slate-200/70 bg-white px-8 py-4 md:flex">
                        <div>
                            <p className="text-[1.05rem] font-semibold text-slate-800">Admin Dashboard</p>
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

                    <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-32 md:pb-10">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                            {SUMMARY_CARDS.map((card) => (
                                <div key={card.label} className="rounded-[12px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                                            <img src={card.icon} alt={card.label} className="h-5 w-5 object-contain" />
                                        </div>
                                        <span className={`text-xs font-semibold ${card.helperTone}`}>{card.help}</span>
                                    </div>
                                    <p className="mt-4 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-slate-700">{card.label}</p>
                                    <h2 className="mt-1 text-[2.3rem] font-extrabold leading-none text-slate-900">{card.value}</h2>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[1.9fr_0.9fr]">
                            <div className="space-y-5">
                                <section className="rounded-[10px] bg-[#7bbd36] p-5 shadow-[0_8px_18px_rgba(15,23,42,0.1)]">
                                    <div className="flex items-start justify-between gap-4 text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={iconGrafikTotal} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                            <h3 className="text-[1.2rem] font-semibold">Participation Trend</h3>
                                        </div>
                                        <button className="inline-flex items-center gap-3 rounded-[4px] bg-white/10 px-4 py-3 text-[0.95rem] text-white/95">
                                            <span>Last 30 Days</span>
                                            <svg className="h-4 w-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-10 rounded-[8px] bg-white/10 p-4">
                                        <div className="flex h-[275px] items-center justify-center rounded-[4px] border border-dashed border-white/25 bg-[#7bbd36] px-4 text-center">
                                            <div>
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white/85">
                                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" />
                                                    </svg>
                                                </div>
                                                <p className="mt-4 text-[1rem] font-semibold text-white">Grafik belum tersedia</p>
                                                <p className="mt-1 text-sm text-white/75">Data dari backend belum dimasukkan.</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <section className="rounded-[10px] bg-[#9ccc75] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <div className="flex items-center gap-3">
                                            <img src={iconHadirHariIni} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                            <h3 className="text-[1.2rem] font-semibold text-white">Attendance Status</h3>
                                        </div>
                                        <div className="mt-8 flex justify-center">
                                            <div className="relative h-[190px] w-[190px]">
                                                <div className="absolute inset-0 rotate-45 rounded-[12px] bg-[#42a40f]" />
                                                <div className="absolute inset-[14%] rotate-45 rounded-[12px] bg-[#b8dd9f]" />
                                                <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-[12px] bg-transparent text-center -rotate-45">
                                                    <p className="text-[2rem] font-extrabold leading-none text-slate-900">88%</p>
                                                    <p className="mt-1 text-[0.9rem] font-medium text-white/90">Avg.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 space-y-3 text-[0.95rem]">
                                            <div className="flex items-center justify-between text-white/90">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#1d4b28]" />
                                                    <span className="text-white/80">Present</span>
                                                </div>
                                                <span className="font-semibold text-white/90">1,240</span>
                                            </div>
                                            <div className="flex items-center justify-between text-white/90">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#ff8d2a]" />
                                                    <span className="text-white/80">Absent</span>
                                                </div>
                                                <span className="font-semibold text-white/90">145</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-[10px] bg-[#52b316] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <h3 className="text-[1.2rem] font-semibold text-white">By Department</h3>
                                        <div className="mt-6 space-y-4">
                                            {DEPARTMENTS.map((item) => (
                                                <div key={item.label}>
                                                    <div className="mb-1 flex items-center justify-between text-[0.85rem] font-medium text-white/95">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <div className="h-[8px] rounded-full bg-white/15 overflow-hidden">
                                                        <div className="h-full rounded-full bg-white" style={{ width: `${item.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            <aside className="rounded-[10px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[1.2rem] font-semibold text-slate-900">Recent Activity</h3>
                                    </div>
                                    <button className="text-[0.9rem] text-slate-700 hover:text-slate-900">View All</button>
                                </div>

                                <div className="space-y-4">
                                    {ACTIVITIES.map((activity) => (
                                        <div key={activity.title} className="relative pl-12">
                                            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-slate-300" />
                                            <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-[10px] ${activity.tone} text-white text-sm shadow-sm`}>
                                                {activity.icon}
                                            </div>
                                            <p className="text-[0.95rem] leading-6 text-slate-800">
                                                <span className="font-semibold">{activity.title}</span>
                                            </p>
                                            <p className="mt-1 text-[0.82rem] text-slate-500">{activity.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white"}`}
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


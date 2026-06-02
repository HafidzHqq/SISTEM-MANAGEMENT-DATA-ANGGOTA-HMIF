import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import iconTotalAnggota from "../assets/assets dash admin/Icon-totalanggota.png";
import iconAcaraAktif from "../assets/assets dash admin/Icon-acaraaktif.png";
import iconHadirHariIni from "../assets/assets dash admin/Icon-hadirhariini.png";
import iconPersentaseKeaktifan from "../assets/assets dash admin/Icon-persentasekeaktifan.png";
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
        iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
        label: "Acara Aktif",
        value: "3",
        help: "This Month",
        icon: iconAcaraAktif,
        iconBg: "bg-orange-100 text-orange-700",
    },
    {
        label: "Hadir Hari Ini",
        value: "45",
        help: "Live",
        icon: iconHadirHariIni,
        iconBg: "bg-slate-100 text-slate-900",
    },
    {
        label: "Persentase Keaktifan",
        value: "92%",
        help: "Goal: 95%",
        icon: iconPersentaseKeaktifan,
        iconBg: "bg-emerald-100 text-emerald-700",
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
    { title: "Budi Santoso joined the RISTEK division.", time: "2 minutes ago", color: "bg-blue-100", dot: "bg-blue-500" },
    { title: "Presensi Web Development Seminar opened.", time: "45 minutes ago", color: "bg-emerald-100", dot: "bg-emerald-500" },
    { title: "New announcement sent to all Anggota Aktif.", time: "2 hours ago", color: "bg-orange-100", dot: "bg-orange-500" },
    { title: "Admin updated schedule for Makrab HMIF.", time: "Yesterday at 14:20", color: "bg-sky-100", dot: "bg-sky-500" },
    { title: "System identified 3 missing reports from AKBES.", time: "Yesterday at 09:15", color: "bg-red-100", dot: "bg-red-500" },
];

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const userName = localStorage.getItem("name") || "Admin User";
    const nim = localStorage.getItem("nim") || "124140056";
    const firstName = userName.split(" ")[0];

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
        { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
        { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
        { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
    ];

    return (
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-55 min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-8 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-18 w-18 rounded-full object-contain border-4 border-white/20" />
                        <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] text-white/55 text-center leading-snug mt-0.5">Himpunan Mahasiswa Informatika ITERA</p>
                    </div>
                    <hr className="border-white/10 mx-4" />
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
                                >
                                    <img src={item.icon} alt={item.label} className="h-4.5 w-4.5 object-contain brightness-[10] opacity-90" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4">
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-sm font-semibold text-white truncate">{userName}</p>
                            <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                            <button onClick={handleLogout} className="mt-3 text-[0.78rem] text-red-300 hover:text-red-200 transition flex items-center gap-1">
                                ⤷ Logout
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 md:ml-55 flex flex-col min-h-screen min-w-0 relative">
                    <header className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-sm w-full">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                        </div>
                        <Link to="/dashboard/profile" className="text-gray-500">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>
                    </header>

                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-3.5 border-b border-gray-100 sticky top-0 z-40 w-full">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Admin Dashboard</h2>
                        <div className="flex items-center gap-4">
                            <button className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-11V5" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 px-4 sm:px-5 py-5 md:px-8 md:py-8 pb-32 md:pb-10">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6">
                            {SUMMARY_CARDS.map((card) => (
                                <div key={card.label} className="rounded-2xl bg-white p-6 sm:p-6 shadow-lg ring-1 ring-slate-200/70 min-h-[108px]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                                            <img src={card.icon} alt={card.label} className="h-5 w-5 object-contain" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{card.help}</span>
                                    </div>
                                    <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                                    <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900">{card.value}</h2>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.7fr_0.95fr]">
                            <div className="grid gap-4">
                                <div className="rounded-4xl bg-linear-to-br from-[#4bb84b] via-[#3dc34d] to-[#1f7b22] p-5 sm:p-6 text-white shadow-md shadow-slate-900/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold">Participation Trend</h3>
                                            <p className="text-xs md:text-sm text-white/80 mt-1">Last 30 Days</p>
                                        </div>
                                        <div className="rounded-full bg-white/10 px-3 py-2 text-xs sm:text-sm font-semibold text-white">Last 30 Days</div>
                                    </div>
                                        <div className="mt-4 md:mt-8 rounded-3xl bg-white/10 p-3 md:p-5">
                                        <div className="relative h-36 md:h-64 overflow-hidden rounded-3xl bg-white/10 p-3 md:p-4">
                                            <div className="absolute inset-x-0 bottom-0 h-24 bg-white/20 blur-xl" />
                                            <div className="relative z-10 flex h-full items-end gap-4">
                                                {[28, 38, 34, 47, 44, 52].map((height, index) => (
                                                    <div key={index} className="flex h-full flex-col items-center justify-end gap-2 md:gap-3">
                                                        <div className="h-full w-6 md:w-12 rounded-[20px] bg-white/30" style={{ height: `${height}%`, background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.15))" }} />
                                                        <span className="text-[0.65rem] md:text-[0.70rem] text-white/80">Week {index + 1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-4xl bg-[#9ccf84] p-6 shadow-sm">
                                        <h3 className="text-xl font-bold text-white mb-8">Attendance Status</h3>
                                        <div className="flex justify-center">
                                                <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-44 md:w-44">
                                                    <div className="absolute inset-0 m-auto h-28 w-28 sm:h-32 sm:w-32 md:h-44 md:w-44 rounded-[22px] bg-[#318323] rotate-45" />
                                                    <div className="absolute inset-0 m-auto h-[74%] w-[74%] sm:h-[76%] sm:w-[76%] md:h-[80%] md:w-[80%] rounded-[18px] bg-[#bce9a3] -rotate-45 flex items-center justify-center overflow-hidden">
                                                        <div className="text-center">
                                                            <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-slate-900">88%</p>
                                                            <p className="text-xs sm:text-sm md:text-sm font-semibold text-white/90 mt-1">Avg.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="mt-8 space-y-3 text-sm">
                                                <div className="flex items-center justify-between text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3.5 w-3.5 rounded-full bg-slate-900" />
                                                        <span className="text-sm">Present</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-900">1,240</span>
                                                </div>
                                                <div className="flex items-center justify-between text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3.5 w-3.5 rounded-full bg-orange-500" />
                                                        <span className="text-sm">Absent</span>
                                                    </div>
                                                    <span className="font-semibold text-slate-900">145</span>
                                                </div>
                                            </div>
                                    </div>

                                    <div className="rounded-4xl bg-[#2d8a24] p-6 text-white shadow-sm">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h3 className="text-lg font-bold">By Department</h3>
                                                <p className="text-sm text-white/75 mt-1">Performance comparison</p>
                                            </div>
                                            <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white">Goal: 100%</span>
                                        </div>
                                        <div className="space-y-4">
                                            {DEPARTMENTS.map((item) => (
                                                <div key={item.label}>
                                                    <div className="flex items-center justify-between text-sm font-semibold mb-2 text-white">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                                                        <div className="h-full rounded-full bg-white" style={{ width: `${item.value}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-4xl bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                                        <p className="text-sm text-slate-500">Latest system updates and user actions</p>
                                    </div>
                                    <button className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {ACTIVITIES.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                                            <div className={`${activity.dot} h-3.5 w-3.5 rounded-full mt-1 shrink-0`} />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                                                <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]">
                <div className="grid grid-cols-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white"}`}
                            >
                                <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-[10]" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

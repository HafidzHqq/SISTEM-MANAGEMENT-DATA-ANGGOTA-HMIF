import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";
import iconQrscan from "../assets/icon-qrscan.png";
import iconManual from "../assets/icon-manual.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconKehadiran from "../assets/icon-grafikkehadiran.png";
import iconHadir from "../assets/icon-hadir.png";
import iconTidakHadir from "../assets/icon-tidakhadir.png";
import iconArchive from "../assets/icon-archive.png";
import iconPrint from "../assets/icon-print.png";
import iconRingkasan from "../assets/icon-ringkasan.png";

const HISTORY_DATA = [
    { name: "Rapat Kerja", location: "GKU2 ITERA", date: "12 Oct 2023", time: "09:00 WIB", method: "QR Scan", status: "hadir" },
    { name: "Workshop UI/UX", location: "AULA GKU2", date: "15 Oct 2023", time: "13:30 WIB", method: "Manual", status: "tidak_hadir" },
    { name: "Evaluasi Bulanan", location: "LAB IOT", date: "30 Oct 2023", time: "16:00 WIB", method: "QR Scan", status: "hadir" },
];

export default function DashboardHistory() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("semua");
    const [search, setSearch] = useState("");

    const name = localStorage.getItem("name") || "Anggota HMIF";
    const nim = localStorage.getItem("nim") || "124140056";
    const division = localStorage.getItem("division") || "Technopreneur";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
        { label: "History", icon: iconHistory, to: "/dashboard/history" },
        { label: "Profile", icon: iconProfile, to: "/dashboard/profile" },
    ];

    const filtered = HISTORY_DATA.filter((item) => {
        const matchFilter = filter === "semua" || (filter === "hadir" && item.status === "hadir") || (filter === "tidak_hadir" && item.status === "tidak_hadir");
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const StatusBadge = ({ status }) => (
        <span className={`text-[0.68rem] font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap ${status === "hadir" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {status === "hadir" ? "Hadir" : "Tidak Hadir"}
        </span>
    );

    const filters = [
        { key: "semua", label: "Semua" },
        { key: "hadir", label: "Hadir" },
        { key: "tidak_hadir", label: "Tidak Hadir" },
    ];

    return (
        <div className="min-h-screen bg-[#f0f2ee] font-sans flex">

            {/* ════════ DESKTOP SIDEBAR ════════ */}
            <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
                <div className="flex flex-col items-center pt-8 pb-5 px-4">
                    <img src={hmifLogo} alt="HMIF" className="h-[72px] w-[72px] rounded-full object-contain border-4 border-white/20" />
                    <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                    <p className="text-[0.62rem] text-white/55 text-center leading-snug mt-0.5">Himpunan Mahasiswa Informatika ITERA</p>
                </div>
                <hr className="border-white/10 mx-4" />
                <nav className="flex-1 px-3 pt-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.to === "/dashboard/history";
                        return (
                            <Link key={item.label} to={item.to}
                                className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                                <img src={item.icon} alt="" className="h-[18px] w-[18px] object-contain brightness-[10] opacity-90" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4">
                    <div className="bg-white/10 rounded-2xl px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                        <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                        <button onClick={handleLogout} className="mt-3 text-[0.78rem] text-red-300 hover:text-red-200 transition flex items-center gap-1">⤷ Logout</button>
                    </div>
                </div>
            </aside>

            {/* ════════ MAIN AREA ════════ */}
            <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                        <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                    </div>
                    <Link to="/dashboard/profile">
                        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </header>

                {/* Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                    <h2 className="text-[1.05rem] font-bold text-gray-800">History</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{division}</span>
                        <div className="h-5 w-px bg-gray-200" />
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <img src={fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                    </div>
                </header>

                {/* ── PAGE CONTENT ── */}
                <main className="flex-1 px-5 py-7 md:px-8 md:py-8 pb-28 md:pb-10">

                    {/* Title */}
                    <h1 className="text-[1.6rem] md:text-[1.9rem] font-extrabold text-gray-900 mb-1">Riwayat Kehadiran</h1>
                    <p className="hidden md:block text-sm text-gray-400 mb-6">Pantau dan kelola log kehadiran anda secara real-time.</p>
                    <hr className="md:hidden border-gray-200 mb-5" />

                    {/* ── STAT CARDS (desktop) ── */}
                    <div className="hidden md:grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-green-500">
                            <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">Total Kegiatan</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">42</span>
                                <img src={iconKegiatan} alt="" className="h-6 w-6 object-contain opacity-70" />
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-green-500">
                            <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">Kehadiran (%)</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">88.4%</span>
                                <img src={iconKehadiran} alt="" className="h-6 w-6 object-contain opacity-70" />
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">Hadir</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">37</span>
                                <img src={iconHadir} alt="" className="h-6 w-6 object-contain" />
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <p className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">Tidak Hadir</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">3</span>
                                <img src={iconTidakHadir} alt="" className="h-6 w-6 object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* ── SEARCH + FILTERS ── */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Cari kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                />
                            </div>
                            {/* Filter Pills */}
                            <div className="flex gap-2">
                                {filters.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-4 py-1.5 rounded-full text-[0.78rem] font-semibold transition ${filter === f.key ? "bg-green-600 text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── DESKTOP TABLE ── */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Event Name</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Location</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Date</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Time</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Method</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Status</th>
                                        <th className="text-left py-3 px-2 text-[0.65rem] font-bold tracking-[0.15em] uppercase text-gray-400">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                                            <td className="py-4 px-2 font-semibold text-gray-800">{item.name}</td>
                                            <td className="py-4 px-2 text-[0.7rem] font-bold tracking-wider uppercase text-gray-500">{item.location}</td>
                                            <td className="py-4 px-2 text-gray-600">{item.date}</td>
                                            <td className="py-4 px-2 text-gray-600">{item.time}</td>
                                            <td className="py-4 px-2 text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <img src={item.method === "QR Scan" ? iconQrscan : iconManual} alt="" className="h-4 w-4 object-contain" /> {item.method}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2"><StatusBadge status={item.status} /></td>
                                            <td className="py-4 px-2 text-gray-500 hover:text-green-600 cursor-pointer font-medium">Detail</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── MOBILE CARDS ── */}
                        <div className="md:hidden space-y-4">
                            {filtered.map((item, i) => (
                                <div key={i} className="border border-gray-100 rounded-2xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                            <p className="text-[0.75rem] text-gray-400 uppercase tracking-wider">{item.location}</p>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <div className="flex items-center gap-5 mt-3 text-[0.8rem] text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {item.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {item.time}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-[0.75rem] text-gray-400">
                                        {item.method === "QR Scan" ? "Metode: QR Scan" : item.status === "tidak_hadir" ? "Tanpa Keterangan" : `Metode: ${item.method}`}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* ── PAGINATION (desktop) ── */}
                        <div className="hidden md:flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-400">Showing 1-3 of 42 results</p>
                            <div className="flex items-center gap-1">
                                <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">‹</button>
                                <button className="h-8 w-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-xs font-bold">1</button>
                                <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">2</button>
                                <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">3</button>
                                <span className="text-gray-400 text-xs px-1">...</span>
                                <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-xs">11</button>
                                <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 text-xs">›</button>
                            </div>
                        </div>
                    </div>

                    {/* ── SUMMARY ROW ── */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">

                        {/* Green Summary Card — full width on mobile, flex-1 on desktop */}
                        <div className="flex-1 rounded-2xl px-6 py-5 text-white flex items-center justify-between" style={{ background: "linear-gradient(135deg, #3db53d 0%, #1c5e22 100%)" }}>
                            <div>
                                <p className="text-[0.78rem] font-semibold text-white/80 mb-3">Ringkasan Bulan Oktober</p>
                                <div className="flex items-end gap-6">
                                    <div>
                                        <span className="text-[1.8rem] font-extrabold leading-none">85%</span>
                                        <p className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-white/55 mt-1">Kehadiran</p>
                                    </div>
                                    <div>
                                        <span className="text-[1.8rem] font-extrabold leading-none">5</span>
                                        <p className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-white/55 mt-1">Kegiatan</p>
                                    </div>
                                </div>
                            </div>
                            <img src={iconRingkasan} alt="" className="h-12 w-12 object-contain opacity-60" />
                        </div>

                        {/* Action Buttons — desktop & tablet only */}
                        <div className="hidden md:flex md:flex-col xl:flex-row items-stretch gap-3">
                            <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-xl px-5 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition whitespace-nowrap shadow-sm">
                                <img src={iconArchive} alt="" className="h-4 w-4 object-contain" />
                                Archive Old Logs
                            </button>
                            <button className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition whitespace-nowrap shadow-sm" style={{ background: "linear-gradient(135deg, #3db53d 0%, #228b22 100%)" }}>
                                <img src={iconPrint} alt="" className="h-4 w-4 object-contain brightness-[10]" />
                                Print Summary Report
                            </button>
                        </div>

                    </div>
                </main>
            </div>

            {/* ════════ MOBILE BOTTOM NAV ════════ */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1c5e22] flex z-50">
                {navItems.map((item) => {
                    const isActive = item.to === "/dashboard/history";
                    return (
                        <Link key={item.label} to={item.to} className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 ${isActive ? "bg-white/15" : ""}`}>
                            <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-[10]" />
                            <span className="text-[0.58rem] font-bold tracking-[0.12em] text-white/80 uppercase">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
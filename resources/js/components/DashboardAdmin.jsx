import React, { useEffect, useMemo, useState } from "react";
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

const SUMMARY_CARD_CONFIG = [
    {
        key: "total_attendance_participants",
        label: "Total Anggota",
        help: "Aktif",
        icon: iconTotalAnggota,
        helperTone: "text-emerald-600",
        accent: "bg-[#1f5e22]",
    },
    {
        key: "active_events",
        label: "Acara Aktif",
        help: "Aktif",
        icon: iconAcaraAktif,
        helperTone: "text-orange-500",
        accent: "bg-[#f59e0b]",
    },
    {
        key: "today_attendances",
        label: "Hadir Hari Ini",
        help: "Live",
        icon: iconLiveHadir,
        helperTone: "text-emerald-600",
        accent: "bg-[#1f5e22]",
    },
    {
        key: "attendance_rate",
        label: "Persentase Kehadiran",
        help: "Global",
        icon: iconPersentaseKeaktifan,
        helperTone: "text-emerald-700",
        accent: "bg-[#1f5e22]",
        isPercent: true,
    },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard/admin-overview", activePaths: ["/dashboard", "/dashboard/admin-overview"] },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const numberFormatter = new Intl.NumberFormat("id-ID");

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const formatPercent = (value) => `${Math.round(clampPercent(value))}%`;

const TREND_RANGE_OPTIONS = [
    { value: "7D", label: "7 Hari" },
    { value: "30D", label: "30 Hari" },
    { value: "90D", label: "90 Hari" },
];

const getTrendRangeDays = (range) => {
    if (range === "7D") return 7;
    if (range === "90D") return 90;
    return 30;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");

    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const formatRelativeTime = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
};

const normalizeDepartment = (value) => {
    const normalized = String(value ?? "").trim();
    const lower = normalized.toLowerCase();

    if (!normalized || normalized === "-") return "Belum Ditentukan";
    if (["keprof", "keprofesian", "technopreneur", "minat bakat"].includes(lower)) return "KEPROF";
    if (lower === "psda") return "PSDA";
    if (lower === "internal") return "INTERNAL";
    if (["external", "eksternal"].includes(lower)) return "EXTERNAL";
    if (lower === "kominfo") return "KOMINFO";
    if (lower === "kesekjenan") return "KESEKJENAN";

    return normalized.toUpperCase();
};
const formatShortDate = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
    });
};

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const [trendRange, setTrendRange] = React.useState("30D");
    const [dashboardData, setDashboardData] = React.useState(null);
    const [dashboardError, setDashboardError] = React.useState("");
    const [isDashboardLoading, setIsDashboardLoading] = React.useState(false);
    const [user, setUser] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [userDivision, setUserDivision] = useState("Admin");
    const userName = localStorage.getItem("name") || "Admin User";
    const firstName = userName.split(" ")[0];
    const nim = user?.nim || localStorage.getItem("nim") || "-";
    const isSuperAdmin = localStorage.getItem("role") === "super_admin";

    React.useEffect(() => {
        let isMounted = true;

        const token = localStorage.getItem("auth_token");
        if (!token) return;

        // Fetch user profile
        fetch("/api/me", {
            headers: getAuthHeaders(),
        })
            .then((res) => res.json())
            .then((data) => {
                if (isMounted) {
                    setUser(data);
                    setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : fotoProfile);
                    setUserDivision(data?.profile?.departemen || data?.profile?.Departemen || "Admin");
                }
            })
            .catch(() => {
                if (isMounted) setFotoUrl(fotoProfile);
            });

        // Fetch dashboard stats
        const fetchDashboardStats = async () => {
            setIsDashboardLoading(true);
            setDashboardError("");

            try {
                const response = await fetch("/api/dashboard/attendance-statistics", {
                    headers: getAuthHeaders(),
                });
                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(payload.message || "Gagal mengambil statistik dashboard.");
                }

                if (isMounted) {
                    setDashboardData(payload);
                }
            } catch (error) {
                if (isMounted) {
                    setDashboardError(error.message || "Gagal mengambil statistik dashboard.");
                }
            } finally {
                if (isMounted) {
                    setIsDashboardLoading(false);
                }
            }
        };

        fetchDashboardStats();

        return () => {
            isMounted = false;
        };
    }, []);

    const summary = dashboardData?.summary || {};
    const charts = dashboardData?.charts || {};
    const attendanceRate = clampPercent(summary.attendance_rate);
    const summaryCards = SUMMARY_CARD_CONFIG.map((card) => ({
        ...card,
        value: card.isPercent ? formatPercent(summary[card.key]) : formatNumber(summary[card.key]),
        help: isDashboardLoading ? "Memuat" : card.help,
    }));
    const attendanceByDepartment = charts.attendance_by_department || [];
    const departmentTotal = attendanceByDepartment.reduce((total, item) => total + Number(item.total_present || 0), 0);
    const departmentStats = attendanceByDepartment.slice(0, 5).map((item) => ({
        label: normalizeDepartment(item.departemen),
        value: departmentTotal > 0 ? Math.round((Number(item.total_present || 0) / departmentTotal) * 100) : 0,
        total: Number(item.total_present || 0),
    }));
    const trendItems = (charts.attendance_trend_by_event || [])
        .filter((item) => {
            const eventDate = new Date(item.date_time);

            if (Number.isNaN(eventDate.getTime())) return true;

            const rangeDays = getTrendRangeDays(trendRange);
            const diffDays = (Date.now() - eventDate.getTime()) / 86400000;

            return diffDays <= rangeDays;
        })
        .slice(-8);
    const trendMax = Math.max(...trendItems.map((item) => Number(item.total_present || 0)), 1);


    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] font-sans text-slate-950">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
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
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = item.activePaths ? item.activePaths.includes(pathname) : pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${
                                        isActive
                                            ? "bg-white/15 text-white"
                                            : "text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <img src={item.icon} alt={item.label} className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        {!isSuperAdmin && (
                            <Link
                                to="/dashboard/member"
                                className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${
                                    pathname === "/dashboard/member"
                                        ? "bg-white/15 text-white"
                                        : "text-white/65 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <img src={iconProfile} alt="Absen Saya" className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95" />
                                Absen Saya
                            </Link>
                        )}
                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={() => navigate("/dashboard")}
                                className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-[10px] text-left text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                            >
                                <img
                                    src={iconDashboard}
                                    alt="Super Admin Dashboard"
                                    className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95"
                                />
                                <span className="truncate">Super Admin Dashboard</span>
                            </button>
                        )}
                    </nav>
                    <div className="p-4">
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-sm font-semibold text-white truncate">{userName}</p>
                            <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                            <button onClick={handleLogout} className="mt-3 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-red-300 transition hover:text-red-200">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l5-5-5-5M15 12H3" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col md:ml-[220px]">
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                            <span className="text-sm font-bold text-slate-800">HMIF ITERA</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition active:scale-95"
                        >
                            Logout
                        </button>
                    </header>

                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Dashboard Admin</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-slate-500">
                                {userDivision}
                            </span>
                            <div className="h-5 w-px bg-gray-200" />
                            <button className="text-slate-500 hover:text-gray-600 transition" aria-label="Notifikasi">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <img
                                src={fotoUrl || fotoProfile}
                                alt="Foto profil"
                                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                            />
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-32 md:pb-10">

                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-[1.85rem] font-extrabold text-slate-950 md:text-[2.1rem]">
                                    Welcome, {firstName}.
                                </h1>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => navigate("/scan")}
                                    className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#1f7a2c] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#186322]"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10" /></svg>
                                    Scan QR Anggota
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/scan")}
                                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    Set Hadir Manual
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="rounded-[10px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 md:h-10 md:w-10">
                                            <img src={card.icon} alt={card.label} className="h-4 w-4 object-contain md:h-5 md:w-5" />
                                        </div>
                                        <span className={`text-[0.68rem] font-semibold md:text-xs ${card.helperTone}`}>{card.help}</span>
                                    </div>
                                    <p className="mt-4 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-slate-700 md:text-[0.8rem] md:tracking-[0.18em]">{card.label}</p>
                                    <h2 className="mt-1 text-[1.8rem] font-extrabold leading-none text-slate-900 md:text-[2.3rem]">{card.value}</h2>
                                </div>
                            ))}
                        </div>

                        {dashboardError && (
                            <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {dashboardError}
                            </div>
                        )}

                        <div className="space-y-5">
                            <section className="rounded-[10px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                    <div className="flex items-start justify-between gap-4 text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <img src={iconGrafikTotal} alt="" className="h-5 w-5 object-contain " />
                                            <h3 className="text-[1.2rem] font-bold">Tren Partisipasi</h3>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={trendRange}
                                                onChange={(event) => setTrendRange(event.target.value)}
                                                className="h-11 appearance-none rounded-[6px] border border-slate-200 bg-slate-100 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                                            >
                                                {TREND_RANGE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-[8px] bg-slate-50 p-4 ring-1 ring-slate-100">
                                        <div className="h-[275px] rounded-[4px] bg-white px-4 pb-4 pt-6">
                                            {trendItems.length > 0 ? (
                                                <div className="flex h-full items-end gap-3">
                                                    {trendItems.map((item) => {
                                                        const barHeight = Math.max(16, Math.round((Number(item.total_present || 0) / trendMax) * 100));

                                                        return (
                                                            <div key={item.event_id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                                                                <div className="flex w-full flex-1 items-end">
                                                                    <div
                                                                        className="w-full rounded-t-[6px] bg-emerald-600 shadow-sm transition-all"
                                                                        style={{ height: `${barHeight}%` }}
                                                                        title={`${item.title}: ${formatNumber(item.total_present)} hadir`}
                                                                    />
                                                                </div>
                                                                <div className="w-full text-center">
                                                                    <p className="text-[0.68rem] font-semibold text-slate-500">{formatShortDate(item.date_time)}</p>
                                                                    <p className="mt-0.5 truncate text-[0.68rem] font-bold text-slate-700" title={item.title || "Tanpa Nama Acara"}>
                                                                        {item.title || "Tanpa Nama Acara"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-4 text-center">
                                                    <div>
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" />
                                                            </svg>
                                                        </div>
                                                        <p className="mt-4 text-[1rem] font-semibold text-slate-900">Belum ada data presensi</p>
                                                        <p className="mt-1 text-sm text-slate-500">Grafik akan muncul setelah ada check-in.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <section className="rounded-[10px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                        <div className="flex items-center gap-3">
                                            <img src={iconHadirHariIni} alt="" className="h-5 w-5 object-contain " />
                                            <h3 className="text-[1.2rem] font-bold text-slate-900">Status Kehadiran</h3>
                                        </div>
                                        <div className="mt-8 flex justify-center">
                                            <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full sm:h-[190px] sm:w-[190px]">
                                                <div
                                                    className="absolute inset-0 rounded-full shadow-inner"
                                                    style={{
                                                        background: `conic-gradient(#1d4b28 0deg ${attendanceRate * 3.6}deg, rgba(255,255,255,0.28) ${attendanceRate * 3.6}deg 360deg)`,
                                                    }}
                                                />
                                                <div className="absolute inset-[12%] rounded-full bg-emerald-50" />
                                                <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-white text-center">
                                                    <p className="text-[1.7rem] font-extrabold leading-none text-slate-900 sm:text-[2rem]">{formatPercent(attendanceRate)}</p>
                                                    <p className="mt-1 text-[0.8rem] font-medium text-slate-500 sm:text-[0.9rem]">Rata-rata</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 space-y-3 text-[0.95rem]">
                                            <div className="flex items-center justify-between text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#1d4b28]" />
                                                    <span className="text-slate-500">Hadir</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">{formatNumber(summary.total_attendances || 0)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#ff8d2a]" />
                                                    <span className="text-slate-500">Tidak Hadir</span>
                                                </div>
                                                <span className="font-semibold text-slate-700">{formatNumber(summary.total_absences || 0)}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-[10px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                        <h3 className="text-[1.2rem] font-bold text-slate-900">Per Departemen</h3>
                                        <div className="mt-6 space-y-4">
                                            {departmentStats.length > 0 ? (
                                                departmentStats.map((item) => (
                                                    <div key={item.label}>
                                                        <div className="mb-1 flex items-center justify-between text-[0.85rem] font-medium text-slate-700">
                                                            <span>{item.label}</span>
                                                            <span>{item.value}%</span>
                                                        </div>
                                                        <div className="h-[8px] overflow-hidden rounded-full bg-slate-100">
                                                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${item.value}%` }} />
                                                        </div>
                                                        <p className="mt-1 text-[0.72rem] font-medium text-slate-500">{formatNumber(item.total)} check-in</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-[8px] bg-white/10 px-4 py-5 text-sm font-medium text-slate-500">
                                                    Belum ada data departemen.
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.activePaths ? item.activePaths.includes(pathname) : pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "text-white bg-white/10" : "text-slate-500 hover:text-white"}`}
                            >
                                <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain " />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

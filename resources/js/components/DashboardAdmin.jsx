import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
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

import NotificationBell from "./NotificationBell";
import BottomBar from "./buttombar";

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
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(
        localStorage.getItem("sidebar-collapsed") === "true"
    );

    const toggleSidebarCollapse = () => {
        const newValue = !isSidebarCollapsed;
        setIsSidebarCollapsed(newValue);
        localStorage.setItem("sidebar-collapsed", String(newValue));
    };
    const location = useLocation();
    const pathname = location.pathname;
    const [trendRange, setTrendRange] = React.useState("30D");
    const [dashboardData, setDashboardData] = React.useState(null);
    const [dashboardError, setDashboardError] = React.useState("");
    const [isDashboardLoading, setIsDashboardLoading] = React.useState(false);
    const [user, setUser] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [fotoLoadFailed, setFotoLoadFailed] = useState(false);
    const [userDivision, setUserDivision] = useState("Admin");
    const userName = user?.name || localStorage.getItem("name") || "Admin User";
    const firstName = userName.split(" ")[0];
    const nim = user?.nim || localStorage.getItem("nim") || "-";
    const isSuperAdmin = user?.role === "super_admin";
    const displayFoto = fotoLoadFailed ? fotoProfile : (fotoUrl || fotoProfile);

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
                    setFotoLoadFailed(false);
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
    const totalMembersVal = Number(summary.total_attendance_participants || 1);
    const trendMax = Math.max(...trendItems.map((item) => Number(item.total_present || 0)), totalMembersVal, 1);


    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,94,34,0.14),_transparent_34%),linear-gradient(180deg,_#f9fbf9_0%,_#eef4ef_100%)] font-sans text-slate-950">
            <div className="min-h-screen flex">
                {/* Mobile Sidebar Backdrop Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar
                    role="admin"
                    userName={userName}
                    nim={nim}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                />

                <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${isSidebarCollapsed ? "md:ml-[76px]" : "md:ml-[240px]"}`}>
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3.5 backdrop-blur md:hidden">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
                                aria-label="Open sidebar"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                                <span className="text-sm font-bold text-slate-800">Admin HMIF</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-full border border-red-100 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 transition active:scale-95"
                        >
                            Logout
                        </button>
                    </header>

                    <header className="hidden sticky top-0 z-40 items-center justify-between border-b border-white/70 bg-white/85 px-8 py-4 backdrop-blur md:flex">
                        <div>
                            <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-emerald-700">Admin Overview</p>
                            <h2 className="mt-1 text-[1.1rem] font-extrabold text-slate-900">Dashboard Admin</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.7rem] font-bold tracking-[0.16em] uppercase text-emerald-700">
                                {userDivision}
                            </span>
                            <div className="h-5 w-px bg-gray-200" />
                            <NotificationBell />
                            <img
                                src={displayFoto}
                                alt="Foto profil"
                                className="h-10 w-10 rounded-full border-2 border-emerald-100 object-cover shadow-sm"
                                onError={() => setFotoLoadFailed(true)}
                            />
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-32 md:pb-10">

                        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-emerald-700">Selamat datang kembali</p>
                                <h1 className="mt-2 text-[1.95rem] font-black tracking-tight text-slate-950 md:text-[2.4rem]">
                                    Welcome, {firstName}.
                                </h1>
                                <div className="mt-4 flex flex-wrap gap-2 text-[0.78rem] font-semibold text-slate-600">
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{userDivision}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">NIM: {nim}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => navigate("/scan")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#1f7a2c_0%,_#2b8f3c_100%)] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(31,122,44,0.28)] transition hover:brightness-105"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10" /></svg>
                                    Scan QR Anggota
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/scan")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                    Set Hadir Manual
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {summaryCards.map((card) => (
                                <div key={card.label} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] md:p-6">
                                    <div className={`h-1 w-16 rounded-full ${card.accent}`} />
                                    <div className="flex items-start justify-between">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 md:h-12 md:w-12">
                                            <img src={card.icon} alt={card.label} className="h-4 w-4 object-contain md:h-5 md:w-5" />
                                        </div>
                                        <span className={`rounded-full bg-slate-50 px-3 py-1 text-[0.68rem] font-semibold md:text-xs ${card.helperTone}`}>{card.help}</span>
                                    </div>
                                    <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-[0.8rem]">{card.label}</p>
                                    <h2 className="mt-2 text-[1.9rem] font-black leading-none tracking-tight text-slate-900 md:text-[2.5rem]">{card.value}</h2>
                                </div>
                            ))}
                        </div>

                        {dashboardError && (
                            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
                                        <div className="h-[350px] rounded-[4px] bg-white px-4 pb-4 pt-6">
                                            {trendItems.length > 0 ? (
                                                <div className="flex h-full items-end justify-start gap-3 sm:gap-4 overflow-x-auto pb-1.5 scrollbar-thin">
                                                    {trendItems.map((item) => {
                                                        const totalPresent = Number(item.total_present || 0);
                                                        const barHeight = totalPresent > 0
                                                            ? Math.max(6, Math.round((totalPresent / trendMax) * 100))
                                                            : 0;

                                                        return (
                                                            <div key={item.event_id} className="flex h-full w-28 sm:w-32 shrink-0 flex-col items-center justify-end gap-2">
                                                                <div className="flex w-full flex-1 items-end justify-center">
                                                                    <div
                                                                        className="w-16 sm:w-20 rounded-t-[8px] bg-[#1c5e22] shadow-sm transition-all hover:bg-emerald-600"
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

            <BottomBar items={NAV_ITEMS.map(item => ({ label: item.label, href: item.to }))} activeHref={pathname === "/dashboard" ? "/dashboard/admin-overview" : pathname} />
        </div>
    );
}

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

const SUMMARY_CARD_CONFIG = [
    {
        key: "total_members",
        label: "Total Anggota",
        help: "Terdaftar",
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
        label: "Persentase Keaktifan",
        help: "Global",
        icon: iconPersentaseKeaktifan,
        helperTone: "text-emerald-700",
        accent: "bg-[#1f5e22]",
        isPercent: true,
    },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const numberFormatter = new Intl.NumberFormat("id-ID");

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const formatPercent = (value) => `${Math.round(clampPercent(value))}%`;

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
    const userName = localStorage.getItem("name") || "Admin User";
    const nim = localStorage.getItem("nim") || "124140056";

    React.useEffect(() => {
        let isMounted = true;

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
        label: item.departemen || "Belum Ditentukan",
        value: departmentTotal > 0 ? Math.round((Number(item.total_present || 0) / departmentTotal) * 100) : 0,
        total: Number(item.total_present || 0),
    }));
    const trendItems = (charts.attendance_trend_by_event || [])
        .filter((item) => {
            const eventDate = new Date(item.date_time);

            if (Number.isNaN(eventDate.getTime())) return true;

            const rangeDays = trendRange === "7D" ? 7 : 30;
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
                            {summaryCards.map((card) => (
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

                        {dashboardError && (
                            <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {dashboardError}
                            </div>
                        )}

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
                                        <div className="h-[275px] rounded-[4px] bg-[#7bbd36] px-4 pb-4 pt-6">
                                            {trendItems.length > 0 ? (
                                                <div className="flex h-full items-end gap-3">
                                                    {trendItems.map((item) => {
                                                        const barHeight = Math.max(16, Math.round((Number(item.total_present || 0) / trendMax) * 100));

                                                        return (
                                                            <div key={item.event_id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                                                                <div className="flex w-full flex-1 items-end">
                                                                    <div
                                                                        className="w-full rounded-t-[6px] bg-white/85 shadow-sm transition-all"
                                                                        style={{ height: `${barHeight}%` }}
                                                                        title={`${item.title}: ${formatNumber(item.total_present)} hadir`}
                                                                    />
                                                                </div>
                                                                <div className="w-full truncate text-center text-[0.68rem] font-semibold text-white/80">
                                                                    {formatShortDate(item.date_time)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex h-full items-center justify-center px-4 text-center">
                                                    <div>
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white/85">
                                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8v-6" />
                                                            </svg>
                                                        </div>
                                                        <p className="mt-4 text-[1rem] font-semibold text-white">Belum ada data presensi</p>
                                                        <p className="mt-1 text-sm text-white/75">Grafik akan muncul setelah ada check-in.</p>
                                                    </div>
                                                </div>
                                            )}
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
                                            <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full sm:h-[190px] sm:w-[190px]">
                                                <div
                                                    className="absolute inset-0 rounded-full shadow-inner"
                                                    style={{
                                                        background: `conic-gradient(#1d4b28 0deg ${attendanceRate * 3.6}deg, rgba(255,255,255,0.28) ${attendanceRate * 3.6}deg 360deg)`,
                                                    }}
                                                />
                                                <div className="absolute inset-[12%] rounded-full bg-[#b8dd9f]" />
                                                <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-[#9ccc75] text-center">
                                                    <p className="text-[1.7rem] font-extrabold leading-none text-slate-900 sm:text-[2rem]">{formatPercent(attendanceRate)}</p>
                                                    <p className="mt-1 text-[0.8rem] font-medium text-white/90 sm:text-[0.9rem]">Avg.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 space-y-3 text-[0.95rem]">
                                            <div className="flex items-center justify-between text-white/90">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#1d4b28]" />
                                                    <span className="text-white/80">Present</span>
                                                </div>
                                                <span className="font-semibold text-white/90">{formatNumber(summary.total_attendances)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-white/90">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-3.5 w-3.5 rounded-full bg-[#ff8d2a]" />
                                                    <span className="text-white/80">Absent</span>
                                                </div>
                                                <span className="font-semibold text-white/90">{formatNumber(summary.total_absences)}</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-[10px] bg-[#52b316] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <h3 className="text-[1.2rem] font-semibold text-white">By Department</h3>
                                        <div className="mt-6 space-y-4">
                                            {departmentStats.length > 0 ? (
                                                departmentStats.map((item) => (
                                                    <div key={item.label}>
                                                        <div className="mb-1 flex items-center justify-between text-[0.85rem] font-medium text-white/95">
                                                            <span>{item.label}</span>
                                                            <span>{item.value}%</span>
                                                        </div>
                                                        <div className="h-[8px] overflow-hidden rounded-full bg-white/15">
                                                            <div className="h-full rounded-full bg-white" style={{ width: `${item.value}%` }} />
                                                        </div>
                                                        <p className="mt-1 text-[0.72rem] font-medium text-white/70">{formatNumber(item.total)} check-in</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-[8px] bg-white/10 px-4 py-5 text-sm font-medium text-white/80">
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

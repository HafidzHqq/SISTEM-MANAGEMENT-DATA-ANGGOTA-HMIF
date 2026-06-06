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
    return `${Math.floor(diffHours / 24)} hari lalu`;
};

const formatShortDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
};

export default function DashboardAdmin() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [user, setUser] = React.useState(null);
    const [fotoUrl, setFotoUrl] = React.useState(null);
    const [dashboardData, setDashboardData] = React.useState(null);
    const [dashboardError, setDashboardError] = React.useState("");
    const [departemenStats, setDepartemenStats] = React.useState([]);
    const [stats, setStats] = React.useState({
        totalAnggota: "-",
        acaraAktif: "-",
        hadirHariIni: "-",
        persentaseKeaktifan: "-",
        total_valid_radius: "-",
        total_invalid_radius: "-",
    });

    const userName = user?.name || localStorage.getItem("name") || "Admin";
    const nim = user?.nim || localStorage.getItem("nim") || "-";
    const division = user?.profile?.departemen || "Admin";

    const handleLogout = () => {
        ["auth_token", "role", "name", "nim"].forEach(k => localStorage.removeItem(k));
        navigate("/login");
    };

    React.useEffect(() => {
        const headers = getAuthHeaders();

        fetch("/api/me", { headers })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : null);
            })
            .catch(() => null);

        fetch("/api/dashboard/attendance-statistics", { headers })
            .then(res => res.json())
            .then(data => {
                setDashboardData(data);
                if (data?.summary) {
                    setStats(prev => ({
                        ...prev,
                        hadirHariIni: data.summary.total_attendances ?? prev.hadirHariIni,
                        persentaseKeaktifan: data.summary.attendance_rate ?? prev.persentaseKeaktifan,
                        total_valid_radius: data.summary.total_valid_radius ?? prev.total_valid_radius,
                        total_invalid_radius: data.summary.total_invalid_radius ?? prev.total_invalid_radius,
                    }));
                }
                if (Array.isArray(data?.charts?.attendance_by_department) && data.charts.attendance_by_department.length > 0) {
                    const counts = data.charts.attendance_by_department.map(item => ({
                        label: item.departemen || "Lainnya",
                        count: Number(item.total_present) || 0,
                    }));
                    const total = counts.reduce((s, it) => s + it.count, 0) || 1;
                    setDepartemenStats(counts.map(it => ({
                        label: it.label,
                        value: Math.round((it.count / total) * 100),
                        total: it.count,
                    })));
                }
            })
            .catch(() => setDashboardError("Gagal memuat statistik dashboard."));

        fetch("/api/members", { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStats(prev => ({ ...prev, totalAnggota: data.length }));
                    if (departemenStats.length === 0) {
                        const deptMap = {};
                        data.forEach(m => {
                            const dept = m.member_profile?.departemen || "Lainnya";
                            deptMap[dept] = (deptMap[dept] || 0) + 1;
                        });
                        const total = data.length || 1;
                        setDepartemenStats(Object.entries(deptMap).map(([label, count]) => ({
                            label,
                            value: Math.round((count / total) * 100),
                            total: count,
                        })));
                    }
                }
            })
            .catch(() => null);

        fetch("/api/events", { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const now = new Date();
                    const aktif = data.filter(e => new Date(e.attendance_window_end) >= now);
                    setStats(prev => ({ ...prev, acaraAktif: aktif.length }));
                }
            })
            .catch(() => null);
    }, []);

    const summary = dashboardData?.summary || {};
    const charts = dashboardData?.charts || {};
    const attendanceRate = clampPercent(summary.attendance_rate ?? stats.persentaseKeaktifan);

    const trendItems = (charts.attendance_trend_by_event || []).slice(-8);
    const trendMax = Math.max(...trendItems.map(item => Number(item.total_present || 0)), 1);

    const recentActivities = (dashboardData?.recent_attendances || []).map(a => ({
        id: a.attendance_id,
        title: `${a.name || "Anggota"} check-in ${a.event_title || "acara"}`,
        time: formatRelativeTime(a.checkin_time),
        tone: a.is_in_radius ? "bg-[#1f5e22]" : "bg-[#b40c16]",
        status: a.is_in_radius ? "Valid" : "Di luar radius",
    }));

    const presentCountDisplay = stats.total_valid_radius !== "-"
        ? formatNumber(stats.total_valid_radius)
        : "-";
    const absentCountDisplay = stats.total_invalid_radius !== "-"
        ? formatNumber(stats.total_invalid_radius)
        : "-";

    const summaryCards = [
        { label: "Total Anggota", value: formatNumber(stats.totalAnggota), help: "Terdaftar", icon: iconTotalAnggota, helperTone: "text-emerald-600" },
        { label: "Acara Aktif", value: formatNumber(stats.acaraAktif), help: "Aktif", icon: iconAcaraAktif, helperTone: "text-orange-500" },
        { label: "Hadir Hari Ini", value: formatNumber(stats.hadirHariIni), help: "Live", icon: iconLiveHadir, helperTone: "text-emerald-600" },
        { label: "Persentase Keaktifan", value: formatPercent(attendanceRate), help: "Goal: 95%", icon: iconPersentaseKeaktifan, helperTone: "text-emerald-700" },
    ];

    return (
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20" />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">Himpunan Mahasiswa Informatika<br />ITERA</p>
                    </div>
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = item.activePaths ? item.activePaths.includes(pathname) : pathname === item.to;
                            return (
                                <Link key={item.label} to={item.to}
                                    className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                                    <img src={item.icon} alt={item.label} className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4">
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-sm font-semibold text-white truncate">{userName}</p>
                            <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                            <button onClick={handleLogout} className="mt-3 text-[0.78rem] text-red-300 hover:text-red-200 transition flex items-center gap-1">⤷ Logout</button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen min-w-0">
                    {/* Mobile Header */}
                    <header className="flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                            <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">Logout</button>
                        </div>
                    </header>

                    {/* Desktop Topbar */}
                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Admin Dashboard</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{division}</span>
                            <div className="h-5 w-px bg-gray-200" />
                            <button className="text-gray-400 hover:text-gray-600 transition" aria-label="Notifikasi">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <img src={fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
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

                        <div className="grid gap-5 xl:grid-cols-[1.9fr_0.9fr]">
                            <div className="space-y-5">
                                {/* Participation Trend */}
                                <section className="rounded-[10px] bg-[#7bbd36] p-5 shadow-[0_8px_18px_rgba(15,23,42,0.1)]">
                                    <div className="flex items-center gap-3 text-white mb-10">
                                        <img src={iconGrafikTotal} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                        <h3 className="text-[1.2rem] font-semibold">Participation Trend</h3>
                                    </div>
                                    <div className="rounded-[8px] bg-white/10 p-4">
                                        <div className="h-[275px] rounded-[4px] bg-[#7bbd36] px-4 pb-4 pt-6">
                                            {trendItems.length > 0 ? (
                                                <div className="flex h-full items-end gap-3">
                                                    {trendItems.map((item, i) => {
                                                        const barHeight = Math.max(16, Math.round((Number(item.total_present || 0) / trendMax) * 100));
                                                        return (
                                                            <div key={item.event_id ?? i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                                                                <div className="flex w-full flex-1 items-end">
                                                                    <div className="w-full rounded-t-[6px] bg-white/85 shadow-sm transition-all"
                                                                        style={{ height: `${barHeight}%` }}
                                                                        title={`${item.title || ""}: ${formatNumber(item.total_present)} hadir`} />
                                                                </div>
                                                                <div className="w-full truncate text-center text-[0.68rem] font-semibold text-white/80">
                                                                    {formatShortDate(item.date_time)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-center">
                                                    <div>
                                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                                                            <svg className="h-6 w-6 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                                    {/* Attendance Status */}
                                    <section className="rounded-[10px] bg-[#9ccc75] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <img src={iconHadirHariIni} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                            <h3 className="text-[1.2rem] font-semibold text-white">Attendance Status</h3>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="relative h-[170px] w-[170px]">
                                                <div className="absolute inset-0 rotate-45 rounded-[12px] bg-[#42a40f]" />
                                                <div className="absolute inset-[14%] rotate-45 rounded-[12px] bg-[#b8dd9f]" />
                                                <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-[12px] bg-transparent text-center -rotate-45">
                                                    <p className="text-[1.8rem] font-extrabold leading-none text-slate-900">{formatPercent(attendanceRate)}</p>
                                                    <p className="mt-1 text-[0.85rem] font-medium text-white/90">Avg.</p>
                                                </div>
                                            </div>
                                            <div className="mt-6 w-full space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3 w-3 rounded-full bg-emerald-900 inline-block" />
                                                        <span className="text-white/90 text-sm">Present</span>
                                                    </div>
                                                    <span className="text-white font-bold">{presentCountDisplay}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
                                                        <span className="text-white/90 text-sm">Absent</span>
                                                    </div>
                                                    <span className="text-white font-bold">{absentCountDisplay}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* By Department */}
                                    <section className="rounded-[10px] bg-[#52b316] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <h3 className="text-[1.2rem] font-semibold text-white mb-6">By Department</h3>
                                        <div className="space-y-4">
                                            {departemenStats.length > 0 ? departemenStats.slice(0, 5).map((item) => (
                                                <div key={item.label}>
                                                    <div className="mb-1 flex items-center justify-between text-[0.85rem] font-medium text-white/95">
                                                        <span>{item.label}</span>
                                                        <span>{item.value}%</span>
                                                    </div>
                                                    <div className="h-[8px] rounded-full bg-white/15 overflow-hidden">
                                                        <div className="h-full rounded-full bg-white" style={{ width: `${item.value}%` }} />
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-white/70">Belum ada data departemen.</p>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <aside className="rounded-[10px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="text-[1.2rem] font-semibold text-slate-900">Recent Activity</h3>
                                    <Link to="/dashboard/laporan" className="text-[0.9rem] text-slate-500 hover:text-slate-900">View All</Link>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.length > 0 ? recentActivities.map((activity) => (
                                        <div key={activity.id} className="relative pl-12">
                                            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-slate-200" />
                                            <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-[10px] ${activity.tone} text-white shadow-sm`}>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-[0.92rem] leading-6 text-slate-800 font-semibold">{activity.title}</p>
                                            <p className="mt-0.5 text-[0.8rem] text-slate-400">{activity.time} · {activity.status}</p>
                                        </div>
                                    )) : (
                                        <div className="rounded-[10px] bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                            Belum ada aktivitas presensi.
                                        </div>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = item.activePaths ? item.activePaths.includes(pathname) : pathname === item.to;
                        return (
                            <Link key={item.label} to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white"}`}>
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
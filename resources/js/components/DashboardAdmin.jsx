import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
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
import fotoProfile from "../assets/fotoprofile.png";

// No hardcoded department fallback — use backend data or show empty state

const ACTIVITIES_FALLBACK = [
    { title: "Sistem berjalan normal.", time: "Baru saja", tone: "bg-[#a7bffc]", icon: "✓" },
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

    const [user, setUser] = React.useState(null);
    const [fotoUrl, setFotoUrl] = React.useState(null);
    const [stats, setStats] = React.useState({
        totalAnggota: "-",
        acaraAktif: "-",
        hadirHariIni: "-",
        persentaseKeaktifan: "-",
        total_valid_radius: "-",
        total_invalid_radius: "-",
    });
    const [recentActivities, setRecentActivities] = React.useState([]);
    const [auditLogs, setAuditLogs] = React.useState([]);
    const [departemenStats, setDepartemenStats] = React.useState([]);

    React.useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        };

        // Fetch user and profile photo
        fetch("/api/me", { headers })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : null);
            })
            .catch(err => console.error("Gagal fetch user:", err));

        // Fetch dashboard summary from backend
        fetch("/api/dashboard/attendance-statistics", { headers })
            .then(res => res.json())
            .then(data => {
                if (data?.summary) {
                    setStats(prev => ({
                        ...prev,
                        totalAnggota: data.summary.total_members ?? prev.totalAnggota,
                        acaraAktif: data.summary.total_events ?? prev.acaraAktif,
                        hadirHariIni: data.summary.total_attendances ?? prev.hadirHariIni,
                        persentaseKeaktifan: data.summary.attendance_rate ?? prev.persentaseKeaktifan,
                        total_valid_radius: data.summary.total_valid_radius ?? prev.total_valid_radius,
                        total_invalid_radius: data.summary.total_invalid_radius ?? prev.total_invalid_radius,
                    }));
                }

                if (Array.isArray(data?.charts?.attendance_by_department) && data.charts.attendance_by_department.length > 0) {
                    // Backend returns counts per department (total_present).
                    // Convert counts -> percentages so the UI (which expects % values)
                    // and progress bars render correctly.
                    const counts = data.charts.attendance_by_department.map(item => ({
                        label: item.departemen || item.Departemen || "Lainnya",
                        count: Number(item.total_present) || 0,
                    }));
                    const totalCount = counts.reduce((s, it) => s + it.count, 0) || 1;
                    const pct = counts.map(it => ({
                        label: it.label,
                        value: Math.round((it.count / totalCount) * 100),
                    }));
                    setDepartemenStats(pct);
                }

                if (Array.isArray(data?.recent_attendances) && data.recent_attendances.length > 0) {
                    setRecentActivities(data.recent_attendances.map(item => ({
                        title: `${item.name || "Anggota"} hadir di ${item.event_title || "acara"}`,
                        time: new Date(item.checkin_time).toLocaleString("id-ID"),
                        tone: item.is_in_radius ? "bg-[#a7bffc]" : "bg-red-100",
                        icon: item.is_in_radius ? "✓" : "✕",
                    })));
                }
            })
            .catch(err => console.error("Gagal fetch dashboard stats:", err));

        // Fetch total anggota untuk detail departemen dan fallback
        fetch("/api/members", { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStats(prev => ({ ...prev, totalAnggota: data.length }));

                    const deptMap = {};
                    data.forEach(m => {
                        const dept = m.member_profile?.departemen || "Lainnya";
                        deptMap[dept] = (deptMap[dept] || 0) + 1;
                    });
                    const total = data.length || 1;
                    const deptStats = Object.entries(deptMap).map(([label, count]) => ({
                        label,
                        value: Math.round((count / total) * 100),
                    }));
                    setDepartemenStats(deptStats);
                }
            })
            .catch(err => console.error("Gagal fetch members:", err));

        // Fetch events aktif untuk card acara aktif
        fetch("/api/events", { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const now = new Date();
                    const aktif = data.filter(e => {
                        const end = new Date(e.attendance_window_end);
                        return end >= now;
                    });
                    setStats(prev => ({ ...prev, acaraAktif: aktif.length }));
                }
            })
            .catch(err => console.error("Gagal fetch events:", err));

        fetch("/api/audit-logs", { headers })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) setAuditLogs(data.slice(0, 5));
            })
            .catch(() => setAuditLogs([]));

    }, []);

    const userName = user?.name || localStorage.getItem("name") || "Admin";
    const nim = user?.nim || "-";
    const division = user?.profile?.departemen || user?.profile?.Departemen || "Admin";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const summaryCards = [
        {
            label: "Total Anggota",
            value: String(stats.totalAnggota),
            help: "Terdaftar",
            icon: iconTotalAnggota,
            helperTone: "text-emerald-600",
        },
        {
            label: "Acara Aktif",
            value: String(stats.acaraAktif),
            help: "This Month",
            icon: iconAcaraAktif,
            helperTone: "text-orange-500",
        },
        {
            label: "Hadir Hari Ini",
            value: String(stats.hadirHariIni),
            help: "Live",
            icon: iconLiveHadir,
            helperTone: "text-emerald-600",
        },
        {
            label: "Persentase Keaktifan",
            value: String(stats.persentaseKeaktifan),
            help: "Goal: 95%",
            icon: iconPersentaseKeaktifan,
            helperTone: "text-emerald-700",
        },
    ];

    const activityFeed = recentActivities.length > 0
        ? recentActivities
        : auditLogs.length > 0
            ? auditLogs.map(log => ({
                title: `${log.actor?.name || "Admin"} melakukan ${log.action} pada ${log.target_type}`,
                time: new Date(log.created_at).toLocaleString("id-ID"),
                tone: "bg-[#a7bffc]",
                icon: log.action === "delete" ? "🗑" : log.action === "create" ? "✚" : "✎",
            }))
            : ACTIVITIES_FALLBACK;

    const depts = departemenStats;

    const attendanceDisplay = stats.persentaseKeaktifan && stats.persentaseKeaktifan !== "-"
        ? `${Math.round(Number(stats.persentaseKeaktifan))}%`
        : "-";

    const presentCountDisplay = (stats.total_valid_radius !== undefined && stats.total_valid_radius !== null && stats.total_valid_radius !== "-")
        ? new Intl.NumberFormat('id-ID').format(Number(stats.total_valid_radius))
        : (stats.total_valid_radius ?? '-');

    const absentCountDisplay = (stats.total_invalid_radius !== undefined && stats.total_invalid_radius !== null && stats.total_invalid_radius !== "-")
        ? new Intl.NumberFormat('id-ID').format(Number(stats.total_invalid_radius))
        : (stats.total_invalid_radius ?? '-');

    return (
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
            <div className="min-h-screen flex">
                {/* ════ SIDEBAR ════ */}
                <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20" />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">
                            Himpunan Mahasiswa Informatika<br />ITERA
                        </p>
                    </div>
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link key={item.label} to={item.to}
                                    className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${
                                        isActive
                                            ? "bg-white/15 text-white"
                                            : "text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}>
                                    <img src={item.icon} alt={item.label} className="h-5 w-5 shrink-0 object-contain brightness-0 invert opacity-95" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    {/* Sidebar bawah — konsisten dengan dashboard anggota */}
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

                <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen min-w-0 relative">
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
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">
                                {division}
                            </span>
                            <div className="h-5 w-px bg-gray-200" />
                            <button className="text-gray-400 hover:text-gray-600 transition" aria-label="Notifikasi">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <img src={fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-32 md:pb-10">
                        {/* Summary Cards */}
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

                        <div className="grid gap-5 xl:grid-cols-[1.9fr_0.9fr]">
                            <div className="space-y-5">
                                {/* Participation Trend */}
                                <section className="rounded-[10px] bg-[#7bbd36] p-5 shadow-[0_8px_18px_rgba(15,23,42,0.1)]">
                                    <div className="flex items-start justify-between gap-4 text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={iconGrafikTotal} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                            <h3 className="text-[1.2rem] font-semibold">Participation Trend</h3>
                                        </div>
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
                                    {/* Attendance Status */}
                                    <section className="rounded-[10px] bg-[#9ccc75] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <div className="flex items-center gap-3">
                                            <img src={iconHadirHariIni} alt="" className="h-5 w-5 object-contain brightness-0 invert" />
                                            <h3 className="text-[1.2rem] font-semibold text-white">Attendance Status</h3>
                                        </div>
                                        <div className="mt-8 flex flex-col items-center">
                                            <div className="flex justify-center">
                                                <div className="relative h-50 w-50 mt-5">
                                                    <div className="absolute inset-0 rotate-45 rounded-[16px] bg-[#2e9a13]" />
                                                    <div className="absolute inset-[12%] rotate-45 rounded-[12px] bg-[#d7f0c9]" />
                                                    <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-[10px] bg-transparent text-center -rotate-45">
                                                        <p className="text-[2.6rem] font-extrabold leading-none text-emerald-900">{attendanceDisplay}</p>
                                                        <p className="mt-1 text-[0.95rem] font-medium text-white/90">Avg.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-14 w-full max-w-xs">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-3 w-3 rounded-full bg-emerald-900 inline-block" />
                                                        <span className="text-white/90">Present</span>
                                                    </div>
                                                    <div className="text-white font-bold text-lg">{presentCountDisplay}</div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
                                                        <span className="text-white/90">Absent</span>
                                                    </div>
                                                    <div className="text-white font-bold text-lg">{absentCountDisplay}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* By Department */}
                                    <section className="rounded-[10px] bg-[#52b316] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                        <h3 className="text-[1.2rem] font-semibold text-white">By Department</h3>
                                        <div className="mt-6 space-y-4">
                                            {depts && depts.length > 0 ? (
                                                depts.map((item) => (
                                                    <div key={item.label}>
                                                        <div className="mb-1 flex items-center justify-between text-[0.85rem] font-medium text-white/95">
                                                            <span>{item.label}</span>
                                                            <span>{item.value}%</span>
                                                        </div>
                                                        <div className="h-[8px] rounded-full bg-white/15 overflow-hidden">
                                                            <div className="h-full rounded-full bg-white" style={{ width: `${item.value}%` }} />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center text-sm text-white/80">Belum ada data departemen.</div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Recent Activity dari audit logs */}
                            <aside className="rounded-[10px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="text-[1.2rem] font-semibold text-slate-900">Recent Activity</h3>
                                    <Link to="/dashboard/laporan" className="text-[0.9rem] text-slate-700 hover:text-slate-900">View All</Link>
                                </div>
                                <div className="space-y-4">
                                    {activityFeed.map((activity, i) => (
                                        <div key={i} className="relative pl-12">
                                            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-slate-300" />
                                            <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-[10px] ${activity.tone} text-white text-sm shadow-sm`}>
                                                {activity.icon}
                                            </div>
                                            <p className="text-[0.95rem] leading-6 text-slate-800 font-semibold">{activity.title}</p>
                                            <p className="mt-1 text-[0.82rem] text-slate-500">{activity.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.to;
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
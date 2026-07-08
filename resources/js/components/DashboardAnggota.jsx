import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import lockIcon from "../assets/lock.png";
import sqanQr from "../assets/sqanqr.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";
import { calculateAttendanceSummary } from "../utils/attendanceHistory";
import NotificationBell from "./NotificationBell";
import BottomBar from "./buttombar";



export default function DashboardAnggota() {
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

    const [user, setUser] = React.useState(null);
    const [historyData, setHistoryData] = React.useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = React.useState(true);
    const [fotoUrl, setFotoUrl] = React.useState(null);

React.useEffect(() => {
    const token = localStorage.getItem("auth_token");

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
    };

    fetch("/api/me", {
        headers
    })
    .then(res => res.json())
    .then(data => {
    setUser(data);
    setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : null);
    })
    .catch(err => console.error("Gagal fetch user:", err));

    fetch("/api/attendances/me", {
        headers: {
            ...headers,
        }
    })
    .then(res => res.json())
    .then(data => setHistoryData(Array.isArray(data) ? data : []))
    .catch(err => console.error("Gagal fetch history:", err))
    .finally(() => setIsHistoryLoading(false));
}, []);

const name = user?.name || localStorage.getItem("name") || "Anggota HMIF";
const nim = user?.nim || "-";
const division = user?.profile?.departemen || user?.profile?.Departemen || "-";
const statusKeanggotaan = user?.profile?.status_keanggotaan || "Anggota Muda";
const statusLabel = statusKeanggotaan.toLowerCase().startsWith("anggota")
    ? statusKeanggotaan
    : `Anggota ${statusKeanggotaan}`;
const firstName = name.split(" ")[0];
const attendanceSummary = React.useMemo(() => calculateAttendanceSummary(historyData), [historyData]);
const recentActivities = attendanceSummary.normalized.slice(0, 3);
const attendance = attendanceSummary.rate;
const role = localStorage.getItem("role");
const isAdminView = role === "admin" || role === "super_admin";
const attendanceLabel =
    attendanceSummary.total === 0
        ? "Belum ada data"
        : attendance >= 85
            ? "Excellent"
            : attendance >= 70
                ? "Good"
                : "Needs Review";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    /* ─── NAV ITEMS ─── */
    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard/member" },
        { label: "History", icon: iconHistory, to: "/dashboard/history" },
        { label: "Profile", icon: iconProfile, to: "/dashboard/profile" },
    ];

    return (
        <div className="min-h-screen bg-[#f0f2ee] font-sans flex">
            <Sidebar
                role="anggota"
                userName={name}
                nim={nim}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebarCollapse={toggleSidebarCollapse}
            />

            {/* ─── MAIN AREA ─── */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? "md:ml-[76px]" : "md:ml-[240px]"}`}>

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
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
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
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

                {/* Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                    <h2 className="text-[1.05rem] font-bold text-gray-800">Member Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">
                            {division}
                        </span>
                        <div className="h-5 w-px bg-gray-200" />
                        <NotificationBell />
                        <img src={fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                    </div>
                </header>

                {/* Ã¢â€â‚¬Ã¢â€â‚¬ PAGE CONTENT Ã¢â€â‚¬Ã¢â€â‚¬ */}
                <main className="flex-1 px-5 py-7 md:px-8 md:py-8 pb-28 md:pb-10">

                    {/* Welcome */}
                    <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-gray-400 mb-1">
                        Member Dashboard
                    </p>
                    <h1 className="text-[1.85rem] md:text-[2.1rem] font-extrabold text-gray-900 mb-6">
                        Welcome, {firstName}.
                    </h1>

                    {/* ROW 1 — Member Card + QR Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

                        {/* Member Status Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 md:col-span-2">
                            {/* Photo */}
                            {!user ? (
                                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0 shadow-sm border border-slate-100" />
                            ) : (
                                <img
                                    src={fotoUrl || fotoProfile}
                                    alt="Profile"
                                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover shadow-sm border border-slate-100 flex-shrink-0"
                                />
                            )}

                            {/* Details */}
                            <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
                                <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
                                    Member Status
                                </p>
                                {!user ? (
                                    <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse mb-3" />
                                ) : (
                                    <span className="inline-block bg-yellow-400 text-yellow-900 text-[0.7rem] font-bold px-3 py-0.5 rounded-full mb-3">
                                        {statusLabel}
                                    </span>
                                )}

                                {/* Name & Division */}
                                {!user ? (
                                    <div className="space-y-2 mb-4 w-full flex flex-col items-center sm:items-start animate-pulse">
                                        <div className="h-6 w-48 bg-gray-200 rounded" />
                                        <div className="h-4 w-32 bg-gray-200 rounded" />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">{name}</h3>
                                        <p className="text-sm text-gray-400 font-semibold mb-4">{division}</p>
                                    </>
                                )}

                                {/* NIM Tag */}
                                <div className="flex w-full max-w-[240px] items-center justify-between rounded-xl bg-[#1c5e22] px-4 py-2.5">
                                    <div>
                                        <p className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-white/70 leading-none mb-0.5">NIM</p>
                                        {!user ? (
                                            <div className="h-4 w-28 bg-white/20 rounded animate-pulse mt-1" />
                                        ) : (
                                            <p className="text-[0.95rem] font-bold text-white tracking-widest leading-none mt-1">{nim}</p>
                                        )}
                                    </div>
                                    <img src={lockIcon} alt="lock" className="h-4.5 w-4.5 object-contain brightness-[10] opacity-60" />
                                </div>
                            </div>
                        </div>

                        {/* Scan QR Card */}
                        <button
                            onClick={() => navigate(isAdminView ? "/scan?mode=user" : "/scan")}
                            className="flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white text-center w-full cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200 md:col-span-1"
                            style={{ background: "linear-gradient(160deg, #3db53d 0%, #228b22 100%)" }}
                        >
                            <img src={sqanQr} alt="QR" className="h-12 w-12 object-contain brightness-[10]" />
                            <p className="text-[1rem] font-bold leading-snug">Tampilkan QR Presensi</p>
                            <p className="text-[0.75rem] text-white/75 leading-snug hidden md:block">
                                Tunjukkan QR ini ke admin saat acara
                            </p>
                        </button>
                    </div>

                    {/* ROW 2 — Recent Activity + Right Column */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm md:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
                                <Link to="/dashboard/history" className="text-sm font-semibold text-green-600 hover:text-green-700 transition">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {isHistoryLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((n) => (
                                            <div key={n} className="flex items-center justify-between py-3 animate-pulse">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100" />
                                                    <div className="space-y-2">
                                                        <div className="h-4.5 w-32 rounded bg-gray-100" />
                                                        <div className="h-3 w-20 rounded bg-gray-100" />
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1.5 flex flex-col items-end">
                                                    <div className="h-4.5 w-16 rounded bg-gray-100" />
                                                    <div className="h-3 w-12 rounded bg-gray-100" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : recentActivities.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-gray-400">Belum ada riwayat kehadiran.</div>
                                ) : recentActivities.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.status === "hadir" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.4}
                                                        d={a.status === "hadir" ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                                                <p className="text-[0.75rem] text-green-600/80">{a.location}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-3">
                                            <p className="text-sm font-bold text-gray-800">{a.date}</p>
                                            <p className="text-[0.75rem] text-gray-400 mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-4 md:col-span-1">

                            {/* Overall Attendance */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-7">
                                    Overall Attendance
                                </p>
                                <div className="flex items-baseline gap-2 mb-7">
                                    <span className="text-[2.6rem] font-extrabold text-green-600 leading-none">
                                        {attendance}%
                                    </span>
                                    <span className="text-sm text-gray-400 font-medium">{attendanceLabel}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-2 rounded-full bg-green-500 transition-all duration-700"
                                        style={{ width: `${attendance}%` }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <BottomBar items={navItems.map(item => ({ label: item.label, href: item.to }))} activeHref="/dashboard/member" />
        </div>
    );
}

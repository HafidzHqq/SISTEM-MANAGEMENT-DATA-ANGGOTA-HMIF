import React from "react";
import { Link, useNavigate } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import lockIcon from "../assets/lock.png";
import sqanQr from "../assets/sqanqr.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";
import { calculateAttendanceSummary } from "../utils/attendanceHistory";



export default function DashboardAnggota() {
    const navigate = useNavigate();

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
        { 
            label: "Dashboard", 
            icon: iconDashboard, 
            to: (role === "admin" || role === "super_admin") ? "/dashboard/member" : "/dashboard" 
        },
        { label: "History", icon: iconHistory, to: "/dashboard/history" },
        { label: "Profile", icon: iconProfile, to: "/dashboard/profile" },
    ];

    if (role === "admin") {
        navItems.push({ label: "Admin Panel", icon: iconDashboard, to: "/dashboard/admin-overview" });
    } else if (role === "super_admin") {
        navItems.push({ label: "Super Admin Panel", icon: iconDashboard, to: "/dashboard" });
    }

    return (
        <div className="min-h-screen bg-[#f0f2ee] font-sans flex">
            {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â DESKTOP SIDEBAR Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
            <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
                {/* Logo */}
                <div className="flex flex-col items-center pt-8 pb-5 px-4">
                    <img src={hmifLogo} alt="HMIF" className="h-[72px] w-[72px] rounded-full object-contain border-4 border-white/20" />
                    <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                    <p className="text-[0.62rem] text-white/55 text-center leading-snug mt-0.5">
                        Himpunan Mahasiswa Informatika ITERA
                    </p>
                </div>

                <hr className="border-white/10 mx-4" />

                {/* Navigation */}
                <nav className="flex-1 px-3 pt-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = window.location.pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${isActive
                                    ? "bg-white/15 text-white"
                                    : "text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <img src={item.icon} alt="" className="h-[18px] w-[18px] object-contain brightness-[10] opacity-90" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-4">
                    <div className="bg-white/10 rounded-2xl px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                        <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                        <button
                            onClick={handleLogout}
                            className="mt-3 text-[0.78rem] text-red-300 hover:text-red-200 transition flex items-center gap-1"
                        >
                            Ã¢Â¤Â· Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â MAIN AREA Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
            <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                        <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition active:scale-95"
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
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
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

                    {/* ROW 1 Ã¢â‚¬â€ Member Card + QR Card */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] xl:grid-cols-[1fr_450px] gap-4 mb-5">

                        {/* Member Status Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm relative text-center md:text-left">
                            {/* Photo Ã¢â‚¬â€ pinned to top-right corner */}
                            <img
                                src={fotoUrl || fotoProfile}
                                alt="Profile"
                                className="mx-auto mb-4 h-24 w-24 rounded-2xl object-cover shadow md:absolute md:right-4 md:top-4 md:mx-0 md:mb-0 md:h-14 md:w-14 md:rounded-xl"
                            />

                            {/* Label + Badge */}
                            <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
                                Member Status
                            </p>
                            <span className="inline-block bg-yellow-400 text-yellow-900 text-[0.7rem] font-bold px-3 py-0.5 rounded-full mb-4">
                                {statusLabel}
                            </span>

                            {/* Name & Division */}
                            <h3 className="text-lg font-extrabold text-gray-900 md:pr-16">{name}</h3>
                            <p className="text-sm text-gray-400 mt-0.5 mb-4">{division}</p>

                            {/* NIM Ã¢â‚¬â€ full width */}
                            <div className="mx-auto flex max-w-[250px] items-center justify-between rounded-xl bg-[#1c5e22] px-4 py-3 text-left md:mx-0">
                                <div>
                                    <p className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-white">NIM</p>
                                    <p className="text-[1rem] font-bold text-white tracking-widest">{nim}</p>
                                </div>
                                <img src={lockIcon} alt="lock" className="h-5 w-5 object-contain brightness-[10] opacity-60" />
                            </div>
                        </div>

                        {/* Scan QR Card */}
                        <button
                            onClick={() => navigate(isAdminView ? "/scan?mode=user" : "/scan")}
                            className="flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-white text-center w-full cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200"
                            style={{ background: "linear-gradient(160deg, #3db53d 0%, #228b22 100%)" }}
                        >
                            <img src={sqanQr} alt="QR" className="h-12 w-12 object-contain brightness-[10]" />
                            <p className="text-[1rem] font-bold leading-snug">Tampilkan QR Presensi</p>
                            <p className="text-[0.75rem] text-white/75 leading-snug hidden md:block">
                                Tunjukkan QR ini ke admin saat acara
                            </p>
                        </button>
                    </div>

                    {/* ROW 2 Ã¢â‚¬â€ Recent Activity + Right Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_600px] gap-4">

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
                                <Link to="/dashboard/history" className="text-sm font-semibold text-green-600 hover:text-green-700 transition">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {isHistoryLoading ? (
                                    <div className="py-8 text-center text-sm text-gray-400">Memuat riwayat kehadiran...</div>
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
                        <div className="flex flex-col gap-4">

                            {/* Overall Attendance */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
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

            {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â MOBILE BOTTOM NAV Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1c5e22] flex z-50">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
                    >
                        <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-[10]" />
                        <span className="text-[0.58rem] font-bold tracking-[0.12em] text-white/80 uppercase">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}

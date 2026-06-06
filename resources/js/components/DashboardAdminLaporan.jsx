import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard/admin-overview" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const PER_PAGE = 5;

const csvEscape = (v) => {
    const s = String(v ?? "");
    const safe = /^[=+\-@]/.test(s.trimStart()) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const todayStr = () => new Date().toISOString().split("T")[0];
const monthStartStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

export default function DashboardAdminLaporan() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    // User / profile
    const [user, setUser] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [userDivision, setUserDivision] = useState("Admin");
    const userName = user?.name || localStorage.getItem("name") || "Admin User";
    const nim = user?.nim || localStorage.getItem("nim") || "-";

    // Data dari API
    const [attendances, setAttendances] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Filter state
    const [filterEventId, setFilterEventId] = useState("semua");
    const [filterDivisi, setFilterDivisi] = useState("Semua Divisi");
    const [dateStart, setDateStart] = useState(monthStartStr());
    const [dateEnd, setDateEnd] = useState(todayStr());
    const [page, setPage] = useState(1);

    const handleLogout = () => {
        ["auth_token", "role", "name", "nim"].forEach(k => localStorage.removeItem(k));
        navigate("/login");
    };

    // Fetch user profile
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        fetch("/api/me", { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : null);
                setUserDivision(data?.profile?.departemen || data?.profile?.Departemen || "Admin");
            })
            .catch(() => null);
    }, []);

    // Fetch events untuk dropdown
    useEffect(() => {
        fetch("/api/events", { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
                setEvents(list);
            })
            .catch(() => setEvents([]));
    }, []);

    // Fetch attendances — endpoint: GET /api/events/{eventId}/attendances
    useEffect(() => {
        if (events.length === 0) return;

        setIsLoading(true);
        setError("");

        const fetchOne = (eventId) =>
            fetch(`/api/events/${eventId}/attendances`, { headers: getAuthHeaders() })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(data => Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [])
                .catch(() => []);

        const targets = filterEventId === "semua"
            ? events.map(e => e.event_id)
            : [filterEventId];

        Promise.all(targets.map(fetchOne))
            .then(results => {
                const all = results.flat();
                setAttendances(all);
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));

    }, [filterEventId, events]);

    useEffect(() => { setPage(1); }, [filterEventId, filterDivisi, dateStart, dateEnd]);

    // Normalisasi & filter di FE (divisi + date range)
    const rows = useMemo(() => {
        return attendances
            .map(r => ({
                id: r.member?.nim ?? r.nim ?? r.user?.nim ?? "-",
                nama: r.member?.name ?? r.user?.name ?? r.nama ?? "-",
                divisi: r.member?.departemen ?? r.member?.Departemen ?? r.user?.profile?.departemen ?? r.divisi ?? "-",
                acara: r.event?.title ?? events.find(e => e.event_id === r.event_id)?.title ?? "-",
                acaraDate: r.event?.date_time ?? events.find(e => e.event_id === r.event_id)?.date_time ?? null,
                waktu: r.checked_in_at
                    ? new Date(r.checked_in_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "-",
                status: (r.status === "present" || r.status === "HADIR") ? "HADIR" : "TIDAK HADIR",
                rawDate: r.checked_in_at
                    ? r.checked_in_at.split("T")[0]
                    : (r.event?.date_time ? r.event.date_time.split("T")[0] : null),
            }))
            .filter(r => {
                const matchDivisi = filterDivisi === "Semua Divisi" || r.divisi === filterDivisi;
                const matchDateStart = !dateStart || !r.rawDate || r.rawDate >= dateStart;
                const matchDateEnd = !dateEnd || !r.rawDate || r.rawDate <= dateEnd;
                return matchDivisi && matchDateStart && matchDateEnd;
            });
    }, [attendances, filterDivisi, dateStart, dateEnd, events]);

    // Divisi unik dari data
    const divisions = useMemo(() => {
        const s = new Set(attendances.map(r =>
            r.member?.departemen ?? r.member?.Departemen ?? r.user?.profile?.departemen ?? r.divisi
        ).filter(Boolean));
        return [...s].sort();
    }, [attendances]);

    const totalHadir = rows.filter(r => r.status === "HADIR").length;
    const totalTidak = rows.filter(r => r.status === "TIDAK HADIR").length;
    const persen = rows.length > 0 ? ((totalHadir / rows.length) * 100).toFixed(1) : "0.0";
    const persenInt = Math.round(Number(persen));

    const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    // Export — pakai endpoint BE langsung kalau satu event, fallback CSV manual kalau semua
    const handleExportCsv = () => {
        if (filterEventId !== "semua") {
            window.open(`/api/events/${filterEventId}/attendances/export-csv`, "_blank");
            return;
        }
        // Export manual dari data yang sudah di-fetch
        const h = ["ID Anggota", "Nama Lengkap", "Divisi", "Acara", "Waktu Presensi", "Status"];
        const lines = [h.map(csvEscape).join(","), ...rows.map(r =>
            [r.id, r.nama, r.divisi, r.acara, r.waktu, r.status].map(csvEscape).join(",")
        )];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "laporan-kehadiran.csv";
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    // SVG circular progress
    const radius = 38, stroke = 6, circ = 2 * Math.PI * radius;
    const offset = circ - (persenInt / 100) * circ;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#e7f5e5] font-sans text-gray-900">
            <div className="min-h-screen flex">

                {/* SIDEBAR */}
                <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20" />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">Himpunan Mahasiswa Informatika<br />ITERA</p>
                    </div>
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
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

                <div className="flex min-w-0 flex-1 flex-col md:ml-[220px]">

                    {/* TOPBAR DESKTOP */}
                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Laporan</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{userDivision}</span>
                            <div className="h-5 w-px bg-gray-200" />
                            <button className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <img src={fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                        </div>
                    </header>

                    {/* TOPBAR MOBILE */}
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                            <span className="text-sm font-bold text-slate-800">HMIF ITERA</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">Logout</button>
                    </header>

                    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7 pb-28 md:pb-10">

                        {/* Title + Export */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-[2.25rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Laporan</h1>
                                <p className="mt-1 text-[1rem] text-slate-600">Analisis kehadiran anggota HMIF secara komprehensif.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                                <button onClick={handleExportCsv} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Export CSV
                                </button>
                                <button onClick={handleExportCsv} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f7a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#186322]">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Export Excel
                                </button>
                            </div>
                        </div>

                        {/* Top Row: Filters + Stats */}
                        <div className="grid gap-5 xl:grid-cols-[1fr_auto] mb-6">
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    <h3 className="text-lg font-bold text-slate-800">Parameter Laporan</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {/* Filter Acara */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pilih Acara</label>
                                        <select value={filterEventId} onChange={(e) => setFilterEventId(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                                            <option value="semua">Semua Acara</option>
                                            {events.map(ev => (
                                                <option key={ev.event_id} value={ev.event_id}>{ev.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Filter Divisi */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Filter Divisi</label>
                                        <select value={filterDivisi} onChange={(e) => setFilterDivisi(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                                            <option value="Semua Divisi">Semua Divisi</option>
                                            {divisions.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date Range</label>
                                        <div className="flex items-center justify-between gap-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-400">
                                            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-slate-700 outline-none w-full min-w-0 focus:ring-0 cursor-pointer" />
                                            <span className="text-slate-400 text-xs font-medium shrink-0">-</span>
                                            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-slate-700 outline-none w-full min-w-0 focus:ring-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 xl:w-[320px] w-full">
                                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Total Hadir</span>
                                    </div>
                                    <p className="text-[2rem] font-extrabold text-slate-900 leading-none">
                                        {isLoading ? "—" : totalHadir.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                        </div>
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Tidak Hadir</span>
                                    </div>
                                    <p className="text-[2rem] font-extrabold text-slate-900 leading-none">
                                        {isLoading ? "—" : totalTidak.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#1f7a2c] p-5 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/70">Persentase Kehadiran</p>
                                        <p className="text-[2.2rem] font-extrabold text-white leading-none mt-1">
                                            {isLoading ? "—" : `${persen}%`}
                                        </p>
                                    </div>
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <svg width="80" height="80" viewBox="0 0 90 90">
                                            <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
                                            <circle cx="45" cy="45" r={radius} fill="none" stroke="#f5bf17" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-white">{persenInt}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800">Pratinjau Data</h3>
                                <span className="text-sm text-slate-500">
                                    {isLoading ? "Memuat..." : `Menampilkan ${paginated.length} dari ${rows.length.toLocaleString()} entri`}
                                </span>
                            </div>

                            {error && (
                                <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-[#fafafa] text-left text-xs uppercase tracking-[0.1em] text-slate-500">
                                            <th className="py-4 px-6">ID Anggota</th>
                                            <th className="py-4 px-4">Nama Lengkap</th>
                                            <th className="py-4 px-4">Divisi</th>
                                            <th className="py-4 px-4">Acara</th>
                                            <th className="py-4 px-4">Waktu Presensi</th>
                                            <th className="py-4 px-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Memuat data...</td></tr>
                                        ) : paginated.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Tidak ada data yang cocok dengan filter.</td></tr>
                                        ) : paginated.map((row, idx) => (
                                            <tr key={`${row.id}-${idx}`} className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                                                <td className="py-5 px-6 text-slate-600">{row.id}</td>
                                                <td className="py-5 px-4 font-semibold text-slate-800">{row.nama}</td>
                                                <td className="py-5 px-4 text-slate-600">{row.divisi}</td>
                                                <td className="py-5 px-4 text-slate-600">{row.acara}</td>
                                                <td className="py-5 px-4 text-slate-600">{row.waktu}</td>
                                                <td className="py-5 px-4 text-center">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide ${row.status === "HADIR" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!isLoading && totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 px-6 py-5 border-t border-slate-100">
                                    <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={safePage === 1} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" /></svg>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setPage(p)} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${safePage === p ? "bg-[#1f5e22] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
                                    ))}
                                    <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={safePage === totalPages} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#185b21] md:hidden">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link key={item.label} to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white"}`}>
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
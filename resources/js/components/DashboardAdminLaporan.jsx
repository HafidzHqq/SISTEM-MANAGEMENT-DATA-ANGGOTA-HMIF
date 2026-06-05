import React, { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";
import iconTotalAnggota from "../assets/assets dash admin/Icon-totalanggota.png";

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const SAMPLE_DATA = [
    { id: "HMIF-2024-001", nama: "Aditya Pratama", divisi: "Litbang", acara: "Rapat Rutin Mingguan", waktu: "14 Mar 2024, 18:05", status: "HADIR", date: "2024-03-14" },
    { id: "HMIF-2024-042", nama: "Siti Aminah", divisi: "Humas", acara: "Rapat Rutin Mingguan", waktu: "14 Mar 2024, 18:12", status: "HADIR", date: "2024-03-14" },
    { id: "HMIF-2024-115", nama: "Budi Santoso", divisi: "Medinfo", acara: "Rapat Rutin Mingguan", waktu: "-", status: "TIDAK HADIR", date: "2024-03-14" },
    { id: "HMIF-2024-009", nama: "Rina Wijaya", divisi: "Litbang", acara: "Seminar Teknologi", waktu: "12 Mar 2024, 09:15", status: "HADIR", date: "2024-03-12" },
    { id: "HMIF-2024-088", nama: "Fajar Nugraha", divisi: "Internal", acara: "Seminar Teknologi", waktu: "-", status: "TIDAK HADIR", date: "2024-03-12" },
    { id: "HMIF-2024-023", nama: "Dian Permata", divisi: "Humas", acara: "Workshop Design", waktu: "10 Mar 2024, 10:00", status: "HADIR", date: "2024-03-10" },
    { id: "HMIF-2024-067", nama: "Eko Prasetyo", divisi: "Litbang", acara: "Workshop Design", waktu: "10 Mar 2024, 10:05", status: "HADIR", date: "2024-03-10" },
    { id: "HMIF-2024-034", nama: "Fitri Handayani", divisi: "Medinfo", acara: "Rapat Rutin Mingguan", waktu: "-", status: "TIDAK HADIR", date: "2024-03-14" },
    { id: "HMIF-2024-099", nama: "Galih Ramadhan", divisi: "Internal", acara: "Seminar Teknologi", waktu: "12 Mar 2024, 09:20", status: "HADIR", date: "2024-03-12" },
    { id: "HMIF-2024-012", nama: "Hana Salsabila", divisi: "Humas", acara: "Rapat Rutin Mingguan", waktu: "14 Mar 2024, 18:20", status: "HADIR", date: "2024-03-14" },
];

const PER_PAGE = 5;

const csvEscape = (v) => {
    const s = String(v ?? "");
    const safe = /^[=+\-@]/.test(s.trimStart()) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
};

export default function DashboardAdminLaporan() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const userName = localStorage.getItem("name") || "Admin User";
    const userEmail = localStorage.getItem("nim") || "admin@hmif.com";

    const [acara, setAcara] = useState("Semua Acara");
    const [divisi, setDivisi] = useState("Semua Divisi");
    const [dateRange, setDateRange] = useState("2024-01-01");
    const [dateEnd, setDateEnd] = useState("2024-03-31");
    const [page, setPage] = useState(1);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    const filtered = useMemo(() => {
        return SAMPLE_DATA.filter((r) => {
            const ma = acara === "Semua Acara" || r.acara === acara;
            const md = divisi === "Semua Divisi" || r.divisi === divisi;
            const withinDate = (!dateRange || r.date >= dateRange) && (!dateEnd || r.date <= dateEnd);
            return ma && md && withinDate;
        });
    }, [acara, divisi, dateRange, dateEnd]);

    const totalHadir = filtered.filter((r) => r.status === "HADIR").length;
    const totalTidak = filtered.filter((r) => r.status === "TIDAK HADIR").length;
    const persen = filtered.length > 0 ? ((totalHadir / filtered.length) * 100).toFixed(1) : "0.0";
    const persenInt = Math.round(Number(persen));

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    React.useEffect(() => { setPage(1); }, [acara, divisi, dateRange, dateEnd]);

    const exportCsv = () => {
        const h = ["ID Anggota", "Nama Lengkap", "Divisi", "Acara", "Waktu Presensi", "Status"];
        const lines = [h.map(csvEscape).join(","), ...filtered.map((r) => [r.id, r.nama, r.divisi, r.acara, r.waktu, r.status].map(csvEscape).join(","))];
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "laporan-kehadiran.csv";
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const exportExcel = () => { exportCsv(); };

    const formatDate = (d) => {
        const dt = new Date(d);
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return `${months[dt.getMonth()]} ${String(dt.getDate()).padStart(2,"0")}, ${dt.getFullYear()}`;
    };

    // SVG circular progress
    const radius = 38, stroke = 6, circ = 2 * Math.PI * radius;
    const offset = circ - (persenInt / 100) * circ;

    return (
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
            <div className="min-h-screen flex">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col w-[252px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20" />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">Himpunan Mahasiswa Informatika<br />ITERA</p>
                    </div>
                    <nav className="flex-1 px-4 pt-2 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link key={item.label} to={item.to}
                                    className={`group relative flex items-center gap-3 px-4 py-3.5 text-[0.98rem] font-medium transition ${isActive ? "bg-white/10 text-white before:absolute before:right-0 before:top-0 before:h-full before:w-1 before:bg-[#7bd02c]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
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
                                    <p className="truncate text-[0.7rem] text-white/55">{userEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 md:ml-[252px] flex flex-col min-h-screen min-w-0 relative">
                    {/* Mobile Header */}
                    <header className="flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">Logout</button>
                    </header>

                    {/* Desktop Header */}
                    <header className="hidden items-center justify-between border-b border-slate-200/70 bg-white px-8 py-4 md:flex">
                        <p className="text-[1.05rem] font-semibold text-slate-800">Laporan</p>
                        <div className="flex items-center gap-4 text-slate-600">
                            <button className="transition hover:text-slate-900" aria-label="Notifikasi">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </button>
                            <span className="h-7 w-px bg-slate-300" />
                            <button onClick={handleLogout} className="flex items-center gap-2 text-[0.98rem] transition hover:text-slate-900">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17l5-5m0 0l-5-5m5 5H9m4 8a8 8 0 100-16" /></svg>
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-32 md:pb-10">
                        {/* Title + Export */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-[2.25rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Laporan</h1>
                                <p className="mt-1 text-[1rem] text-slate-600">Analisis kehadiran anggota HMIF secara komprehensif.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                                <button onClick={exportCsv} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Export CSV
                                </button>
                                <button onClick={exportExcel} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f7a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#186322]">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Export Excel
                                </button>
                            </div>
                        </div>

                        {/* Top Row: Filters + Stats */}
                        <div className="grid gap-5 xl:grid-cols-[1fr_auto] mb-6">
                            {/* Parameter Laporan */}
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                                <div className="flex items-center gap-2 mb-5">
                                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    <h3 className="text-lg font-bold text-slate-800">Parameter Laporan</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pilih Acara</label>
                                        <select value={acara} onChange={(e) => setAcara(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                                            <option>Semua Acara</option>
                                            <option>Rapat Rutin Mingguan</option>
                                            <option>Seminar Teknologi</option>
                                            <option>Workshop Design</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Filter Divisi</label>
                                        <select value={divisi} onChange={(e) => setDivisi(e.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400">
                                            <option>Semua Divisi</option>
                                            <option>Litbang</option>
                                            <option>Humas</option>
                                            <option>Medinfo</option>
                                            <option>Internal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Date Range</label>
                                        <div className="flex items-center justify-between gap-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-400">
                                            <input
                                                type="date"
                                                value={dateRange}
                                                onChange={(e) => setDateRange(e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-slate-700 outline-none w-full min-w-0 focus:ring-0 cursor-pointer"
                                            />
                                            <span className="text-slate-400 text-xs font-medium shrink-0">-</span>
                                            <input
                                                type="date"
                                                value={dateEnd}
                                                onChange={(e) => setDateEnd(e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-slate-700 outline-none w-full min-w-0 focus:ring-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 xl:w-[320px] w-full">
                                {/* Total Hadir */}
                                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Total Hadir</span>
                                    </div>
                                    <p className="text-[2rem] font-extrabold text-slate-900 leading-none">1,248</p>
                                </div>
                                {/* Tidak Hadir */}
                                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                                            <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                        </div>
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Tidak Hadir</span>
                                    </div>
                                    <p className="text-[2rem] font-extrabold text-slate-900 leading-none">84</p>
                                </div>
                                {/* Persentase Kehadiran */}
                                <div className="rounded-xl bg-[#1f7a2c] p-5 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/70">Persentase Kehadiran</p>
                                        <p className="text-[2.2rem] font-extrabold text-white leading-none mt-1">93.7%</p>
                                    </div>
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <svg width="80" height="80" viewBox="0 0 90 90">
                                            <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
                                            <circle cx="45" cy="45" r={radius} fill="none" stroke="#f5bf17" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                                        </svg>
                                        <span className="absolute text-xs font-bold text-white">93%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800">Pratinjau Data</h3>
                                <span className="text-sm text-slate-500">Menampilkan {paginated.length} dari {filtered.length.toLocaleString()} entri</span>
                            </div>
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
                                        {paginated.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Tidak ada data yang cocok dengan filter.</td></tr>
                                        ) : paginated.map((row) => (
                                            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition">
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
                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-2 px-6 py-5 border-t border-slate-100">
                                <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={safePage === 1} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" /></svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)} className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${safePage === p ? "bg-[#1f5e22] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
                                ))}
                                <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={safePage === totalPages} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" /></svg>
                                </button>
                            </div>
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
                            <Link key={item.label} to={item.to} className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${isActive ? "text-white bg-white/10" : "text-white/80 hover:text-white"}`}>
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

import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard/admin-overview" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const PER_PAGE = 5;
const DEPARTMENT_OPTIONS = ["KEPROF", "PSDA", "INTERNAL", "EXTERNAL", "KOMINFO", "KESEKJENAN"];
const normalizeDepartment = (value) => {
    const normalized = String(value ?? "").trim();
    const lower = normalized.toLowerCase();

    if (!normalized || normalized === "-") return "-";
    if (["keprof", "keprofesian", "technopreneur", "minat bakat"].includes(lower)) return "KEPROF";
    if (lower === "psda") return "PSDA";
    if (lower === "internal") return "INTERNAL";
    if (["external", "eksternal"].includes(lower)) return "EXTERNAL";
    if (lower === "kominfo") return "KOMINFO";
    if (lower === "kesekjenan") return "KESEKJENAN";

    return normalized.toUpperCase();
};

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

const MONTH_LABELS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const padNumber = (value) => String(value).padStart(2, "0");

const isValidDateInput = (value) => {
    const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const parseDateValue = (value) => {
    if (!isValidDateInput(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const formatDateValue = (year, month, day) => `${year}-${padNumber(month + 1)}-${padNumber(day)}`;

const formatDateDisplay = (value) => {
    const date = parseDateValue(value);
    if (!date) return "Semua Tanggal";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const toDateKey = (value) => {
    if (!value) return null;

    const normalized = String(value).trim();
    const match = normalized.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];

    const date = new Date(normalized.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return null;

    return formatDateValue(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDateTimeDisplay = (value) => {
    if (!value) return "-";

    const normalized = String(value).trim().replace(" ", "T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function SelectPickerField({ value, options, onChange, isOpen, onOpenChange }) {
    const selectedLabel = options.find(option => String(option.value) === String(value))?.label || "Pilih";

    return (
        <div className={`relative ${isOpen ? "z-50" : ""}`}>
            <button
                type="button"
                onClick={() => onOpenChange(!isOpen)}
                className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            >
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">{selectedLabel}</span>
                <svg className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 max-h-56 w-full overflow-y-auto rounded-[12px] border border-emerald-100 bg-white p-1 shadow-lg shadow-slate-900/10">
                    {options.map(option => {
                        const active = String(option.value) === String(value);
                        return (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    onOpenChange(false);
                                }}
                                className={`w-full rounded-[9px] px-3 py-2.5 text-left text-sm font-semibold transition ${
                                    active ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-emerald-50"
                                }`}
                            >
                                <span className="block min-w-0 break-words [overflow-wrap:anywhere]">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DatePickerField({ value, onChange, isOpen, onOpenChange }) {
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const baseDate = parseDateValue(value) || new Date();
        return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    });

    useEffect(() => {
        if (!isOpen) return;
        const baseDate = parseDateValue(value) || new Date();
        setVisibleMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    }, [isOpen, value]);

    const selectedDate = parseDateValue(value);
    const today = new Date();
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (direction) => {
        setVisibleMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    };

    return (
        <div className={`relative ${isOpen ? "z-50" : ""}`}>
            <button
                type="button"
                onClick={() => onOpenChange(!isOpen)}
                className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            >
                <span className="min-w-0 font-medium">{formatDateDisplay(value)}</span>
                <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-[14px] border border-emerald-100 bg-emerald-50 p-3 shadow-xl shadow-slate-900/10">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="rounded-[9px] bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
                            aria-label="Bulan sebelumnya"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <p className="text-[0.92rem] font-extrabold text-slate-900">
                            {MONTH_LABELS[month]} {year}
                        </p>
                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="rounded-[9px] bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
                            aria-label="Bulan berikutnya"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {DAY_LABELS.map(day => (
                            <span key={day} className="py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-slate-400">
                                {day}
                            </span>
                        ))}
                        {Array.from({ length: firstDay }).map((_, index) => (
                            <span key={`empty-${index}`} className="h-8" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const dateValue = formatDateValue(year, month, day);
                            const isSelected = selectedDate && value === dateValue;
                            const isToday =
                                today.getFullYear() === year &&
                                today.getMonth() === month &&
                                today.getDate() === day;

                            return (
                                <button
                                    type="button"
                                    key={dateValue}
                                    onClick={() => {
                                        onChange(dateValue);
                                        onOpenChange(false);
                                    }}
                                    className={`h-8 rounded-[8px] text-[0.82rem] font-bold transition ${
                                        isSelected
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : isToday
                                                ? "bg-white text-emerald-700 ring-1 ring-emerald-200"
                                                : "text-slate-700 hover:bg-white"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-emerald-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                onOpenChange(false);
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                        >
                            Hapus Filter Tanggal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardAdminLaporan() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        localStorage.getItem("sidebar-collapsed") === "true"
    );

    const toggleSidebarCollapse = () => {
        const newValue = !isSidebarCollapsed;
        setIsSidebarCollapsed(newValue);
        localStorage.setItem("sidebar-collapsed", String(newValue));
    };
    const location = useLocation();
    const pathname = location.pathname;

    // User / profile
    const [user, setUser] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [userDivision, setUserDivision] = useState("Admin");
    const userName = user?.name || localStorage.getItem("name") || "Admin User";
    const nim = user?.nim || localStorage.getItem("nim") || "-";
    const isSuperAdmin = localStorage.getItem("role") === "super_admin";

    // Data dari API
    const [attendances, setAttendances] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Filter state
    const [filterEventId, setFilterEventId] = useState("semua");
    const [filterDivisi, setFilterDivisi] = useState("Semua Departemen");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [page, setPage] = useState(1);
    const [openFilterPicker, setOpenFilterPicker] = useState(null);

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

    // Fetch attendances endpoint: GET /api/events/{eventId}/attendances
    useEffect(() => {
        if (events.length === 0) return;

        setIsLoading(true);
        setError("");

        const fetchOne = (eventId) =>
            fetch(`/api/events/${eventId}/attendances?per_page=1000`, { headers: getAuthHeaders() })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    const event = data.event || events.find(e => String(e.event_id) === String(eventId)) || null;
                    const list = Array.isArray(data)
                        ? data
                        : Array.isArray(data.attendances)
                            ? data.attendances
                            : Array.isArray(data.data)
                                ? data.data
                                : [];

                    return list.map(item => ({ ...item, event }));
                })
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
            .map(r => {
                const event = r.event ?? events.find(e => String(e.event_id) === String(r.event_id)) ?? null;
                const checkinValue = r.checkin_time || r.checked_in_at;

                return {
                    id: r.member?.nim ?? r.nim ?? r.user?.nim ?? "-",
                    nama: r.member?.name ?? r.name ?? r.user?.name ?? r.nama ?? "-",
                    divisi: normalizeDepartment(r.member?.departemen ?? r.member?.Departemen ?? r.departemen ?? r.user?.profile?.departemen ?? r.divisi ?? "-"),
                    acara: event?.title ?? "-",
                    acaraDate: event?.date_time ?? null,
                    waktu: formatDateTimeDisplay(checkinValue),
                    status: (r.status === "present" || r.status === "HADIR") ? "HADIR" : "TIDAK HADIR",
                    rawDate: toDateKey(checkinValue) || toDateKey(event?.date_time),
                };
            })
            .filter(r => {
                const matchDivisi = filterDivisi === "Semua Departemen" || r.divisi === filterDivisi;
                const matchDateStart = !dateStart || !r.rawDate || r.rawDate >= dateStart;
                const matchDateEnd = !dateEnd || !r.rawDate || r.rawDate <= dateEnd;
                return matchDivisi && matchDateStart && matchDateEnd;
            });
    }, [attendances, filterDivisi, dateStart, dateEnd, events]);

    // Departemen unik dari data
    const divisions = useMemo(() => {
        const s = new Set(attendances.map(r =>
            normalizeDepartment(r.member?.departemen ?? r.member?.Departemen ?? r.user?.profile?.departemen ?? r.divisi)
        ).filter((department) => department && department !== "-"));
        return [...s].sort();
    }, [attendances]);

    const eventFilterOptions = useMemo(() => [
        { value: "semua", label: "Semua Acara" },
        ...events.map(ev => ({ value: String(ev.event_id), label: ev.title || "Tanpa Judul" })),
    ], [events]);

    const divisionFilterOptions = useMemo(() => [
        { value: "Semua Departemen", label: "Semua Departemen" },
        ...Array.from(new Set([...DEPARTMENT_OPTIONS, ...divisions])).map(division => ({ value: division, label: division })),
    ], [divisions]);

    const totalHadir = rows.filter(r => r.status === "HADIR").length;
    const totalTidak = rows.filter(r => r.status === "TIDAK HADIR").length;
    const persen = rows.length > 0 ? ((totalHadir / rows.length) * 100).toFixed(1) : "0.0";
    const persenInt = Math.round(Number(persen));

    const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginated = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    // Export uses backend CSV for one event, or manual CSV for all events.
    const downloadCsv = (content, filename) => {
        const blob = content instanceof Blob
            ? content
            : new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleResetFilters = () => {
        setFilterEventId("semua");
        setFilterDivisi("Semua Departemen");
        setDateStart("");
        setDateEnd("");
        setPage(1);
        setOpenFilterPicker(null);
    };

    const handleExportCsv = async () => {
        if (filterEventId !== "semua") {
            try {
                const response = await fetch(`/api/events/${filterEventId}/attendances/export-csv`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) throw new Error("Gagal export CSV");

                downloadCsv(await response.blob(), `rekap-kehadiran-event-${filterEventId}.csv`);
            } catch (err) {
                setError(err.message || "Gagal export CSV");
            }
            return;
        }

        const h = ["ID Anggota", "Nama Lengkap", "Departemen", "Acara", "Waktu Presensi", "Status"];
        const lines = [h.map(csvEscape).join(","), ...rows.map(r =>
            [r.id, r.nama, r.divisi, r.acara, r.waktu, r.status].map(csvEscape).join(",")
        )];
        downloadCsv(lines.join("\n"), "laporan-kehadiran.csv");
    };

    // SVG circular progress
    const radius = 38, stroke = 6, circ = 2 * Math.PI * radius;
    const offset = circ - (persenInt / 100) * circ;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#e7f5e5] font-sans text-gray-900">
            <div className="min-h-screen flex">

                {/* Mobile Sidebar Backdrop Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
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

                    {/* TOPBAR DESKTOP */}
                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Laporan</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{userDivision}</span>
                            <div className="h-5 w-px bg-gray-200" />
                            <NotificationBell />
                            <img
                                src={fotoUrl || fotoProfile}
                                alt="Foto profil"
                                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                            />
                        </div>
                    </header>

                    {/* TOPBAR MOBILE */}
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-3.5 md:hidden">
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

                    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7 pb-28 md:pb-10">

                        {/* Title + Export */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Laporan</h1>
                                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-slate-600 sm:text-[1rem]">Analisis kehadiran anggota HMIF secara komprehensif.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                                <button onClick={handleExportCsv} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Export CSV
                                </button>
                                <button onClick={handleResetFilters} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f7a2c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#186322]">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5.5 18.5A8 8 0 0118.5 5.5M18.5 5.5H14M18.5 5.5V10" /></svg>
                                    Reset Filter
                                </button>
                            </div>
                        </div>

                        {/* Top Row: Filters + Stats */}
                        <div className="mb-6 flex flex-col gap-5">
                            <div className="order-2 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                                <div className="mb-4 flex items-center gap-2">
                                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    <h3 className="text-lg font-bold text-slate-800">Parameter Laporan</h3>
                                </div>
                                <div className="grid gap-x-4 gap-y-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-500">Pilih Acara</label>
                                        <SelectPickerField
                                            value={filterEventId}
                                            options={eventFilterOptions}
                                            onChange={setFilterEventId}
                                            isOpen={openFilterPicker === "event"}
                                            onOpenChange={(isOpen) => setOpenFilterPicker(isOpen ? "event" : null)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-500">Filter Departemen</label>
                                        <SelectPickerField
                                            value={filterDivisi}
                                            options={divisionFilterOptions}
                                            onChange={setFilterDivisi}
                                            isOpen={openFilterPicker === "division"}
                                            onOpenChange={(isOpen) => setOpenFilterPicker(isOpen ? "division" : null)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-500">Tanggal Mulai</label>
                                        <DatePickerField
                                            value={dateStart}
                                            onChange={setDateStart}
                                            isOpen={openFilterPicker === "dateStart"}
                                            onOpenChange={(isOpen) => setOpenFilterPicker(isOpen ? "dateStart" : null)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-500">Tanggal Selesai</label>
                                        <DatePickerField
                                            value={dateEnd}
                                            onChange={setDateEnd}
                                            isOpen={openFilterPicker === "dateEnd"}
                                            onOpenChange={(isOpen) => setOpenFilterPicker(isOpen ? "dateEnd" : null)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="order-1 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Total Hadir</span>
                                    </div>
                                    <p className="text-[2rem] font-extrabold text-slate-900 leading-none">
                                            {isLoading ? "-" : totalHadir.toLocaleString()}
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
                                            {isLoading ? "-" : totalTidak.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#1f7a2c] p-5 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
                                    <div>
                                        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-white/70">Persentase Kehadiran</p>
                                        <p className="text-[2.2rem] font-extrabold text-white leading-none mt-1">
                                            {isLoading ? "-" : `${persen}%`}
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
                                            <th className="py-4 px-4">Departemen</th>
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c5e22]/95 backdrop-blur-md border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.16)] flex justify-around items-center px-2 pb-safe md:hidden">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.to;
                    return (
                        <Link 
                            key={item.label} 
                            to={item.to} 
                            className="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-300 active:scale-95"
                        >
                            {isActive && (
                                <span className="absolute inset-x-4 inset-y-1 rounded-xl bg-white/12 ring-1 ring-white/5" />
                            )}
                            <img 
                                src={item.icon} 
                                alt={item.label} 
                                className={`h-4.5 w-4.5 object-contain transition-transform duration-300 ${isActive ? "scale-110 brightness-[10] filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" : "brightness-[10] opacity-60"}`} 
                            />
                            <span className={`text-[0.58rem] font-bold tracking-[0.08em] uppercase transition-colors duration-300 ${isActive ? "text-white font-extrabold" : "text-white/60"}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

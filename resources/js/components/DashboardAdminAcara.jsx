import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// Generate QR token ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â pakai qr_token dari DB, fallback ke event_id
const generateQrToken = (event) => {
    return event.qr_token || String(event.event_id);
};

// Helper: cek apakah event masih aktif
const isEventActive = (event) => {
    const end = event.attendance_window_end ? new Date(event.attendance_window_end) : null;
    return end && end >= new Date();
};

const normalizeDateInput = (value) => {
    const normalized = String(value ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

    const dateMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (!dateMatch) return normalized;

    const [, day, month, year] = dateMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeTimeInput = (value) => {
    const normalized = String(value ?? "").trim();
    if (/^\d{2}:\d{2}$/.test(normalized)) return normalized;

    const compact = normalized.replace(/\D/g, "");
    if (compact.length === 4) return `${compact.slice(0, 2)}:${compact.slice(2)}`;

    return normalized;
};

const isValidDateInput = (value) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;

    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const isValidTimeInput = (value) => {
    const match = value.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;

    const [, hour, minute] = match.map(Number);
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

const MONTH_LABELS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const padNumber = (value) => String(value).padStart(2, "0");
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => padNumber(index));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => padNumber(index));

const parseDateValue = (value) => {
    if (!isValidDateInput(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const formatDateValue = (year, month, day) => `${year}-${padNumber(month + 1)}-${padNumber(day)}`;

const formatDateDisplay = (value) => {
    const date = parseDateValue(value);
    if (!date) return "Pilih tanggal";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

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
                className="flex w-full items-center justify-between rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-left text-[0.95rem] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
                <span className={value ? "font-medium text-slate-800" : "text-slate-400"}>{formatDateDisplay(value)}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                </div>
            )}
        </div>
    );
}

function TimePickerField({ value, placeholder, onChange, isOpen, onOpenChange }) {
    const [selectedHour = "", selectedMinute = ""] = isValidTimeInput(value) ? value.split(":") : [];

    const selectHour = (hour) => {
        onChange(`${hour}:${selectedMinute || "00"}`);
    };

    const selectMinute = (minute) => {
        onChange(`${selectedHour || "00"}:${minute}`);
        onOpenChange(false);
    };

    return (
        <div className={`relative ${isOpen ? "z-50" : ""}`}>
            <button
                type="button"
                onClick={() => onOpenChange(!isOpen)}
                className="flex w-full items-center justify-between rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-left text-[0.95rem] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
                <span className={value ? "font-medium text-slate-800" : "text-slate-400"}>{value || placeholder}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2m7-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-[14px] border border-emerald-100 bg-emerald-50 p-3 shadow-xl shadow-slate-900/10">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">Jam</p>
                            <div className="grid max-h-40 grid-cols-3 gap-1 overflow-y-auto pr-1">
                                {HOUR_OPTIONS.map(hour => (
                                    <button
                                        type="button"
                                        key={hour}
                                        onClick={() => selectHour(hour)}
                                        className={`rounded-[8px] px-2 py-1.5 text-[0.78rem] font-bold transition ${
                                            selectedHour === hour
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-white text-slate-700 hover:bg-emerald-100"
                                        }`}
                                    >
                                        {hour}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">Menit</p>
                            <div className="grid max-h-40 grid-cols-3 gap-1 overflow-y-auto pr-1">
                                {MINUTE_OPTIONS.map(minute => (
                                    <button
                                        type="button"
                                        key={minute}
                                        onClick={() => selectMinute(minute)}
                                        className={`rounded-[8px] px-2 py-1.5 text-[0.78rem] font-bold transition ${
                                            selectedMinute === minute
                                                ? "bg-emerald-600 text-white shadow-sm"
                                                : "bg-white text-slate-700 hover:bg-emerald-100"
                                        }`}
                                    >
                                        {minute}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="mt-2 text-[0.72rem] text-slate-500">Pilih jam dulu, lalu menit.</p>
                </div>
            )}
        </div>
    );
}

function MetaRow({ children, type }) {
    return (
        <div className="flex items-start gap-3 text-[0.98rem] text-slate-800">
            {type === "calendar" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M8 3v3m8-3v3M4 8h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
            )}
            {type === "pin" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 21s6-5.2 6-11a6 6 0 10-12 0c0 5.8 6 11 6 11z" />
                    <circle cx="12" cy="10" r="2.1" stroke="currentColor" strokeWidth="1.9" />
                </svg>
            )}
            {type === "clock" && (
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#5baa19]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M12 7v5l3 2m7-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
            )}
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{children}</span>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="rounded-[16px] bg-white/10 px-4 py-4 backdrop-blur-sm">
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-white/60">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
        </div>
    );
}

// Badge status: Aktif (hijau) atau Berakhir (merah)
function StatusBadge({ event }) {
    const active = isEventActive(event);
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${
            active
                ? "bg-[#def6d7] text-[#5baa19]"
                : "bg-red-100 text-red-600"
        }`}>
            {active ? "Aktif" : "Berakhir"}
        </span>
    );
}

// Modal Detail
function DetailModal({ event, onClose, onDelete, deletingId }) {
    if (!event) return null;
    const formatDate = (dt) => dt ? new Date(dt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "-";
    const windowStart = event.attendance_window_start
        ? new Date(event.attendance_window_start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "-";
    const windowEnd = event.attendance_window_end
        ? new Date(event.attendance_window_end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : "-";

    const isDeleting = deletingId === event.event_id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-[18px] bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                        <StatusBadge event={event} />
                        <h2 className="mt-2 break-words text-[1.4rem] font-bold leading-snug text-slate-900 [overflow-wrap:anywhere]">{event.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-4 shrink-0">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-3 mb-4">
                    <MetaRow type="calendar">{formatDate(event.date_time)}</MetaRow>
                    <MetaRow type="pin">{event.location || "-"}</MetaRow>
                    <MetaRow type="clock">Window: {windowStart} - {windowEnd} WIB</MetaRow>
                </div>

                {event.description && (
                    <div className="mb-1 max-w-full overflow-hidden rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Deskripsi</p>
                        <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{event.description}</p>
                    </div>
                )}

                {/* Tombol Tutup */}
                <button
                    onClick={onClose}
                    className="mt-5 w-full rounded-[10px] bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                    Tutup
                </button>

                {/* Tombol Hapus ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â di bawah Tutup */}
                <button
                    onClick={() => onDelete(event.event_id, event.title)}
                    disabled={isDeleting}
                    className="mt-2 w-full rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                >
                    {isDeleting ? "Menghapus..." : "Hapus Acara"}
                </button>
            </div>
        </div>
    );
}

export default function DashboardAdminAcara() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [events, setEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [user, setUser] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [userDivision, setUserDivision] = useState("Admin");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [detailEvent, setDetailEvent] = useState(null);
    const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
    const [createFormError, setCreateFormError] = useState("");
    const [featuredEvent, setFeaturedEvent] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [openPicker, setOpenPicker] = useState(null);
    const isSuperAdmin = localStorage.getItem("role") === "super_admin";

    const [form, setForm] = useState({
        title: "", description: "", location: "", date: "", time: "", window_start: "", window_end: "",
    });

    const userName = user?.name || localStorage.getItem("name") || "Admin";
    const nim = user?.nim || localStorage.getItem("nim") || "-";

    const handleLogout = () => {
        ["auth_token", "role", "name", "nim"].forEach(k => localStorage.removeItem(k));
        navigate("/login");
    };

    const fetchEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const res = await fetch("/api/events", { headers: getAuthHeaders() });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
            setEvents(list);
            if (list.length > 0) {
                setFeaturedEvent(prev => {
                    // Kalau featured masih ada di list, pertahankan. Kalau tidak, ambil index 0.
                    if (prev) {
                        const stillExists = list.find(e => e.event_id === prev.event_id);
                        return stillExists ?? list[0];
                    }
                    return list[0];
                });
            } else {
                setFeaturedEvent(null);
            }
        } catch {
            setEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const handleDeleteEvent = async (eventId, eventTitle) => {
        if (!window.confirm(`Hapus acara "${eventTitle}"?`)) return;
        setDeletingId(eventId);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal menghapus acara");
            }
            // Tutup modal detail kalau yang dihapus adalah yang sedang dibuka
            if (detailEvent?.event_id === eventId) setDetailEvent(null);
            await fetchEvents();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        fetch("/api/me", { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFotoUrl(data?.profile?.foto ? `/storage/${data.profile.foto}` : null);
                setUserDivision(data?.profile?.departemen || "Admin");
            })
            .catch(() => null);
        fetchEvents();
    }, []);

    // Stats panel sekarang spesifik ke featuredEvent
    const featuredStats = useMemo(() => {
        if (!featuredEvent) return { checkin: 0, active: false };
        return {
            checkin: Number(featuredEvent.attendances_count ?? 0),
            active: isEventActive(featuredEvent),
        };
    }, [featuredEvent]);

    const totalEvents = events.length;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFormValueChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setCreateFormError("Judul acara tidak boleh kosong"); return; }
        if (!form.date) { setCreateFormError("Tanggal wajib diisi"); return; }
        if (!form.time) { setCreateFormError("Jam acara wajib diisi"); return; }
        if (!form.window_start || !form.window_end) { setCreateFormError("Jam presensi wajib diisi"); return; }

        const eventDate = normalizeDateInput(form.date);
        const eventTime = normalizeTimeInput(form.time);
        const windowStart = normalizeTimeInput(form.window_start);
        const windowEnd = normalizeTimeInput(form.window_end);

        if (!isValidDateInput(eventDate)) {
            setCreateFormError("Pilih tanggal dari kalender");
            return;
        }

        if (!isValidTimeInput(eventTime) || !isValidTimeInput(windowStart) || !isValidTimeInput(windowEnd)) {
            setCreateFormError("Pilih jam acara dan window presensi");
            return;
        }

        setIsSubmittingEvent(true);
        setCreateFormError("");

        const date_time = `${eventDate}T${eventTime}:00`;
        const attendance_window_start = `${eventDate}T${windowStart}:00`;
        const attendance_window_end = `${eventDate}T${windowEnd}:00`;

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    location: form.location.trim(),
                    date_time,
                    attendance_window_start,
                    attendance_window_end,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Gagal membuat acara");
            setForm({ title: "", description: "", location: "", date: "", time: "", window_start: "", window_end: "" });
            setOpenPicker(null);
            setShowCreateModal(false);
            await fetchEvents();
        } catch (err) {
            setCreateFormError(err.message);
        } finally {
            setIsSubmittingEvent(false);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#e7f5e5] font-sans text-gray-900">
            <div className="min-h-screen flex">

                {/* SIDEBAR */}
                <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
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

                    {/* TOPBAR DESKTOP */}
                    <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Event Management</h2>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{userDivision}</span>
                            <div className="h-5 w-px bg-gray-200" />
                            <button className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <img
                                src={fotoUrl || fotoProfile}
                                alt="Foto profil"
                                className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover"
                            />
                        </div>
                    </header>

                    {/* TOPBAR MOBILE */}
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

                    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7 pb-28 md:pb-10">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-[1.7rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Manajemen Acara</h1>
                                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-slate-700 sm:mt-2 sm:text-[1rem]">Kelola jadwal, presensi, dan logistik acara HMIF.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(true);
                                    setCreateFormError("");
                                    setOpenPicker(null);
                                    setForm({ title: "", description: "", location: "", date: "", time: "", window_start: "", window_end: "" });
                                }}
                                className="inline-flex items-center justify-center gap-3 rounded-[14px] bg-[#f5bf17] px-5 py-3.5 text-[0.98rem] font-semibold text-slate-900 shadow-[0_10px_22px_rgba(245,191,23,0.28)] transition hover:bg-[#ffd033]"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
                                    </svg>
                                </span>
                                Buat Acara Baru
                            </button>
                        </div>

                        {/* FEATURED EVENT ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â update otomatis saat card diklik */}
                        {featuredEvent && (
                            <section className="grid gap-5 xl:grid-cols-[1.95fr_0.92fr] mb-6">
                                <div className="overflow-hidden rounded-[16px] border border-slate-300 bg-white shadow-[0_9px_18px_rgba(15,23,42,0.13)]">
                                    <div className="grid min-h-[320px] xl:grid-cols-[1.18fr_0.82fr]">
                                        <div className="p-6 sm:p-7">
                                            <StatusBadge event={featuredEvent} />
                                            <h2 className="mt-4 max-w-[22ch] text-[1.8rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.1rem]">
                                                {featuredEvent.title}
                                            </h2>
                                            <div className="mt-5 space-y-3">
                                                <MetaRow type="calendar">
                                                    {featuredEvent.date_time
                                                        ? new Date(featuredEvent.date_time).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                                                        : "-"}
                                                </MetaRow>
                                                <MetaRow type="pin">{featuredEvent.location || "-"}</MetaRow>
                                                <MetaRow type="clock">
                                                    Window:{" "}
                                                    {featuredEvent.attendance_window_start
                                                        ? new Date(featuredEvent.attendance_window_start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                                                        : "-"}{" "}
                                                    -{" "}
                                                    {featuredEvent.attendance_window_end
                                                        ? new Date(featuredEvent.attendance_window_end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                                                        : "-"}{" "}
                                                    WIB
                                                </MetaRow>
                                            </div>
                                            <div className="mt-6 flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => setDetailEvent(featuredEvent)}
                                                    className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[0.96rem] font-medium text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </div>

                                        {/* Admin attendance panel */}
                                        <div className="border-t border-slate-200 xl:border-l xl:border-t-0">
                                            <div className="flex h-full flex-col items-center justify-center p-6 text-center sm:p-8">
                                                <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-400">Presensi Admin</p>
                                                <div className="mt-5 flex h-[150px] w-[150px] items-center justify-center rounded-[22px] border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm">
                                                    <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10" />
                                                    </svg>
                                                </div>
                                                <h3 className="mt-4 text-[1.15rem] font-extrabold text-slate-900">Scan QR Anggota</h3>
                                                <p className="mt-2 max-w-[220px] text-[0.82rem] leading-relaxed text-slate-500">
                                                    Anggota menampilkan QR dari dashboard, admin memindai untuk mencatat hadir.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/scan")}
                                                    className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-[#63bc2b] px-4 py-2.5 text-[0.95rem] font-bold text-slate-900 transition hover:bg-[#73cd35]"
                                                >
                                                    Buka Scanner Admin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate("/scan")}
                                                    className="mt-3 text-[0.82rem] font-bold text-slate-500 transition hover:text-slate-800"
                                                >
                                                    Set hadir manual tanpa QR
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STATS PANEL ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â spesifik ke featuredEvent */}
                                <aside className="rounded-[16px] bg-[#5fae14] p-5 text-white shadow-[0_10px_22px_rgba(68,131,19,0.24)]">
                                    <p className="text-[0.78rem] uppercase tracking-[0.18em] text-white/70">Total Acara</p>
                                    <h3 className="mt-1 text-[3.1rem] font-extrabold leading-none">{totalEvents}</h3>

                                    <div className="mt-5 h-px bg-white/20" />

                                    {/* Statistik per acara yang dipilih */}
                                    <p className="mt-4 text-[0.72rem] uppercase tracking-[0.14em] text-white/60 truncate">
                                        Statistik: {featuredEvent.title}
                                    </p>
                                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                        <StatBox label="Check-in Acara Ini" value={featuredStats.checkin} />
                                        <StatBox
                                            label="Status"
                                            value={featuredStats.active ? "Aktif" : "Berakhir"}
                                        />
                                    </div>
                                </aside>
                            </section>
                        )}

                        {/* EVENT LIST ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â klik card = ganti featured */}
                        <section className="grid gap-5 lg:grid-cols-3">
                            {isLoadingEvents ? (
                                <div className="col-span-3 rounded-[14px] border border-slate-300 bg-white p-6 text-center text-slate-500">Memuat acara...</div>
                            ) : events.length > 0 ? (
                                events.map((event) => {
                                    const active = isEventActive(event);
                                    const isSelected = featuredEvent?.event_id === event.event_id;

                                    return (
                                        <article
                                            key={event.event_id}
                                            onClick={() => setFeaturedEvent(event)}
                                            className={`overflow-hidden rounded-[14px] border bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)] cursor-pointer transition-all duration-200 ${
                                                isSelected
                                                    ? "border-[#5baa19] ring-2 ring-[#5baa19]/30 shadow-[0_10px_24px_rgba(91,170,25,0.18)]"
                                                    : "border-slate-300 hover:border-[#5baa19]/50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                                            }`}
                                        >
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    {/* Badge: Aktif (hijau) atau Berakhir (merah) */}
                                                    <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${
                                                        active
                                                            ? "bg-[#def6d7] text-[#5baa19]"
                                                            : "bg-red-100 text-red-600"
                                                    }`}>
                                                        {active ? "Aktif" : "Berakhir"}
                                                    </span>
                                                    {/* Indikator event yang sedang ditampilkan */}
                                                    {isSelected && (
                                                        <span className="text-[0.72rem] font-semibold text-[#5baa19] flex items-center gap-1">
                                                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                <circle cx="12" cy="12" r="6" />
                                                            </svg>
                                                            Ditampilkan
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-[1.05rem] font-bold leading-snug text-slate-900">{event.title}</h3>
                                                {event.location && <p className="mt-1 text-[0.85rem] text-slate-500">{event.location}</p>}
                                                {event.date_time && (
                                                    <p className="mt-1 text-[0.82rem] text-slate-400">
                                                        {new Date(event.date_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                )}
                                                <div className="my-3 h-px bg-slate-100" />
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-[0.88rem] text-slate-500">Check-in: {event.attendances_count ?? 0}</p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDetailEvent(event);
                                                        }}
                                                        className="text-[0.94rem] font-medium text-[#5baa19] hover:text-[#3d8a0e] transition"
                                                    >
                                                        Detail
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <article className="col-span-3 flex min-h-[180px] flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-slate-300 bg-white/60 px-6 text-center">
                                    <h3 className="text-[1.1rem] font-bold text-slate-900">Belum ada acara</h3>
                                    <p className="mt-2 text-[0.95rem] text-slate-500">Buat acara baru untuk mulai menerima presensi.</p>
                                </article>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* MODAL BUAT ACARA */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
                    <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[18px] bg-white p-5 shadow-2xl sm:my-6 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[1.4rem] font-bold text-slate-900">Buat Acara Baru</h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setOpenPicker(null);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Judul Acara <span className="text-red-500">*</span></label>
                                <input type="text" name="title" value={form.title} onChange={handleFormChange}
                                    placeholder="Contoh: Workshop UI/UX Design"
                                    className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                            </div>
                            <div>
                                <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Lokasi</label>
                                <input type="text" name="location" value={form.location} onChange={handleFormChange}
                                    placeholder="Contoh: Auditorium Utama Lt. 3"
                                    className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                            </div>
                            <div>
                                <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                                <textarea name="description" value={form.description} onChange={handleFormChange}
                                    rows={3} placeholder="Deskripsi singkat acara..."
                                    className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Tanggal <span className="text-red-500">*</span></label>
                                    <DatePickerField
                                        value={form.date}
                                        onChange={(value) => handleFormValueChange("date", value)}
                                        isOpen={openPicker === "date"}
                                        onOpenChange={(isOpen) => setOpenPicker(isOpen ? "date" : null)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Jam Acara <span className="text-red-500">*</span></label>
                                    <TimePickerField
                                        value={form.time}
                                        placeholder="Pilih jam"
                                        onChange={(value) => handleFormValueChange("time", value)}
                                        isOpen={openPicker === "time"}
                                        onOpenChange={(isOpen) => setOpenPicker(isOpen ? "time" : null)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Window Presensi <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <TimePickerField
                                        value={form.window_start}
                                        placeholder="Mulai"
                                        onChange={(value) => handleFormValueChange("window_start", value)}
                                        isOpen={openPicker === "window_start"}
                                        onOpenChange={(isOpen) => setOpenPicker(isOpen ? "window_start" : null)}
                                    />
                                    <TimePickerField
                                        value={form.window_end}
                                        placeholder="Selesai"
                                        onChange={(value) => handleFormValueChange("window_end", value)}
                                        isOpen={openPicker === "window_end"}
                                        onOpenChange={(isOpen) => setOpenPicker(isOpen ? "window_end" : null)}
                                    />
                                </div>
                                <p className="mt-1 text-[0.75rem] text-slate-400">Klik untuk memilih jam presensi hari yang sama</p>
                            </div>
                            {createFormError && (
                                <div className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3">
                                    <p className="text-[0.9rem] text-red-700">{createFormError}</p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setOpenPicker(null);
                                    }}
                                    disabled={isSubmittingEvent}
                                    className="flex-1 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[0.95rem] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                                    Batal
                                </button>
                                <button type="button" onClick={handleCreateEvent} disabled={isSubmittingEvent}
                                    className="flex-1 rounded-[10px] bg-emerald-600 px-4 py-2.5 text-[0.95rem] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                                    {isSubmittingEvent ? "Menyimpan..." : "Buat Acara"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL Detail
            <DetailModal
                event={detailEvent}
                onClose={() => setDetailEvent(null)}
                onDelete={handleDeleteEvent}
                deletingId={deletingId}
            />

            {/* MOBILE NAV */}
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

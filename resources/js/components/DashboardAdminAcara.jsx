import React, { useEffect, useMemo, useState } from "react";
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

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const generateHash = () => Math.random().toString(36).substring(2, 5).toUpperCase();

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
            <span>{children}</span>
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

function DetailModal({ event, onClose }) {
    if (!event) return null;
    const formatDate = (dt) => dt ? new Date(dt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "-";
    const windowStart = event.attendance_window_start ? new Date(event.attendance_window_start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-";
    const windowEnd = event.attendance_window_end ? new Date(event.attendance_window_end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="inline-flex items-center rounded-full bg-[#def6d7] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#5baa19]">
                            {event.status || "AKTIF"}
                        </span>
                        <h2 className="mt-2 text-[1.4rem] font-bold text-slate-900 leading-snug">{event.title}</h2>
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
                    <MetaRow type="clock">Window: {windowStart} – {windowEnd} WIB</MetaRow>
                </div>
                {event.description && (
                    <div className="rounded-[12px] bg-slate-50 border border-slate-200 px-4 py-3">
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Deskripsi</p>
                        <p className="text-[0.95rem] text-slate-700 leading-relaxed">{event.description}</p>
                    </div>
                )}
                <button onClick={onClose} className="mt-5 w-full rounded-[10px] bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                    Tutup
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
            if (list.length > 0) setFeaturedEvent(prev => prev ?? list[0]);
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
            if (featuredEvent?.event_id === eventId) setFeaturedEvent(null);
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

    const totals = useMemo(() => {
        const totalCheckin = events.reduce((s, e) => s + (Number(e.attendances_count ?? 0)), 0);
        return { totalCheckin, totalEvents: events.length };
    }, [events]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setCreateFormError("Judul acara tidak boleh kosong"); return; }
        if (!form.date) { setCreateFormError("Tanggal wajib diisi"); return; }
        if (!form.time) { setCreateFormError("Jam acara wajib diisi"); return; }
        if (!form.window_start || !form.window_end) { setCreateFormError("Jam presensi wajib diisi"); return; }

        setIsSubmittingEvent(true);
        setCreateFormError("");

        const date_time = `${form.date}T${form.time}:00`;
        const attendance_window_start = `${form.date}T${form.window_start}:00`;
        const attendance_window_end = `${form.date}T${form.window_end}:00`;

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
                        <h2 className="text-[1.05rem] font-bold text-gray-800">Event Management</h2>
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
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-[2.25rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Manajemen Acara</h1>
                                <p className="mt-2 text-[1rem] text-slate-700">Kelola jadwal, presensi, dan logistik acara HMIF.</p>
                            </div>
                            <button
                                onClick={() => { setShowCreateModal(true); setCreateFormError(""); setForm({ title: "", description: "", location: "", date: "", time: "", window_start: "", window_end: "" }); }}
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

                        {/* FEATURED EVENT */}
                        {featuredEvent && (
                        <section className="grid gap-5 xl:grid-cols-[1.95fr_0.92fr] mb-6">
                            <div className="overflow-hidden rounded-[16px] border border-slate-300 bg-white shadow-[0_9px_18px_rgba(15,23,42,0.13)]">
                                <div className="grid min-h-[320px] xl:grid-cols-[1.18fr_0.82fr]">
                                    <div className="p-6 sm:p-7">
                                        <div className="inline-flex items-center rounded-full bg-[#def6d7] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#5baa19]">AKTIF</div>
                                        <h2 className="mt-4 max-w-[22ch] text-[1.8rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-[2.1rem]">
                                            {featuredEvent.title}
                                        </h2>
                                        <div className="mt-5 space-y-3">
                                            <MetaRow type="calendar">
                                                {featuredEvent.date_time ? new Date(featuredEvent.date_time).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "-"}
                                            </MetaRow>
                                            <MetaRow type="pin">{featuredEvent.location || "-"}</MetaRow>
                                            <MetaRow type="clock">
                                                Window: {featuredEvent.attendance_window_start ? new Date(featuredEvent.attendance_window_start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"} – {featuredEvent.attendance_window_end ? new Date(featuredEvent.attendance_window_end).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"} WIB
                                            </MetaRow>
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            <button onClick={() => setDetailEvent(featuredEvent)}
                                                className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 py-2.5 text-[0.96rem] font-medium text-slate-700 transition hover:bg-slate-50">
                                                Detail
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 xl:border-l xl:border-t-0">
                                        <div className="flex h-full flex-col items-center justify-center p-6 sm:p-8">
                                            <p className="text-[0.9rem] font-semibold uppercase tracking-[0.12em] text-slate-400">QR Presensi</p>
                                            <div className="mt-5 rounded-[18px] border-2 border-[#b6cbf6] bg-white p-3 shadow-sm">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(featuredEvent.qr_token || featuredEvent.event_id)}`}
                                                    alt="QR Code"
                                                    className="h-[170px] w-[170px] object-contain"
                                                />
                                            </div>
                                            <p className="mt-4 text-center text-[0.85rem] text-slate-400">Scan untuk presensi kehadiran</p>
                                            <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(featuredEvent.qr_token || featuredEvent.event_id)}`}
                                                download={`QR-${featuredEvent.title}.png`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#63bc2b] px-4 py-2.5 text-[0.95rem] font-medium text-slate-900 transition hover:bg-[#73cd35]"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v9m0 0l-3-3m3 3l3-3M5 19h14" />
                                                </svg>
                                                Download QR
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <aside className="rounded-[16px] bg-[#5fae14] p-5 text-white shadow-[0_10px_22px_rgba(68,131,19,0.24)]">
                                <p className="text-[1rem] uppercase tracking-[0.18em] text-white/85">TOTAL ACARA</p>
                                <h3 className="mt-2 text-[3.1rem] font-extrabold leading-none">{totals.totalEvents}</h3>
                                <div className="mt-12 grid gap-3 sm:grid-cols-2">
                                    <StatBox label="Total Check-in" value={totals.totalCheckin} />
                                    <StatBox label="Acara Aktif" value={events.filter(e => e.attendance_window_end && new Date(e.attendance_window_end) >= new Date()).length} />
                                </div>
                            </aside>
                        </section>
                        )}

                        {/* EVENT LIST */}
                        <section className="grid gap-5 lg:grid-cols-3">
                            {isLoadingEvents ? (
                                <div className="col-span-3 rounded-[14px] border border-slate-300 bg-white p-6 text-center text-slate-500">Memuat acara...</div>
                            ) : events.length > 0 ? (
                                events.map((event) => {
                                    const end = event.attendance_window_end ? new Date(event.attendance_window_end) : null;
                                    const isActive = end && end >= new Date();
                                    return (
                                        <article key={event.event_id} className="overflow-hidden rounded-[14px] border border-slate-300 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${isActive ? "bg-[#def6d7] text-[#5baa19]" : "bg-slate-100 text-slate-500"}`}>
                                                        {isActive ? "AKTIF" : "SELESAI"}
                                                    </span>
                                                    <button onClick={() => setFeaturedEvent(event)} className="text-[0.78rem] text-slate-400 hover:text-slate-700 transition">Jadikan Featured</button>
                                                </div>
                                                <h3 className="text-[1.05rem] font-bold leading-snug text-slate-900">{event.title}</h3>
                                                {event.location && <p className="mt-1 text-[0.85rem] text-slate-500">{event.location}</p>}
                                                {event.date_time && <p className="mt-1 text-[0.82rem] text-slate-400">{new Date(event.date_time).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>}
                                                <div className="my-3 h-px bg-slate-100" />
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-[0.88rem] text-slate-500">Check-in: {event.attendances_count ?? 0}</p>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setDetailEvent(event)} className="text-[0.94rem] font-medium text-[#5baa19] hover:text-[#3d8a0e] transition">Detail →</button>
                                                        <button
                                                            onClick={() => handleDeleteEvent(event.event_id, event.title)}
                                                            disabled={deletingId === event.event_id}
                                                            className="text-[0.88rem] font-medium text-red-400 hover:text-red-600 transition disabled:opacity-50"
                                                        >
                                                            {deletingId === event.event_id ? "..." : "Hapus"}
                                                        </button>
                                                    </div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl my-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[1.4rem] font-bold text-slate-900">Buat Acara Baru</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
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
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Tanggal <span className="text-red-500">*</span></label>
                                    <input type="date" name="date" value={form.date} onChange={handleFormChange}
                                        className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                </div>
                                <div>
                                    <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Jam Acara <span className="text-red-500">*</span></label>
                                    <input type="time" name="time" value={form.time} onChange={handleFormChange}
                                        className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[0.85rem] font-semibold text-slate-700 mb-1.5">Window Presensi <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="time" name="window_start" value={form.window_start} onChange={handleFormChange}
                                        className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                    <input type="time" name="window_end" value={form.window_end} onChange={handleFormChange}
                                        className="w-full rounded-[10px] border border-slate-300 px-4 py-2.5 text-[0.95rem] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                </div>
                                <p className="mt-1 text-[0.75rem] text-slate-400">Jam presensi anggota bisa check-in (hari yang sama)</p>
                            </div>
                            {createFormError && (
                                <div className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3">
                                    <p className="text-[0.9rem] text-red-700">{createFormError}</p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmittingEvent}
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

            {/* MODAL DETAIL */}
            <DetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />

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
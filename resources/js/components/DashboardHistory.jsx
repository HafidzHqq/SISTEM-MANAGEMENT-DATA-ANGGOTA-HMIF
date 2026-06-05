import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";
import iconQrscan from "../assets/icon-qrscan.png";
import iconManual from "../assets/icon-manual.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconKehadiran from "../assets/icon-grafikkehadiran.png";
import iconHadir from "../assets/icon-hadir.png";
import iconTidakHadir from "../assets/icon-tidakhadir.png";
import iconArchive from "../assets/icon-archive.png";
import iconPrint from "../assets/icon-print.png";
import iconRingkasan from "../assets/icon-ringkasan.png";

const ITEMS_PER_PAGE = 3;
const DEFAULT_LOCATION = "Lokasi belum diatur";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeHistoryItem(item, index) {
    const status = item.status === "present" || item.status === "hadir" ? "hadir" : "tidak_hadir";
    const name = item.name || item.event_name || item.event_title || item.title || "Event belum bernama";
    const location = item.location || item.location_name || item.venue || DEFAULT_LOCATION;

    return {
        ...item,
        id: item.attendance_id || item.event_id || `${name}-${index}`,
        name,
        event_name: name,
        location,
        date: item.date || item.event_date || "-",
        time: item.time || item.event_time || "-",
        checkin_time: item.checkin_time || item.checkin_at || "-",
        method: item.method || "QR Scan",
        status,
        description:
            item.description ||
            "Deskripsi acara belum tersedia dari backend. Data ini dapat dilengkapi lewat form event agar detail acara tampil lebih lengkap.",
    };
}

function getPaginationPages(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage, "...", totalPages];
}

function ChevronLeftIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronRightIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function DetailIcon({ type = "calendar" }) {
    const paths = {
        calendar: "M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
        clock: "M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        pin: "M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z M12 10.5h.01",
        check: "m9 12 2 2 4-5 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
        download: "M12 3v11m0 0 4-4m-4 4-4-4M5 21h14",
        certificate: "M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3 0-1 6 4-2 4 2-1-6",
        map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
    };

    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={paths[type]} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function DashboardHistory() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("semua");
    const [search, setSearch] = useState("");
    const [user, setUser] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveNotice, setArchiveNotice] = useState("");

    const name = user?.name || localStorage.getItem("name") || "Anggota HMIF";
    const nim = user?.nim || "-";
    const division = user?.profile?.departemen || user?.profile?.Departemen || "-";

    const getAuthHeaders = (includeJson = false) => ({
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        Accept: "application/json",
        ...(includeJson ? { "Content-Type": "application/json" } : {}),
    });

    const fetchHistoryData = () =>
        fetch("/api/attendances/me", { headers: getAuthHeaders() })
            .then((res) => res.json())
            .then((data) => setHistoryData(Array.isArray(data) ? data : []));

    React.useEffect(() => {
        fetch("/api/me", { headers: getAuthHeaders() })
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch((err) => console.error("Gagal fetch user:", err));

        fetchHistoryData().catch((err) => console.error("Gagal fetch history:", err));
    }, []);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter, search]);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const handleArchiveOldLogs = async () => {
        setIsArchiving(true);
        setArchiveNotice("");

        try {
            const response = await fetch("/api/attendances/archive-old", {
                method: "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify({ days: 30 }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Gagal mengarsipkan log lama.");
            }

            setArchiveNotice(data.message || "Log lama berhasil diperiksa.");
            await fetchHistoryData();
        } catch (error) {
            console.error("Gagal archive old logs:", error);
            setArchiveNotice(error.message || "Gagal mengarsipkan log lama.");
        } finally {
            setIsArchiving(false);
        }
    };

    const handlePrintSummaryReport = () => {
        const generatedAt = new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
        const rows = normalizedHistory
            .map(
                (item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${escapeHtml(item.name)}</td>
                        <td>${escapeHtml(item.location)}</td>
                        <td>${escapeHtml(item.date)}</td>
                        <td>${escapeHtml(item.time)}</td>
                        <td>${escapeHtml(item.method)}</td>
                        <td><span class="badge ${item.status === "hadir" ? "present" : "absent"}">${item.status === "hadir" ? "Hadir" : "Tidak Hadir"}</span></td>
                    </tr>
                `
            )
            .join("");

        const printWindow = window.open("", "_blank", "width=980,height=720");

        if (!printWindow) {
            window.print();
            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>Ringkasan Kehadiran - ${escapeHtml(name)}</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            padding: 32px;
                            color: #111827;
                            font-family: Arial, sans-serif;
                            background: #ffffff;
                        }
                        .header {
                            display: flex;
                            align-items: flex-start;
                            justify-content: space-between;
                            gap: 24px;
                            border-bottom: 2px solid #166534;
                            padding-bottom: 18px;
                            margin-bottom: 24px;
                        }
                        h1 { margin: 0 0 8px; font-size: 28px; color: #064e3b; }
                        p { margin: 0; color: #4b5563; }
                        .meta { text-align: right; font-size: 13px; line-height: 1.7; }
                        .summary {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 12px;
                            margin-bottom: 24px;
                        }
                        .card {
                            border: 1px solid #d1d5db;
                            border-radius: 12px;
                            padding: 16px;
                        }
                        .label {
                            color: #6b7280;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: .12em;
                            text-transform: uppercase;
                        }
                        .value {
                            margin-top: 8px;
                            color: #064e3b;
                            font-size: 24px;
                            font-weight: 800;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 13px;
                        }
                        th {
                            background: #f3f4f6;
                            color: #374151;
                            text-align: left;
                            font-size: 11px;
                            letter-spacing: .08em;
                            text-transform: uppercase;
                        }
                        th, td {
                            border-bottom: 1px solid #e5e7eb;
                            padding: 11px 10px;
                            vertical-align: top;
                        }
                        .badge {
                            display: inline-block;
                            border-radius: 999px;
                            padding: 4px 9px;
                            font-size: 11px;
                            font-weight: 800;
                            text-transform: uppercase;
                        }
                        .present { background: #dcfce7; color: #15803d; }
                        .absent { background: #fee2e2; color: #dc2626; }
                        @media print {
                            body { padding: 24px; }
                            .summary { break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <section class="header">
                        <div>
                            <h1>Ringkasan Kehadiran Anggota</h1>
                            <p>${escapeHtml(name)} - ${escapeHtml(nim)}</p>
                        </div>
                        <div class="meta">
                            <strong>Departemen:</strong> ${escapeHtml(division)}<br>
                            <strong>Dibuat:</strong> ${escapeHtml(generatedAt)}
                        </div>
                    </section>

                    <section class="summary">
                        <div class="card"><div class="label">Total Kegiatan</div><div class="value">${totalActivities}</div></div>
                        <div class="card"><div class="label">Kehadiran</div><div class="value">${attendanceRate}%</div></div>
                        <div class="card"><div class="label">Hadir</div><div class="value">${totalPresent}</div></div>
                        <div class="card"><div class="label">Tidak Hadir</div><div class="value">${totalAbsent}</div></div>
                    </section>

                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Event</th>
                                <th>Lokasi</th>
                                <th>Tanggal</th>
                                <th>Waktu</th>
                                <th>Metode</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${rows || '<tr><td colspan="7">Belum ada riwayat kehadiran.</td></tr>'}</tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    };

    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
        { label: "History", icon: iconHistory, to: "/dashboard/history" },
        { label: "Profile", icon: iconProfile, to: "/dashboard/profile" },
    ];

    const normalizedHistory = React.useMemo(
        () => historyData.map((item, index) => normalizeHistoryItem(item, index)),
        [historyData]
    );

    const filtered = normalizedHistory.filter((item) => {
        const keyword = search.trim().toLowerCase();
        const matchFilter =
            filter === "semua" ||
            (filter === "hadir" && item.status === "hadir") ||
            (filter === "tidak_hadir" && item.status === "tidak_hadir");
        const matchSearch =
            !keyword ||
            item.name.toLowerCase().includes(keyword) ||
            item.location.toLowerCase().includes(keyword);

        return matchFilter && matchSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(safePage * ITEMS_PER_PAGE, filtered.length);
    const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
    const pageButtons = getPaginationPages(safePage, totalPages);

    const totalActivities = normalizedHistory.length;
    const totalPresent = normalizedHistory.filter((item) => item.status === "hadir").length;
    const totalAbsent = Math.max(totalActivities - totalPresent, 0);
    const attendanceRate = totalActivities > 0 ? ((totalPresent / totalActivities) * 100).toFixed(1) : "0.0";

    const StatusBadge = ({ status }) => (
        <span
            className={`whitespace-nowrap rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase ${
                status === "hadir" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
        >
            {status === "hadir" ? "Hadir" : "Tidak Hadir"}
        </span>
    );

    const filters = [
        { key: "semua", label: "Semua" },
        { key: "hadir", label: "Hadir" },
        { key: "tidak_hadir", label: "Tidak Hadir" },
    ];

    const openDetail = (item) => {
        setSelectedEvent(item);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderSidebar = () => (
        <aside className="hidden md:flex fixed bottom-0 left-0 top-0 z-50 min-h-screen w-[220px] flex-col bg-[#1c5e22] text-white">
            <div className="flex flex-col items-center px-4 pb-5 pt-8">
                <img src={hmifLogo} alt="HMIF" className="h-[72px] w-[72px] rounded-full border-4 border-white/20 object-contain" />
                <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                <p className="mt-0.5 text-center text-[0.62rem] leading-snug text-white/55">
                    Himpunan Mahasiswa Informatika ITERA
                </p>
            </div>
            <hr className="mx-4 border-white/10" />
            <nav className="flex-1 space-y-1 px-3 pt-4">
                {navItems.map((item) => {
                    const isActive = item.to === "/dashboard/history";
                    return (
                        <Link
                            key={item.label}
                            to={item.to}
                            className={`flex items-center gap-3 rounded-xl px-4 py-[10px] text-sm font-medium transition ${
                                isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <img src={item.icon} alt="" className="h-[18px] w-[18px] object-contain opacity-90 brightness-[10]" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{name}</p>
                    <p className="mt-0.5 text-[0.7rem] text-white/55">{nim}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 flex items-center gap-1 text-[0.78rem] text-red-300 transition hover:text-red-200"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );

    const renderTopbar = (title, showBack = false) => (
        <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-gray-100 bg-white px-8 py-[14px] md:flex">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
                        aria-label="Kembali ke riwayat"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}
                <h2 className="text-[1.05rem] font-bold text-gray-800">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-gray-500">{division}</span>
                <div className="h-5 w-px bg-gray-200" />
                <button className="text-gray-400 transition hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3A6 6 0 0 0 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h11Zm0 0v1a3 3 0 1 1-6 0v-1"
                        />
                    </svg>
                </button>
                <img src={fotoProfile} alt="avatar" className="h-9 w-9 rounded-full border-2 border-gray-200 object-cover" />
            </div>
        </header>
    );

    if (selectedEvent) {
        return (
            <div className="flex min-h-screen bg-[#f0f2ee] font-sans">
                {renderSidebar()}
                <div className="flex min-h-screen flex-1 flex-col md:ml-[220px]">
                    <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm md:hidden">
                        <button
                            type="button"
                            onClick={() => setSelectedEvent(null)}
                            className="flex items-center gap-2 text-sm font-bold text-gray-800"
                        >
                            <ChevronLeftIcon />
                            Detail Acara
                        </button>
                    </header>
                    {renderTopbar("Detail Acara", true)}

                    <main className="flex-1 pb-28 md:pb-14">
                        <section className="relative h-[210px] overflow-hidden bg-[#0c2b1a] md:h-[260px]">
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,#062414_0%,#0e3f24_48%,#081a13_100%)]" />
                            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:56px_56px]" />
                            <div className="relative z-10 flex h-full items-start justify-center px-6 pt-10 text-center md:pt-12">
                                <div className="max-w-3xl">
                                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-green-200">HMIF Event</p>
                                    <h1 className="text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-[2.7rem]">
                                        {selectedEvent.name}
                                    </h1>
                                </div>
                            </div>
                        </section>

                        <section className="relative z-20 mx-auto -mt-6 grid max-w-6xl grid-cols-1 gap-6 px-5 md:-mt-10 md:grid-cols-[minmax(0,1fr)_320px] md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="flex h-full flex-col gap-6">
                                <article className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] md:p-8">
                                    <div className="mb-5 flex flex-wrap items-center gap-3">
                                        <span className="rounded-md bg-green-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                                            {selectedEvent.method}
                                        </span>
                                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <DetailIcon type="calendar" />
                                            {selectedEvent.date}
                                        </span>
                                    </div>
                                    <h2 className="mb-8 text-3xl font-extrabold leading-tight text-gray-900 md:text-[2.15rem]">
                                        {selectedEvent.name}
                                    </h2>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                                <DetailIcon type="clock" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Waktu</p>
                                                <p className="text-sm text-gray-600">{selectedEvent.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                                <DetailIcon type="pin" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Lokasi</p>
                                                <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>

                                <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:flex-1 md:p-8">
                                    <h3 className="mb-5 text-2xl font-extrabold text-gray-900">Deskripsi Acara</h3>
                                    <p className="whitespace-pre-line text-base leading-8 text-gray-700">{selectedEvent.description}</p>
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-auto md:pt-8">
                                        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1c5e22] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174d1d]">
                                            <DetailIcon type="download" />
                                            Download Materials
                                        </button>
                                        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50">
                                            <DetailIcon type="certificate" />
                                            View Certificate
                                        </button>
                                    </div>
                                </article>
                            </div>

                            <aside className="space-y-6 md:pt-2">
                                <article className="rounded-2xl border border-green-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                                                selectedEvent.status === "hadir" ? "bg-green-600 text-white" : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            <DetailIcon type="check" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xl font-extrabold text-gray-900">
                                                {selectedEvent.status === "hadir" ? "Sudah Hadir" : "Tidak Hadir"}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-gray-600">Check-in pukul {selectedEvent.checkin_time || "-"}</p>
                                        </div>
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-gray-400">Narasumber</p>
                                    <div className="space-y-3">
                                        {["Panitia HMIF", "Koordinator Acara"].map((speaker, index) => (
                                            <div key={speaker} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1c5e22] text-sm font-extrabold text-white">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-extrabold text-gray-900">{speaker}</p>
                                                    <p className="text-xs text-gray-500">HMIF ITERA</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                                    <p className="p-5 text-xs font-bold uppercase tracking-[0.22em] text-gray-500">Peta Lokasi</p>
                                    <div className="relative h-48 bg-gray-200">
                                        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(45deg,#d1d5db_25%,transparent_25%),linear-gradient(-45deg,#d1d5db_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d1d5db_75%),linear-gradient(-45deg,transparent_75%,#d1d5db_75%)] [background-position:0_0,0_12px,12px_-12px,-12px_0] [background-size:24px_24px]" />
                                        <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-500/25 text-green-700">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white">
                                                <DetailIcon type="pin" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50">
                                            <DetailIcon type="map" />
                                            Buka di Google Maps
                                        </button>
                                    </div>
                                </article>
                            </aside>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f0f2ee] font-sans">
            {renderSidebar()}
            <div className="flex min-h-screen flex-1 flex-col md:ml-[220px]">
                <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm md:hidden">
                    <div className="flex items-center gap-2">
                        <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                        <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                    </div>
                    <Link to="/dashboard/profile">
                        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
                        </svg>
                    </Link>
                </header>
                {renderTopbar("History")}

                <main className="flex-1 px-5 py-7 pb-28 md:px-8 md:py-8 md:pb-10">
                    <h1 className="mb-1 text-[1.6rem] font-extrabold text-gray-900 md:text-[1.9rem]">Riwayat Kehadiran</h1>
                    <p className="mb-6 hidden text-sm text-gray-500 md:block">Pantau dan kelola log kehadiran anda secara real-time.</p>
                    <hr className="mb-5 border-gray-200 md:hidden" />

                    <div className="mb-6 hidden grid-cols-4 gap-4 md:grid">
                        <div className="rounded-2xl border-l-4 border-green-500 bg-white p-5 shadow-sm">
                            <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gray-400">Total Kegiatan</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">{totalActivities}</span>
                                <img src={iconKegiatan} alt="" className="h-6 w-6 object-contain opacity-70" />
                            </div>
                        </div>
                        <div className="rounded-2xl border-l-4 border-green-500 bg-white p-5 shadow-sm">
                            <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gray-400">Kehadiran (%)</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">{attendanceRate}%</span>
                                <img src={iconKehadiran} alt="" className="h-6 w-6 object-contain opacity-70" />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gray-400">Hadir</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">{totalPresent}</span>
                                <img src={iconHadir} alt="" className="h-6 w-6 object-contain" />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="mb-2 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gray-400">Tidak Hadir</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-extrabold text-gray-900">{totalAbsent}</span>
                                <img src={iconTidakHadir} alt="" className="h-6 w-6 object-contain" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative max-w-sm flex-1">
                                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari kegiatan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-400"
                                />
                            </div>
                            <div className="flex gap-2">
                                {filters.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFilter(item.key)}
                                        className={`rounded-full px-4 py-1.5 text-[0.78rem] font-semibold transition ${
                                            filter === item.key ? "bg-green-600 text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Event Name", "Location", "Date", "Time", "Method", "Status", "Aksi"].map((heading) => (
                                            <th key={heading} className="px-2 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.15em] text-gray-400">
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-2 py-10 text-center text-sm text-gray-500">
                                                Belum ada riwayat kehadiran.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-50 transition hover:bg-gray-50/60">
                                                <td className="px-2 py-4 font-semibold text-gray-800">{item.name}</td>
                                                <td className="px-2 py-4 text-[0.7rem] font-bold uppercase tracking-wider text-gray-500">{item.location}</td>
                                                <td className="px-2 py-4 text-gray-600">{item.date}</td>
                                                <td className="px-2 py-4 text-gray-600">{item.time}</td>
                                                <td className="px-2 py-4 text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <img src={item.method === "QR Scan" ? iconQrscan : iconManual} alt="" className="h-4 w-4 object-contain" />
                                                        {item.method}
                                                    </span>
                                                </td>
                                                <td className="px-2 py-4">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-2 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetail(item)}
                                                        className="rounded-lg border border-gray-200 px-4 py-2 font-medium text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                                    >
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-4 md:hidden">
                            {paginated.length === 0 ? (
                                <div className="rounded-2xl border border-gray-100 p-6 text-center text-sm text-gray-500">Belum ada riwayat kehadiran.</div>
                            ) : (
                                paginated.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => openDetail(item)}
                                        className="w-full rounded-2xl border border-gray-100 p-4 text-left transition hover:bg-gray-50"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                <p className="text-[0.75rem] uppercase tracking-wider text-gray-400">{item.location}</p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div className="mt-3 flex items-center gap-5 text-[0.8rem] text-gray-500">
                                            <span>{item.date}</span>
                                            <span>{item.time}</span>
                                        </div>
                                        <p className="mt-3 text-[0.75rem] text-gray-400">Metode: {item.method}</p>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex}-{endIndex} of {filtered.length} results
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                    disabled={safePage === 1}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Halaman sebelumnya"
                                >
                                    <ChevronLeftIcon />
                                </button>
                                {pageButtons.map((page, index) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                                                safePage === page
                                                    ? "bg-green-600 text-white"
                                                    : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                    disabled={safePage === totalPages}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Halaman berikutnya"
                                >
                                    <ChevronRightIcon />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1 rounded-2xl px-6 py-5 text-white" style={{ background: "linear-gradient(135deg, #3db53d 0%, #1c5e22 100%)" }}>
                            <p className="mb-3 text-[0.78rem] font-semibold text-white/80">Ringkasan Kehadiran</p>
                            <div className="flex items-end gap-6">
                                <div>
                                    <span className="text-[1.8rem] font-extrabold leading-none">{attendanceRate}%</span>
                                    <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/55">Kehadiran</p>
                                </div>
                                <div>
                                    <span className="text-[1.8rem] font-extrabold leading-none">{totalActivities}</span>
                                    <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-white/55">Kegiatan</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden min-w-[320px] flex-col gap-2 md:flex">
                            <div className="flex items-stretch gap-3 md:flex-col xl:flex-row">
                                <button
                                    type="button"
                                    onClick={handleArchiveOldLogs}
                                    disabled={isArchiving}
                                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <img src={iconArchive} alt="" className="h-4 w-4 object-contain" />
                                    {isArchiving ? "Archiving..." : "Archive Old Logs"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrintSummaryReport}
                                    className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                                    style={{ background: "linear-gradient(135deg, #3db53d 0%, #228b22 100%)" }}
                                >
                                    <img src={iconPrint} alt="" className="h-4 w-4 object-contain brightness-[10]" />
                                    Print Summary Report
                                </button>
                            </div>
                            {archiveNotice && (
                                <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                                    {archiveNotice}
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-[#1c5e22] md:hidden">
                {navItems.map((item) => {
                    const isActive = item.to === "/dashboard/history";
                    return (
                        <Link key={item.label} to={item.to} className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 ${isActive ? "bg-white/15" : ""}`}>
                            <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-[10]" />
                            <span className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-white/80">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconSearch from "../assets/icon-search.png";
import iconTotalAnggota from "../assets/assets dash admin/Icon-totalanggota.png";
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

const METRIC_CONFIG = [
    {
        label: "Total Anggota",
        key: "total",
        help: "Live",
        icon: iconTotalAnggota,
        valueClass: "text-[#1f5e22]",
        accentClass: "bg-[#1f5e22]",
    },
    {
        label: "Anggota Muda",
        key: "muda",
        help: "",
        iconType: "person",
        iconClass: "text-[#f5bf17]",
        iconBgClass: "bg-amber-50",
        valueClass: "text-[#f5bf17]",
        accentClass: "bg-[#f5bf17]",
    },
    {
        label: "Anggota Tetap",
        key: "tetap",
        help: "",
        iconType: "person",
        iconClass: "text-emerald-600",
        iconBgClass: "bg-emerald-50",
        valueClass: "text-emerald-600",
        accentClass: "bg-emerald-500",
    },
    {
        label: "Luar Biasa",
        key: "luarBiasa",
        help: "",
        iconType: "person",
        iconClass: "text-blue-500",
        iconBgClass: "bg-blue-50",
        valueClass: "text-blue-500",
        accentClass: "bg-blue-500",
    },
];

const statusClasses = {
    TETAP: "bg-emerald-100 text-emerald-700",
    MUDA: "bg-amber-100 text-amber-700",
    "LUAR BIASA": "bg-blue-100 text-blue-600",
    "NON-ANGGOTA": "bg-slate-200 text-slate-600",
};

const JABATAN_OPTIONS = [
    "-",
    "Ketua Departemen",
    "Ketua Divisi",
    "Sekertaris Departemen",
    "Staf Ahli",
    "Staf",
];

const STATUS_OPTIONS = [
    { value: "Muda", label: "Anggota Muda" },
    { value: "Tetap", label: "Anggota Tetap" },
    { value: "Luar Biasa", label: "Luar Biasa" },
    { value: "Non-Anggota", label: "Non-Anggota" },
];

const normalizeJabatan = (value) => {
    const normalized = String(value ?? "").trim();
    const lower = normalized.toLowerCase();

    if (!normalized || normalized === "-") return "-";
    if (lower === "staff") return "Staf";

    return JABATAN_OPTIONS.find((option) => option.toLowerCase() === lower) || normalized;
};

const toEditableJabatan = (value) => {
    const normalized = normalizeJabatan(value);

    return JABATAN_OPTIONS.includes(normalized) ? normalized : "-";
};

const ITEMS_PER_PAGE = 5;

const getPaginationPages = (currentPage, totalPages) => {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

const csvEscape = (value) => {
    const normalized = String(value ?? "");
    const safeValue = /^[=+\-@]/.test(normalized.trimStart()) ? `'${normalized}` : normalized;
    return `"${safeValue.replace(/"/g, '""')}"`;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const normalizeMemberStatus = (value) => {
    const normalized = String(value ?? "").trim().toUpperCase();

    if (normalized.includes("NON")) return "NON-ANGGOTA";
    if (normalized.includes("TETAP")) return "TETAP";
    if (normalized.includes("LUAR")) return "LUAR BIASA";
    if (normalized.includes("MUDA")) return "MUDA";

    return "MUDA";
};

const toApiMemberStatus = (value) => {
    const normalized = normalizeMemberStatus(value);

    if (normalized === "TETAP") return "Tetap";
    if (normalized === "LUAR BIASA") return "Luar Biasa";
    if (normalized === "NON-ANGGOTA") return "Non-Anggota";

    return "Muda";
};

const getStatusBadgeLabel = (status) => {
    if (status === "TETAP") return "ANGGOTA TETAP";
    if (status === "MUDA") return "ANGGOTA MUDA";
    if (status === "NON-ANGGOTA") return "NON-ANGGOTA";

    return "LUAR BIASA";
};

const mapMemberRow = (member, index) => {
    const profile = member.member_profile || member.memberProfile || member.profile || {};

    return {
        id: member.user_id ?? member.id ?? index + 1,
        nim: member.nim ?? "-",
        nama: member.name ?? member.nama ?? "-",
        kontak: profile.no_telepon ?? profile.no_telp ?? profile.phone ?? member.no_telepon ?? "-",
        angkatan: profile.angkatan ?? member.angkatan ?? "-",
        divisi: profile.departemen ?? profile.Departemen ?? profile.divisi ?? member.departemen ?? "-",
        jabatan: normalizeJabatan(profile.jabatan ?? member.jabatan),
        status: normalizeMemberStatus(profile.status_keanggotaan ?? member.status_keanggotaan),
        email: member.email ?? "-",
    };
};

const formatNumber = (value) => new Intl.NumberFormat("id-ID").format(value);

function PersonMetricIcon({ className = "" }) {
    return (
        <svg className={`h-5 w-5 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function MetricCard({ metric }) {
    return (
        <div className="rounded-[12px] bg-white p-6 shadow-[0_8px_18px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metric.iconBgClass || "bg-slate-50"}`}>
                    {metric.iconType === "person" ? (
                        <PersonMetricIcon className={metric.iconClass} />
                    ) : (
                        <img src={metric.icon} alt={metric.label} className="h-5 w-5 object-contain" />
                    )}
                </div>
                {metric.help ? (
                    <span className="text-xs font-semibold text-emerald-600">{metric.help}</span>
                ) : (
                    <span className="text-xs text-transparent">.</span>
                )}
            </div>
            <p className="mt-4 text-[0.8rem] font-medium uppercase tracking-[0.18em] text-slate-700">{metric.label}</p>
            <h2 className={`mt-1 text-[2.3rem] font-extrabold leading-none ${metric.valueClass}`}>{metric.value}</h2>
            <div className={`mt-5 h-1.5 rounded-full ${metric.accentClass}`} style={{ width: metric.accentWidth }} />
        </div>
    );
}

export default function DashboardAdminAnggota() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const [search, setSearch] = useState("");
    const [division, setDivision] = useState("Semua Departemen");
    const [year, setYear] = useState("Semua Angkatan");
    const [status, setStatus] = useState("Semua Status");
    const [rows, setRows] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailMember, setDetailMember] = useState(null);
    const [editMemberForm, setEditMemberForm] = useState({
        departemen: "",
        jabatan: "",
        no_telepon: "",
        status_keanggotaan: "Muda",
    });
    const [isSavingMember, setIsSavingMember] = useState(false);
    const [isMemberSaved, setIsMemberSaved] = useState(false);
    const [isApiBacked, setIsApiBacked] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [memberActionError, setMemberActionError] = useState("");

    const userName = localStorage.getItem("name") || "Admin User";
    const nim = localStorage.getItem("nim") || "124140056";

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            const matchesSearch = search ? `${row.nama} ${row.nim}`.toLowerCase().includes(search.toLowerCase()) : true;
            const matchesDivision = division === "Semua Departemen" || row.divisi === division;
            const matchesYear = year === "Semua Angkatan" || String(row.angkatan) === String(year);
            const matchesStatus = status === "Semua Status" || row.status === status;
            return matchesSearch && matchesDivision && matchesYear && matchesStatus;
        });
    }, [rows, search, division, year, status]);

    React.useEffect(() => {
        let isActive = true;

        const fetchMembers = async () => {
            const token = localStorage.getItem("auth_token");
            if (!token) return;

            setIsLoadingMembers(true);
            setMemberActionError("");

            try {
                const response = await fetch("/api/members", {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Gagal mengambil data anggota.");
                }

                const data = await response.json();
                if (!isActive) return;

                setRows(Array.isArray(data) ? data.map(mapMemberRow) : []);
                setSelectedIds([]);
                setCurrentPage(1);
                setIsApiBacked(true);
            } catch (error) {
                if (!isActive) return;
                setIsApiBacked(false);
                setMemberActionError(error.message || "Gagal mengambil data anggota.");
            } finally {
                if (isActive) {
                    setIsLoadingMembers(false);
                }
            }
        };

        fetchMembers();
        window.addEventListener("focus", fetchMembers);

        return () => {
            isActive = false;
            window.removeEventListener("focus", fetchMembers);
        };
    }, []);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = filteredRows.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(safePage * ITEMS_PER_PAGE, filteredRows.length);
    const paginatedRows = filteredRows.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
    const paginationPages = getPaginationPages(safePage, totalPages);
    const visibleIds = paginatedRows.map((row) => row.id);
    const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    const memberMetrics = useMemo(() => {
        const total = rows.length;
        const counts = {
            total,
            muda: rows.filter((row) => row.status === "MUDA").length,
            tetap: rows.filter((row) => row.status === "TETAP").length,
            luarBiasa: rows.filter((row) => row.status === "LUAR BIASA").length,
        };

        return METRIC_CONFIG.map((metric) => {
            const value = counts[metric.key] ?? 0;
            const percentage = metric.key === "total" || total === 0 ? 100 : Math.max(12, Math.round((value / total) * 100));

            return {
                ...metric,
                value: formatNumber(value),
                accentWidth: `${percentage}%`,
            };
        });
    }, [rows]);

    React.useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [search, division, year, status]);

    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleToggleRow = (id) => {
        setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    const handleToggleAll = () => {
        if (visibleIds.length === 0) return;

        setSelectedIds((current) => {
            const allVisibleSelected = visibleIds.every((id) => current.includes(id));
            return allVisibleSelected
                ? current.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...current, ...visibleIds]));
        });
    };

    const handleExportCsv = () => {
        const headers = ["No", "NIM", "Nama", "Kontak", "Email", "Angkatan", "Departemen", "Jabatan", "Status"];
        const csvRows = [
            headers.map(csvEscape).join(","),
            ...filteredRows.map((row, index) =>
                [
                    index + 1,
                    row.nim,
                    row.nama,
                    row.kontak,
                    row.email,
                    row.angkatan,
                    row.divisi,
                    row.jabatan,
                    row.status,
                ].map(csvEscape).join(",")
            ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "data-anggota-hmif.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteMember = async (id) => {
        const member = rows.find((row) => row.id === id);
        if (!member) return;

        const confirmed = window.confirm(`Hapus anggota ${member.nama}?`);
        if (!confirmed) return;

        setMemberActionError("");

        if (isApiBacked) {
            try {
                const response = await fetch(`/api/members/${id}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Gagal menghapus anggota.");
                }
            } catch (error) {
                setMemberActionError(error.message || "Gagal menghapus anggota.");
                return;
            }
        }

        setRows((current) => current.filter((row) => row.id !== id));
        setSelectedIds((current) => current.filter((item) => item !== id));

        if (detailMember?.id === id) {
            setDetailMember(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = window.confirm(`Hapus ${selectedIds.length} anggota terpilih?`);
        if (!confirmed) return;

        setMemberActionError("");

        if (isApiBacked) {
            const failedIds = [];

            for (const id of selectedIds) {
                try {
                    const response = await fetch(`/api/members/${id}`, {
                        method: "DELETE",
                        headers: getAuthHeaders(),
                    });

                    if (!response.ok) {
                        failedIds.push(id);
                    }
                } catch {
                    failedIds.push(id);
                }
            }

            const deletedIds = selectedIds.filter((id) => !failedIds.includes(id));
            setRows((current) => current.filter((row) => !deletedIds.includes(row.id)));
            setSelectedIds(failedIds);

            if (failedIds.length > 0) {
                setMemberActionError(`${failedIds.length} anggota gagal dihapus. Coba ulangi untuk data yang masih terpilih.`);
            }

            return;
        }

        setRows((current) => current.filter((row) => !selectedIds.includes(row.id)));
        setSelectedIds([]);
    };

    const handleOpenDetail = (member) => {
        setDetailMember(member);
        setEditMemberForm({
            departemen: member.divisi === "-" ? "" : member.divisi,
            jabatan: toEditableJabatan(member.jabatan),
            no_telepon: member.kontak === "-" ? "" : member.kontak,
            status_keanggotaan: toApiMemberStatus(member.status),
        });
        setIsMemberSaved(false);
        setMemberActionError("");
    };

    const handleCloseDetail = () => {
        setDetailMember(null);
        setIsMemberSaved(false);
    };

    const handleEditMemberChange = (event) => {
        const { name, value } = event.target;
        setIsMemberSaved(false);
        setEditMemberForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSaveMember = async () => {
        if (!detailMember) return;

        setIsSavingMember(true);
        setIsMemberSaved(false);
        setMemberActionError("");

        const payload = {
            departemen: editMemberForm.departemen.trim(),
            jabatan: editMemberForm.jabatan.trim(),
            no_telepon: editMemberForm.no_telepon.trim(),
            status_keanggotaan: editMemberForm.status_keanggotaan,
        };

        try {
            const response = await fetch(`/api/members/${detailMember.id}`, {
                method: "PUT",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(responseData.message || "Gagal menyimpan perubahan anggota.");
            }

            const updatedRow = mapMemberRow(responseData.data, detailMember.id);

            setRows((current) => current.map((row) => (row.id === detailMember.id ? updatedRow : row)));
            setDetailMember(updatedRow);
            setIsMemberSaved(true);
        } catch (error) {
            setMemberActionError(error.message || "Gagal menyimpan perubahan anggota.");
        } finally {
            setIsSavingMember(false);
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#e7f5e5] font-sans text-slate-900">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-[252px] min-h-screen bg-[#185b21] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-7 pb-5 px-4">
                        <img
                            src={hmifLogo}
                            alt="HMIF"
                            className="h-20 w-20 rounded-full object-contain border-4 border-white/15 shadow-lg shadow-black/20"
                        />
                        <p className="mt-3 text-xl font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] leading-snug text-white/65 text-center">
                            Himpunan Mahasiswa Informatika<br />ITERA
                        </p>
                    </div>

                    <nav className="flex-1 px-4 pt-2 space-y-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`group relative flex items-center gap-3 px-4 py-3.5 text-[0.98rem] font-medium transition ${
                                        isActive
                                            ? "bg-white/10 text-white before:absolute before:right-0 before:top-0 before:h-full before:w-1 before:bg-[#7bd02c]"
                                            : "text-white/75 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
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
                                    <p className="truncate text-[0.7rem] text-white/55">{nim}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col md:ml-[252px]">
                    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white px-4 py-4 md:hidden">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 rounded-full object-contain" />
                            <span className="text-sm font-bold text-slate-800">HMIF ITERA</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-semibold text-slate-700">
                            Logout
                        </button>
                    </header>

                    <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-slate-200/70 bg-white px-8 py-4 md:flex">
                        <div>
                            <p className="text-[1.05rem] font-semibold text-slate-800">Member Management</p>
                        </div>
                        <div className="flex items-center gap-4 text-slate-600">
                            <button className="transition hover:text-slate-900" aria-label="Notifikasi">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>
                            <span className="h-7 w-px bg-slate-300" />
                            <button onClick={handleLogout} className="flex items-center gap-2 text-[0.98rem] transition hover:text-slate-900">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17l5-5m0 0l-5-5m5 5H9m4 8a8 8 0 100-16" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-28 md:pb-10">
                        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h1 className="text-[2.25rem] font-extrabold tracking-tight text-slate-900 sm:text-[2.7rem]">Manajemen Anggota</h1>
                                <p className="mt-2 text-[1rem] text-slate-700">Kelola data seluruh anggota aktif dan luar biasa HMIF.</p>
                            </div>
                        </div>

                        <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                            {memberMetrics.map((metric) => (
                                <MetricCard key={metric.label} metric={metric} />
                            ))}
                        </div>

                        <div className="mb-8 rounded-[10px] bg-[#4faa19] p-4 shadow-sm">
                            <div className="grid items-center gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.45fr)_minmax(180px,0.85fr)_minmax(190px,0.85fr)_minmax(175px,0.8fr)_auto]">
                                <div className="relative min-w-0">
                                    <img src={iconSearch} alt="" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-60" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama atau NIM..."
                                        className="h-12 w-full rounded-[6px] border border-white/20 bg-white/95 pl-12 pr-4 text-[0.95rem] text-slate-700 shadow-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-white/40"
                                    />
                                </div>
                                <select
                                    value={division}
                                    onChange={(e) => setDivision(e.target.value)}
                                    className="h-12 w-full min-w-0 rounded-[6px] border border-white/20 bg-white/95 px-4 text-[0.95rem] text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-white/40"
                                >
                                    <option>Semua Departemen</option>
                                    <option>Technopreneur</option>
                                    <option>Eksternal</option>
                                    <option>Internal</option>
                                    <option>Minat Bakat</option>
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="h-12 w-full min-w-0 rounded-[6px] border border-white/20 bg-white/95 px-4 text-[0.95rem] text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-white/40"
                                >
                                    <option>Semua Angkatan</option>
                                    <option>2020</option>
                                    <option>2021</option>
                                    <option>2022</option>
                                    <option>2023</option>
                                    <option>2024</option>
                                </select>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="h-12 w-full min-w-0 rounded-[6px] border border-white/20 bg-white/95 px-4 text-[0.95rem] text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-white/40"
                                >
                                    <option>Semua Status</option>
                                    <option>TETAP</option>
                                    <option>MUDA</option>
                                    <option>LUAR BIASA</option>
                                    <option>NON-ANGGOTA</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setDivision("Semua Departemen");
                                        setYear("Semua Angkatan");
                                        setStatus("Semua Status");
                                        setCurrentPage(1);
                                        setSelectedIds([]);
                                    }}
                                    className="inline-flex h-12 min-w-[112px] items-center justify-center gap-2 rounded-[6px] px-4 text-[0.95rem] font-semibold text-white transition hover:bg-white/10"
                                >
                                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
                                    </svg>
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-[10px] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/70 sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div className="text-sm text-slate-700">
                                {isLoadingMembers ? "Memuat data anggota..." : `Terpilih: ${selectedIds.length} baris`}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    disabled={isLoadingMembers || filteredRows.length === 0}
                                    className="inline-flex items-center gap-2 rounded-[6px] border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M6 11v6m6-6v6m6-6v6M5 19h14" />
                                    </svg>
                                    Export CSV
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    disabled={isLoadingMembers || selectedIds.length === 0}
                                    className="inline-flex items-center gap-2 rounded-[6px] border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-8 0h10l-1 12H8L7 7z" />
                                    </svg>
                                    Hapus Massal
                                </button>
                            </div>
                        </div>

                        {memberActionError && (
                            <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                {memberActionError}
                            </div>
                        )}

                        <div className="overflow-hidden rounded-[10px] bg-white shadow-sm ring-1 ring-slate-200/70">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1120px] table-fixed text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-[#fafafa] text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                                            <th className="w-[52px] py-4 pl-5 pr-2">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                                    checked={isAllVisibleSelected}
                                                    onChange={handleToggleAll}
                                                />
                                            </th>
                                            <th className="w-[125px] py-4 px-4">NIM</th>
                                            <th className="w-[190px] py-4 px-4">NAMA</th>
                                            <th className="w-[225px] py-4 px-4">KONTAK</th>
                                            <th className="w-[100px] py-4 px-4">ANGKATAN</th>
                                            <th className="w-[145px] py-4 px-4">DEPARTEMEN</th>
                                            <th className="w-[155px] py-4 px-4">JABATAN</th>
                                            <th className="w-[135px] py-4 px-4">STATUS</th>
                                            <th className="w-[90px] py-4 px-4 text-right">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRows.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                                                    Tidak ada anggota yang cocok dengan filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRows.map((row) => (
                                            <tr key={row.id} className="border-b border-slate-100 bg-white hover:bg-slate-50/80">
                                                <td className="py-5 pl-5 pr-2 align-middle">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                                        checked={selectedIds.includes(row.id)}
                                                        onChange={() => handleToggleRow(row.id)}
                                                    />
                                                </td>
                                                <td className="py-5 px-4 align-middle font-medium text-[#8fb9ff]">{row.nim}</td>
                                                <td className="py-5 px-4 align-middle font-semibold text-slate-800">
                                                    <div className="truncate" title={row.nama}>{row.nama}</div>
                                                </td>
                                                <td className="py-5 px-4 align-middle text-slate-600">
                                                    <div className="truncate" title={row.kontak}>{row.kontak}</div>
                                                    <div className="truncate text-[0.78rem] text-slate-400" title={row.email}>{row.email}</div>
                                                </td>
                                                <td className="py-5 px-4 align-middle text-slate-700">{row.angkatan}</td>
                                                <td className="py-5 px-4 align-middle text-slate-700">
                                                    <div className="truncate" title={row.divisi}>{row.divisi}</div>
                                                </td>
                                                <td className="py-5 px-4 align-middle text-slate-700">
                                                    <div className="truncate" title={row.jabatan}>{row.jabatan}</div>
                                                </td>
                                                <td className="py-5 px-4 align-middle">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${statusClasses[row.status]}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-4 align-middle">
                                                    <div className="flex items-center justify-end gap-3 text-slate-400">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(row)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 transition"
                                                            aria-label={`Edit ${row.nama}`}
                                                        >
                                                            <svg className="h-4.5 w-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteMember(row.id)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50 transition"
                                                            aria-label={`Hapus ${row.nama}`}
                                                        >
                                                            <svg className="h-4.5 w-4.5 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-8 0h10l-1 12H8L7 7z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                                <div>Menampilkan {startIndex} - {endIndex} dari {filteredRows.length} data</div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                        disabled={safePage === 1}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Halaman sebelumnya"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 18-6-6 6-6" />
                                        </svg>
                                    </button>
                                    {paginationPages.map((page, index) =>
                                        page === "..." ? (
                                            <span key={`ellipsis-${index}`} className="px-1 text-slate-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-8 min-w-8 rounded-[4px] px-2 font-semibold transition ${
                                                    safePage === page
                                                        ? "bg-[#1f5e22] text-white"
                                                        : "text-slate-600 hover:bg-slate-100"
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
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Halaman berikutnya"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {detailMember && (
                            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 px-4 py-6 backdrop-blur-sm">
                                <div className="relative mx-auto mt-10 w-full max-w-[780px] rounded-[18px] bg-white px-6 py-5 shadow-[0_20px_55px_rgba(15,23,42,0.28)] sm:px-7 sm:py-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseDetail}
                                        className="absolute right-5 top-5 text-slate-600 transition hover:text-slate-900"
                                        aria-label="Tutup detail anggota"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <div className="grid gap-5 md:grid-cols-[130px_1fr] md:items-start">
                                        <div className="relative h-[110px] w-[110px] overflow-hidden rounded-[14px] border border-slate-200 bg-slate-100 shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
                                            <img
                                                src={fotoProfile}
                                                alt={detailMember.nama}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="pt-1">
                                            <h2 className="text-[2rem] font-medium leading-tight text-[#1f4b2a] sm:text-[2.15rem]">
                                                {detailMember.nama}
                                            </h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[1.02rem] text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3v18M3 9h18" />
                                                    </svg>
                                                    {detailMember.nim}
                                                </span>
                                            </div>
                                            <div className="mt-4 inline-flex rounded-full bg-[#f5bf17] px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white shadow-sm">
                                                {getStatusBadgeLabel(detailMember.status)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <label className="block rounded-[12px] bg-[#f5f5f5] px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-500">DEPARTEMEN</span>
                                            <select
                                                name="departemen"
                                                value={editMemberForm.departemen}
                                                onChange={handleEditMemberChange}
                                                className="mt-3 h-[46px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[0.95rem] text-slate-800 outline-none focus:border-[#1f5e22] focus:ring-2 focus:ring-emerald-100"
                                            >
                                                <option value="">Belum Ditentukan</option>
                                                <option value="Technopreneur">Technopreneur</option>
                                                <option value="Eksternal">Eksternal</option>
                                                <option value="Internal">Internal</option>
                                                <option value="Minat Bakat">Minat Bakat</option>
                                                <option value="PSDA">PSDA</option>
                                                <option value="Kominfo">Kominfo</option>
                                                <option value="Akbes">Akbes</option>
                                            </select>
                                        </label>

                                        <label className="block rounded-[12px] bg-[#f5f5f5] px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-500">JABATAN</span>
                                            <select
                                                name="jabatan"
                                                value={editMemberForm.jabatan}
                                                onChange={handleEditMemberChange}
                                                className="mt-3 h-[46px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[0.95rem] text-slate-800 outline-none focus:border-[#1f5e22] focus:ring-2 focus:ring-emerald-100"
                                            >
                                                {JABATAN_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="block rounded-[12px] bg-[#f5f5f5] px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-500">NOMOR TELEPON</span>
                                            <input
                                                name="no_telepon"
                                                type="text"
                                                value={editMemberForm.no_telepon}
                                                onChange={handleEditMemberChange}
                                                placeholder="Contoh: 081234567890"
                                                className="mt-3 h-[46px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[0.95rem] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#1f5e22] focus:ring-2 focus:ring-emerald-100"
                                            />
                                        </label>

                                        <label className="block rounded-[12px] bg-[#f5f5f5] px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-slate-500">STATUS KEANGGOTAAN</span>
                                            <select
                                                name="status_keanggotaan"
                                                value={editMemberForm.status_keanggotaan}
                                                onChange={handleEditMemberChange}
                                                className="mt-3 h-[46px] w-full rounded-[8px] border border-slate-200 bg-white px-3 text-[0.95rem] text-slate-800 outline-none focus:border-[#1f5e22] focus:ring-2 focus:ring-emerald-100"
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="mt-6 border-t border-slate-200 pt-6">
                                        <div className="grid gap-3 sm:grid-cols-[1fr_188px]">
                                            <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                Email tidak diubah dari panel ini: <span className="font-semibold text-slate-800">{detailMember.email}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleSaveMember}
                                                disabled={isSavingMember}
                                                className={`inline-flex h-[48px] items-center justify-center gap-2 rounded-[10px] px-4 text-[0.95rem] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    isMemberSaved
                                                        ? "bg-emerald-500 hover:bg-emerald-500"
                                                        : "bg-[#1f5e22] hover:bg-[#17491b]"
                                                }`}
                                            >
                                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {isSavingMember ? "Menyimpan..." : isMemberSaved ? "Tersimpan" : "Simpan"}
                                            </button>
                                        </div>
                                        {isMemberSaved && (
                                            <div className="mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                                Perubahan data anggota berhasil disimpan.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                        <span>HMIF ITERA • MEMBER RECORDS DIVISION</span>
                                        <span className="text-slate-500">LAST UPDATED: OCT 24, 2023</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#185b21] md:hidden">
                <div className="grid grid-cols-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex flex-col items-center justify-center gap-1 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.12em] transition ${
                                    isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white"
                                }`}
                            >
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

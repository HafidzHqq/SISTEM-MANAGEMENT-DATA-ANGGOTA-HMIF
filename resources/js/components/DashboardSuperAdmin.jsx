import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoHmif from "../assets/logo-hmif.png";
import profilePhoto from "../assets/fotoprofile.png";

export default function DashboardSuperAdmin() {
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [statsError, setStatsError] = useState("");
    const [admins, setAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [adminsError, setAdminsError] = useState("");
    const [members, setMembers] = useState([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
    const [auditLogsError, setAuditLogsError] = useState("");
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const menus = [
        { key: "dashboard", label: "Dashboard", icon: "grid" },
        { key: "admins", label: "Admin Management", icon: "user" },
        { key: "audit", label: "Audit Logs", icon: "log" },
    ];

    const getTitle = () => {
        if (activeMenu === "admins") return "Admin Management";
        if (activeMenu === "audit") return "Audit Logs";
        return "Dashboard";
    };

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            setStatsError("");

            const token = localStorage.getItem("auth_token");

            const response = await fetch("/api/dashboard/attendance-statistics", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil statistik dashboard");
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            setStatsError(error.message);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            setLoadingAdmins(true);
            setAdminsError("");

            const token = localStorage.getItem("auth_token");

            const response = await fetch("/api/admins", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Gagal mengambil data admin");
            }

            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            setAdminsError(error.message);
        } finally {
            setLoadingAdmins(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem("auth_token");

            const response = await fetch("/api/members", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Gagal mengambil data anggota");
            }

            const data = await response.json();
            setMembers(data);
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            setLoadingAuditLogs(true);
            setAuditLogsError("");

            const token = localStorage.getItem("auth_token");

            const response = await fetch("/api/audit-logs", {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Gagal mengambil audit logs");
            }

            const data = await response.json();
            setAuditLogs(data);
        } catch (error) {
            setAuditLogsError(error.message);
        } finally {
            setLoadingAuditLogs(false);
        }
    };

    const handleToggleAdminStatus = async (adminId) => {
        const confirmed = window.confirm("Ubah status admin ini?");

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");

            const response = await fetch(`/api/admins/${adminId}/status`, {
                method: "PATCH",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Gagal mengubah status admin");
            }

            await fetchAdmins();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        const confirmed = window.confirm("Turunkan admin ini menjadi anggota?");

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");

            const response = await fetch(`/api/admins/${adminId}/demote`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Gagal menurunkan admin menjadi anggota");
            }

            await fetchAdmins();
            await fetchMembers();
        } catch (error) {
            alert(error.message);
        }
    };

    const handlePromoteMember = async (role = "admin") => {
        if (!selectedMemberId) {
            alert("Pilih anggota terlebih dahulu.");
            return;
        }

        const roleText = role === "super_admin" ? "Super Admin" : "Admin";
        const confirmed = window.confirm(`Jadikan anggota ini sebagai ${roleText}?`);

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("auth_token");

            const response = await fetch(`/api/admins/${selectedMemberId}/promote`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Gagal menambahkan ${roleText}`);
            }

            setSelectedMemberId("");
            setShowAddAdmin(false);

            await fetchAdmins();
            await fetchMembers();
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchAdmins();
        fetchMembers();
        fetchAuditLogs();
    }, []);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,94,34,0.12),_transparent_34%),linear-gradient(180deg,_#f9fbf9_0%,_#eef4ef_100%)] text-slate-900">
            <div className="flex min-h-screen w-full overflow-hidden bg-transparent">
                {/* Mobile Sidebar Backdrop Overlay */}
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <aside className={`fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col bg-[#1c5e22] text-white transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-[220px] md:flex-col md:overflow-y-auto`}>
                    <div className="flex flex-col items-center px-5 pt-8">
                        <img src={logoHmif} alt="HMIF" className="h-20 w-20 rounded-full border-4 border-white/15 object-contain shadow-lg shadow-black/20" />
                        <p className="mt-3 text-center text-[1.05rem] font-extrabold leading-none tracking-[0.22em]">HMIF</p>
                        <p className="mt-1 text-center text-[0.68rem] leading-snug text-white/65">
                            Himpunan Mahasiswa Informatika ITERA
                        </p>
                    </div>

                    <nav className="mt-7 space-y-2 px-3">
                        {menus.map((menu) => (
                            <button
                                key={menu.key}
                                onClick={() => {
                                    setActiveMenu(menu.key);
                                    setIsSidebarOpen(false);
                                }}
                                className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[0.95rem] font-medium transition ${
                                    activeMenu === menu.key
                                        ? "bg-white/15 text-white shadow-sm ring-1 ring-white/10"
                                        : "text-white/65 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <MenuIcon type={menu.icon} />
                                <span className="truncate">{menu.label}</span>
                                {activeMenu === menu.key && (
                                    <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#9df76b]" />
                                )}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => {
                                navigate("/dashboard/admin-overview");
                                setIsSidebarOpen(false);
                            }}
                            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[0.95rem] font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                        >
                            <MenuIcon type="admin" />
                            <span className="truncate">Admin Dashboard</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                navigate("/dashboard/member");
                                setIsSidebarOpen(false);
                            }}
                            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[0.95rem] font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                        >
                            <MenuIcon type="user" />
                            <span className="truncate">Absen Saya</span>
                        </button>
                    </nav>

                    <div className="mt-auto p-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                            <img src={profilePhoto} alt="Super Admin" className="h-9 w-9 rounded-full object-cover" />
                            <div className="min-w-0">
                                <p className="truncate text-[12px] font-bold">Super Admin</p>
                                <p className="truncate text-[10px] text-white/60">admin@hmif.com</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 bg-transparent md:ml-[220px]">
                    <header className="flex h-[72px] items-center justify-between border-b border-white/70 bg-white/85 px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur md:px-7">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none md:hidden transition"
                                aria-label="Open sidebar"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div>
                                <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-emerald-700">Super Admin Console</p>
                                <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-900">{getTitle()}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[12px]">
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="text-slate-500 transition hover:text-emerald-700"
                            >
                                <Icon name="bell" className="h-4 w-4" />
                            </button>
                            <div className="h-5 w-px bg-slate-900/50" />
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-1.5 font-semibold text-slate-800 transition hover:text-emerald-700"
                            >
                                <Icon name="logout" className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </header>

                    <div className="p-4 md:p-6">
                {activeMenu === "dashboard" && (
                    <DashboardContent
                        stats={stats}
                        logs={auditLogs}
                        loading={loadingStats}
                        error={statsError}
                        onViewLogs={() => setActiveMenu("audit")}
                    />
                )}

                {activeMenu === "admins" && (
                    <AdminManagementContent
                        admins={admins}
                        members={members}
                        loading={loadingAdmins}
                        error={adminsError}
                        showAddAdmin={showAddAdmin}
                        selectedMemberId={selectedMemberId}
                        onOpenAddAdmin={() => setShowAddAdmin(true)}
                        onCloseAddAdmin={() => setShowAddAdmin(false)}
                        onSelectMember={setSelectedMemberId}
                        onPromoteMember={handlePromoteMember}
                        onToggleStatus={handleToggleAdminStatus}
                        onDeleteAdmin={handleDeleteAdmin}
                    />
                )}

                {activeMenu === "audit" && (
                    <AuditLogsContent
                        logs={auditLogs}
                        loading={loadingAuditLogs}
                        error={auditLogsError}
                    />
                )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Icon({ name, className = "h-4 w-4" }) {
    const common = {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 2,
    };

    const paths = {
        layoutGrid: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),
        userCog: (
            <>
                <circle cx="9" cy="8" r="4" />
                <path d="M3 21a6 6 0 0 1 10.6-3.8" />
                <circle cx="18" cy="18" r="3" />
                <path d="M18 14v1M18 21v1M14 18h1M21 18h1M15.8 15.8l.7.7M19.5 19.5l.7.7M20.2 15.8l-.7.7M16.5 19.5l-.7.7" />
            </>
        ),
        chart: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h17" />
                <path d="M8 16v-5" />
                <path d="M13 16V8" />
                <path d="M18 16v-9" />
            </>
        ),
        log: (
            <>
                <path d="M6 3h10l4 4v14H6z" />
                <path d="M16 3v5h5" />
                <path d="M9 12h8M9 16h8" />
            </>
        ),
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" />
            </>
        ),
        users: (
            <>
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21a7 7 0 0 1 14 0" />
                <path d="M16 11a4 4 0 0 0 0-6" />
                <path d="M19 21a6 6 0 0 0-4-5.6" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
            </>
        ),
        calendarCheck: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M8 2v4M16 2v4M3 10h18" />
                <path d="M8 15l2 2 5-5" />
            </>
        ),
        barChart: (
            <>
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 16v-4M12 16V8M16 16v-7" />
            </>
        ),
        userPlus: (
            <>
                <circle cx="9" cy="8" r="4" />
                <path d="M2 21a7 7 0 0 1 12.2-4.6" />
                <path d="M19 8v6M16 11h6" />
            </>
        ),
        fileText: (
            <>
                <path d="M6 3h9l4 4v14H6z" />
                <path d="M15 3v5h5" />
                <path d="M9 13h6M9 17h6" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </>
        ),
        checkCircle: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l3 3 5-6" />
            </>
        ),
        alertTriangle: (
            <>
                <path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
                <path d="M12 9v4M12 17h.01" />
            </>
        ),
        download: (
            <>
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
            </>
        ),
        lock: (
            <>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </>
        ),
        hash: (
            <>
                <path d="M10 3 8 21M16 3l-2 18M4 9h17M3 15h17" />
            </>
        ),
        server: (
            <>
                <rect x="4" y="4" width="16" height="6" rx="2" />
                <rect x="4" y="14" width="16" height="6" rx="2" />
                <path d="M8 7h.01M8 17h.01" />
            </>
        ),
        network: (
            <>
                <rect x="10" y="3" width="4" height="4" rx="1" />
                <rect x="4" y="17" width="4" height="4" rx="1" />
                <rect x="16" y="17" width="4" height="4" rx="1" />
                <path d="M12 7v5M6 17l6-5 6 5" />
            </>
        ),
        timer: (
            <>
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l3 2M9 2h6" />
            </>
        ),
        cpu: (
            <>
                <rect x="7" y="7" width="10" height="10" rx="2" />
                <path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 12a8 8 0 0 1-14.9 4" />
                <path d="M4 16v5h5" />
                <path d="M4 12A8 8 0 0 1 18.9 8" />
                <path d="M20 8V3h-5" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 15H6L5 6" />
                <path d="M10 11v6M14 11v6" />
            </>
        ),
        power: (
            <>
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
            </>
        ),
        filter: (
            <>
                <path d="M4 5h16" />
                <path d="M7 12h10" />
                <path d="M10 19h4" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4.5-4.5" />
            </>
        ),
        arrowRight: (
            <>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
            </>
        ),
        suitcase: (
            <>
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M9 7V5h6v2M3 12h18" />
            </>
        ),
        activity: (
            <>
                <path d="M3 12h4l3-7 4 14 3-7h4" />
            </>
        ),
    };

    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
            {paths[name] || paths.layoutGrid}
        </svg>
    );
}

function MenuIcon({ type }) {
    const icons = {
        grid: "layoutGrid",
        admin: "suitcase",
        user: "userCog",
        chart: "chart",
        log: "log",
    };

    return <Icon name={icons[type] || "layoutGrid"} className="h-5 w-5 shrink-0" />;
}

function protectCsvValue(value) {
    const text = String(value ?? "");
    const trimmed = text.trimStart();
    const protectedText = /^[=+\-@\t\r]/.test(trimmed) ? `'${text}` : text;

    return `"${protectedText.replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows) {
    const csv = rows
        .map((row) => row.map((value) => protectCsvValue(value)).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function buildDashboardLogs(logs) {
    if (logs?.length > 0) {
        return logs.slice(0, 3).map((log, index) => ({
            key: log.audit_id || log.id || `${log.action}-${index}`,
            action: log.action || "System activity",
            entity: log.target_type || "System",
            timestamp: log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "-",
            status: "Completed",
            icon: log.action?.toLowerCase().includes("failed") ? "alertTriangle" : "edit",
            iconClass: "bg-[#9df76b] text-green-900",
            statusClass: "bg-[#9df76b] text-green-800",
        }));
    }

    return [
        {
            key: "sample-1",
            action: "Admin Marcus updated Member Sarah L.",
            entity: "User Database",
            timestamp: "2 mins ago",
            status: "Completed",
            icon: "edit",
            iconClass: "bg-[#9df76b] text-green-900",
            statusClass: "bg-[#9df76b] text-green-800",
        },
        {
            key: "sample-2",
            action: "System approved Library Event",
            entity: "Events Manager",
            timestamp: "15 mins ago",
            status: "Auto-sync",
            icon: "checkCircle",
            iconClass: "bg-green-100 text-green-900",
            statusClass: "bg-[#9df76b] text-green-800",
        },
        {
            key: "sample-3",
            action: "Failed login attempt: IP 192.168.1.1",
            entity: "Security Audit",
            timestamp: "1 hour ago",
            status: "Flagged",
            icon: "alertTriangle",
            iconClass: "bg-red-100 text-red-700",
            statusClass: "bg-red-100 text-red-700",
        },
    ];
}

function getMemberDepartment(member) {
    return member.department
        || member.departemen
        || member.member_profile?.Departemen
        || member.member_profile?.departemen
        || member.memberProfile?.Departemen
        || member.memberProfile?.departemen
        || "";
}

function DashboardContent({ stats, logs, loading, error, onViewLogs }) {

    if (loading) {
        return (
            <div className="rounded-[10px] bg-white p-5 shadow-sm">
                <p className="text-slate-600">Memuat statistik...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[10px] bg-white p-5 shadow-sm">
                <p className="font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    const summary = stats?.summary || {};

    const cards = [
        {
            label: "Total Members",
            value: summary.total_members ?? 0,
            badge: "+5.2%",
            icon: "users",
        },
        {
            label: "Active Admins",
            value: summary.total_admins ?? 0,
            badge: "Active",
            icon: "shield",
        },
        {
            label: "Total Events",
            value: summary.total_events ?? 0,
            badge: "This Month",
            icon: "calendarCheck",
        },
        {
            label: "Attendance Rate",
            value: `${summary.attendance_rate ?? 0}%`,
            badge: "High",
            icon: "barChart",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.label} className="min-h-[112px] rounded-[10px] bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-[11px] font-black text-[#003f17]">
                                <Icon name={card.icon} className="h-4 w-4" />
                            </div>
                            <span className="rounded-full bg-[#9df76b] px-3 py-1 text-[10px] font-extrabold text-green-800">
                                {card.badge}
                            </span>
                        </div>

                        <p className="mt-3 text-[11px] font-extrabold tracking-wide text-slate-600">
                            {card.label}
                        </p>
                        <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-[#003f17]">
                            {card.value}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-[10px] bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                    <h2 className="text-xl font-extrabold text-[#003f17]">Recent Activity Logs</h2>
                    <button
                        type="button"
                        onClick={onViewLogs}
                        className="text-[11px] font-extrabold uppercase tracking-wide text-[#003f17] transition hover:text-[#39a80f]"
                    >
                        View All Logs
                    </button>
                </div>

                <table className="w-full text-left text-[12px]">
                    <thead className="border-y border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
                        <tr>
                            <th className="px-5 py-3">Action</th>
                            <th className="px-5 py-3">Entity</th>
                            <th className="px-5 py-3">Timestamp</th>
                            <th className="px-5 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buildDashboardLogs(logs).map((log) => (
                            <tr key={log.key} className="border-b border-slate-100">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${log.iconClass}`}>
                                            <Icon name={log.icon} className="h-3.5 w-3.5" />
                                        </span>
                                        <span className="font-semibold text-slate-800">{log.action}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-slate-600">{log.entity}</td>
                                <td className="px-5 py-4 text-slate-600">{log.timestamp}</td>
                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${log.statusClass}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminManagementContent({
    admins,
    members,
    loading,
    error,
    showAddAdmin,
    selectedMemberId,
    onOpenAddAdmin,
    onCloseAddAdmin,
    onSelectMember,
    onPromoteMember,
    onToggleStatus,
    onDeleteAdmin,
}) {
    const [memberSearch, setMemberSearch] = useState("");
    const [adminSearch, setAdminSearch] = useState("");
    const [adminRoleFilter, setAdminRoleFilter] = useState("all");
    const [adminStatusFilter, setAdminStatusFilter] = useState("all");
    const [promoteRole, setPromoteRole] = useState("admin");

    if (loading) {
        return (
            <div className="rounded-[10px] bg-white p-5">
                <p className="text-slate-600">Memuat data admin...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[10px] bg-white p-5">
                <p className="font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    const totalAdmins = admins.length;
    const activeAdmins = admins.filter((admin) => admin.status === "aktif").length;
    const normalizedMemberSearch = memberSearch.trim().toLowerCase();
    const normalizedAdminSearch = adminSearch.trim().toLowerCase();
    const filteredAdmins = admins.filter((admin) => {
        const keyword = [
            admin.name,
            admin.email,
            admin.nim,
            admin.role,
            admin.status,
            admin.department,
            admin.departemen,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        const matchesSearch = keyword.includes(normalizedAdminSearch);
        const matchesRole = adminRoleFilter === "all" || admin.role === adminRoleFilter;
        const matchesStatus = adminStatusFilter === "all" || admin.status === adminStatusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });
    const filteredMembers = members.filter((member) => {
        const keyword = [
            member.name,
            member.email,
            member.nim,
            getMemberDepartment(member),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return keyword.includes(normalizedMemberSearch);
    });
    const selectedMember = members.find((member) => String(member.user_id) === String(selectedMemberId));

    const handleCloseAddAdmin = () => {
        setMemberSearch("");
        onSelectMember("");
        setPromoteRole("admin");
        onCloseAddAdmin();
    };

    const handlePromoteSelectedMember = () => {
        setMemberSearch("");
        onPromoteMember(promoteRole);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-[#003f17]">Manajemen Admin</h2>
                    <p className="mt-1 text-[13px] text-slate-600">Pantau dan kelola akses operasional organisasi</p>
                </div>

                <button
                    onClick={onOpenAddAdmin}
                    className="inline-flex items-center gap-2 rounded-[7px] bg-[#39a80f] px-6 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#2f8d0d]"
                >
                    <Icon name="userPlus" className="h-4 w-4" />
                    Tambah Admin
                </button>
            </div>

            {showAddAdmin && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    onClick={handleCloseAddAdmin}
                >
                    <div
                        className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-[14px] bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                            <div>
                                <h3 className="text-xl font-extrabold text-[#003f17]">Tambah Admin</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Pilih anggota yang akan diberi akses admin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseAddAdmin}
                                className="rounded-full px-3 py-1 text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Tutup modal tambah admin"
                            >
                                x
                            </button>
                        </div>

                        <div className="border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3 rounded-[10px] bg-slate-100 px-4 py-3">
                                <Icon name="search" className="h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(event) => setMemberSearch(event.target.value)}
                                    placeholder="Cari nama, email, NIM, atau departemen anggota..."
                                    className="w-full bg-transparent text-sm outline-none"
                                    autoFocus
                                />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span>{filteredMembers.length} anggota ditemukan</span>
                                {selectedMember && (
                                    <span className="text-[#058b3d]">
                                        Dipilih: {selectedMember.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="min-h-[260px] flex-1 overflow-y-auto p-4">
                            {filteredMembers.map((member) => {
                                const isSelected = String(selectedMemberId) === String(member.user_id);
                                const initials = (member.name || "?")
                                    .split(" ")
                                    .map((part) => part[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase();

                                return (
                                    <button
                                        key={member.user_id}
                                        type="button"
                                        onClick={() => onSelectMember(member.user_id)}
                                        className={`mb-3 flex w-full items-center gap-4 rounded-[10px] border p-4 text-left transition ${
                                            isSelected
                                                ? "border-[#39a80f] bg-green-50 shadow-sm"
                                                : "border-slate-100 bg-white hover:border-green-200 hover:bg-green-50/50"
                                        }`}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-extrabold text-[#003f17]">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-extrabold text-slate-950">
                                                {member.name}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {member.email || "-"}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-slate-500">
                                                {member.nim || "NIM tidak tersedia"} - {getMemberDepartment(member) || "Departemen belum tersedia"}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                                                isSelected
                                                    ? "bg-[#39a80f] text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {isSelected ? "Dipilih" : "Pilih"}
                                        </span>
                                    </button>
                                );
                            })}

                            {members.length === 0 && (
                                <div className="rounded-[10px] bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    Tidak ada anggota yang tersedia untuk dijadikan admin.
                                </div>
                            )}

                            {members.length > 0 && filteredMembers.length === 0 && (
                                <div className="rounded-[10px] bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    Tidak ada anggota yang cocok dengan pencarian.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                                {selectedMember
                                    ? `${selectedMember.name} akan dipromosikan.`
                                    : "Pilih satu anggota dari daftar terlebih dahulu."}
                            </p>

                            <div className="flex items-center gap-3">
                                {selectedMember && (
                                    <select
                                        value={promoteRole}
                                        onChange={(event) => setPromoteRole(event.target.value)}
                                        className="rounded-[8px] border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="admin">Sebagai Admin</option>
                                        <option value="super_admin">Sebagai Super Admin</option>
                                    </select>
                                )}

                                <button
                                    type="button"
                                    onClick={handleCloseAddAdmin}
                                    className="rounded-[8px] border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePromoteSelectedMember}
                                    disabled={!selectedMemberId}
                                    className="inline-flex items-center gap-2 rounded-[8px] bg-[#058b3d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#047332] disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    <Icon name="userPlus" className="h-4 w-4" />
                                    Jadikan Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="min-h-[110px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-green-100 text-[#003f17]">
                        <Icon name="suitcase" className="h-5 w-5" />
                    </div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Total Admin
                    </p>
                    <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                        {totalAdmins}
                    </h3>
                </div>

                <div className="min-h-[110px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-[#9df76b] text-[#003f17]">
                        <Icon name="activity" className="h-5 w-5" />
                    </div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Admin Aktif Saat Ini
                    </p>
                    <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                        {activeAdmins}
                    </h3>
                </div>

                <div className="min-h-[110px] rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <Icon name="timer" className="h-5 w-5" />
                    </div>
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Aktivitas Login
                    </p>
                    <h3 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                        -
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Belum tersedia dari backend
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
                    <input
                        type="text"
                        value={adminSearch}
                        onChange={(event) => setAdminSearch(event.target.value)}
                        placeholder="Filter hasil..."
                        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 md:max-w-sm"
                    />

                    <div className="flex gap-3">
                        <select
                            value={adminRoleFilter}
                            onChange={(event) => setAdminRoleFilter(event.target.value)}
                            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="all">Semua Peran</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>

                        <select
                            value={adminStatusFilter}
                            onChange={(event) => setAdminStatusFilter(event.target.value)}
                            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="all">Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="non-aktif">Non-Aktif</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-[12px]">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Admin</th>
                                <th className="px-5 py-4">Departemen</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Login Terakhir</th>
                                <th className="px-5 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAdmins.map((admin) => (
                                <tr key={admin.user_id} className="border-t border-slate-100/80 transition hover:bg-slate-50/80">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={(admin.member_profile?.foto || admin.memberProfile?.foto) ? `/storage/${admin.member_profile?.foto || admin.memberProfile?.foto}` : profilePhoto}
                                                alt={admin.name}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-950">{admin.name}</p>
                                                    {admin.role === "super_admin" && (
                                                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 uppercase tracking-wider">
                                                            Super Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700">
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-slate-700">
                                            {admin.department || admin.departemen || admin.nim || "HMIF"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex items-center gap-2 text-sm font-medium ${
                                                admin.status === "aktif"
                                                    ? "text-slate-800"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    admin.status === "aktif" ? "bg-green-700" : "bg-slate-500"
                                                }`}
                                            />
                                            {admin.status === "aktif" ? "Aktif" : "Non-Aktif"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-slate-700">
                                        {admin.created_at
                                            ? new Date(admin.created_at).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => onToggleStatus(admin.user_id)}
                                                title={admin.status === "aktif" ? "Nonaktifkan admin" : "Aktifkan admin"}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-800 transition hover:bg-green-50 hover:text-green-950"
                                            >
                                                <Icon name="power" className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteAdmin(admin.user_id)}
                                                title="Turunkan jadi anggota"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 hover:text-red-800"
                                            >
                                                <Icon name="trash" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredAdmins.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                                        {admins.length === 0 ? "Belum ada data admin." : "Tidak ada admin yang cocok dengan filter."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-100 px-5 py-4 text-[13px] text-slate-600">
                    Menampilkan {filteredAdmins.length} dari {admins.length} admin
                </div>
            </div>
        </div>
    );
}

function AuditLogsContent({ logs, loading, error }) {
    if (loading) {
        return (
            <div className="rounded-[10px] bg-white p-5">
                <p className="text-slate-600">Memuat audit logs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[10px] bg-white p-5">
                <p className="font-semibold text-red-600">{error}</p>
            </div>
        );
    }





    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-[#003f17]">Audit Logs</h2>
                    <p className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-slate-600">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
                        Live System Monitoring Active
                    </p>
                </div>
            </div>



            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 md:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3">
                        <Icon name="filter" className="h-4 w-4 text-slate-600" />
                        <select className="w-full bg-transparent text-sm outline-none">
                            <option>All Actions</option>
                        </select>
                    </div>

                    <select className="rounded-2xl bg-slate-100 px-4 py-3 text-sm outline-none">
                        <option>All Administrators</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Cari log..."
                        className="rounded-2xl bg-slate-100 px-4 py-3 text-sm outline-none"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-[12px]">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Admin Responsible</th>
                                <th className="px-4 py-3">Target / Details</th>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.slice(0, 25).map((log, index) => (
                                <tr
                                    key={log.audit_id || log.id || `${log.action}-${log.target_id}-${index}`}
                                    className="border-t border-slate-100/80 transition hover:bg-slate-50/80"
                                >
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-slate-950">
                                            {log.action || "-"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-800">
                                            {log.actor?.name || "System"}
                                        </p>
                                        <p className="text-[11px] text-slate-500">
                                            {log.actor?.email || "-"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {log.target_type || "-"} #{log.target_id || "-"}
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {log.created_at
                                            ? new Date(log.created_at).toLocaleString("id-ID")
                                            : "-"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-green-800">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                                        Belum ada audit log.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-100 px-4 py-4 text-[12px] text-slate-600">
                    Showing {Math.min(logs.length, 25)} of {logs.length} entries
                </div>
            </div>
        </div>
    );
}

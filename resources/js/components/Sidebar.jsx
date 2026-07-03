import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import profilePhoto from "../assets/fotoprofile.png";

export default function Sidebar({
    role,
    userName = "User",
    nim = "-",
    activeMenu,        // only for Super Admin tabs
    setActiveMenu,    // only for Super Admin tabs
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    toggleSidebarCollapse
}) {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("nim");
        navigate("/login");
    };

    // Render SVG Icon based on key
    const renderIcon = (key) => {
        const svgClasses = "h-5 w-5 shrink-0 object-contain";
        switch (key) {
            case "dashboard":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                );
            case "history":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "profile":
            case "user":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case "anggota":
            case "users":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case "acara":
            case "calendar":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case "laporan":
            case "report":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case "audit":
            case "log":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            case "admins":
            case "admin":
            case "shield":
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            default:
                return (
                    <svg className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                );
        }
    };

    // Determine Sidebar Items based on Role
    let sidebarItems = [];
    if (role === "super_admin") {
        const handleSuperAdminClick = (key) => {
            if (pathname === "/dashboard") {
                if (setActiveMenu) setActiveMenu(key);
            } else {
                localStorage.setItem("superadmin_active_menu", key);
                navigate("/dashboard");
            }
            setIsSidebarOpen(false);
        };

        const activeKey = pathname === "/dashboard" ? (activeMenu || localStorage.getItem("superadmin_active_menu") || "dashboard") : "";

        return (
            <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1c5e22] text-white transition-all duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:flex-col ${isSidebarCollapsed ? "w-[76px]" : "w-[240px]"}`}>
                {/* Toggle button placed OUTSIDE scrollable area to prevent cutting off */}
                <button
                    type="button"
                    onClick={toggleSidebarCollapse}
                    className="hidden md:flex absolute top-5 -right-3.5 z-[60] h-7 w-7 items-center justify-center rounded-full bg-[#1c5e22] border border-white/20 text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
                    title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <svg className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full h-full scrollbar-none">
                    <div className="flex flex-col items-center pt-8 pb-6 px-4">
                        <img
                            src={hmifLogo}
                            alt="HMIF"
                            className={`rounded-full object-contain border-4 border-white/10 shadow-lg shadow-black/10 transition-all duration-300 ${isSidebarCollapsed ? "h-11 w-11" : "h-20 w-20"}`}
                        />
                        {!isSidebarCollapsed && (
                            <>
                                <p className="mt-3 text-[1.1rem] font-extrabold tracking-[0.2em] text-white uppercase text-center w-full truncate">HMIF</p>
                                <p className="text-[0.68rem] font-medium leading-relaxed text-white/60 text-center mt-1 px-2">
                                    Himpunan Mahasiswa Informatika ITERA
                                </p>
                            </>
                        )}
                    </div>
                    <hr className="border-white/10 mx-4" />
                    <nav className="flex-1 px-3 pt-5 space-y-1.5">
                        {[
                            { key: "dashboard", label: "Dashboard", icon: "dashboard" },
                            { key: "admins", label: "Admin Management", icon: "admins" },
                            { key: "audit", label: "Audit Logs", icon: "audit" }
                        ].map((menu) => {
                            const isTabActive = activeKey === menu.key;
                            return (
                                <button
                                    key={menu.key}
                                    onClick={() => handleSuperAdminClick(menu.key)}
                                    title={isSidebarCollapsed ? menu.label : ""}
                                    className={`relative flex items-center rounded-xl text-[0.92rem] font-semibold transition-all duration-150 ${
                                        isSidebarCollapsed ? "justify-center px-0 py-3 h-11 w-11 mx-auto" : "gap-3.5 px-4.5 py-3 w-full text-left"
                                    } ${
                                        isTabActive
                                            ? "bg-white/12 text-white shadow-sm ring-1 ring-white/8"
                                            : "text-white/65 hover:bg-white/8 hover:text-white"
                                    }`}
                                >
                                    {renderIcon(menu.icon)}
                                    {!isSidebarCollapsed && <span className="truncate">{menu.label}</span>}
                                    {isTabActive && !isSidebarCollapsed && (
                                        <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#9df76b]" />
                                    )}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => {
                                navigate("/dashboard/admin-overview");
                                setIsSidebarOpen(false);
                            }}
                            title={isSidebarCollapsed ? "Admin Dashboard" : ""}
                            className={`flex items-center rounded-xl text-[0.92rem] font-semibold text-white/65 transition-all duration-150 hover:bg-white/8 hover:text-white ${
                                isSidebarCollapsed ? "justify-center px-0 py-3 h-11 w-11 mx-auto" : "gap-3.5 px-4.5 py-3 w-full text-left"
                            }`}
                        >
                            {renderIcon("admin")}
                            {!isSidebarCollapsed && <span className="truncate">Admin Dashboard</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                navigate("/dashboard/member");
                                setIsSidebarOpen(false);
                            }}
                            title={isSidebarCollapsed ? "Absen Saya" : ""}
                            className={`flex items-center rounded-xl text-[0.92rem] font-semibold text-white/65 transition-all duration-150 hover:bg-white/8 hover:text-white ${
                                isSidebarCollapsed ? "justify-center px-0 py-3 h-11 w-11 mx-auto" : "gap-3.5 px-4.5 py-3 w-full text-left"
                            }`}
                        >
                            {renderIcon("user")}
                            {!isSidebarCollapsed && <span className="truncate">Absen Saya</span>}
                        </button>
                    </nav>

                    <div className="p-4 mt-auto">
                        {isSidebarCollapsed ? (
                            <div className="flex flex-col items-center gap-3">
                                <button onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-red-300 hover:bg-white/20 transition-all border border-white/10" title="Logout">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/8 bg-white/10 p-3.5 backdrop-blur-sm flex items-center gap-3">
                                <img src={profilePhoto} alt="Super Admin" className="h-9 w-9 rounded-full object-cover border border-white/15" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-white">Super Admin</p>
                                    <p className="truncate text-[0.72rem] text-white/55 font-medium">admin@hmif.com</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        );
    }

    if (role === "admin") {
        sidebarItems = [
            { label: "Dashboard", icon: "dashboard", to: "/dashboard/admin-overview" },
            { label: "Anggota", icon: "anggota", to: "/dashboard/anggota" },
            { label: "Acara", icon: "acara", to: "/dashboard/acara" },
            { label: "Laporan", icon: "laporan", to: "/dashboard/laporan" },
            { label: "Absen Saya", icon: "user", to: "/dashboard/member" },
        ];
    } else {
        sidebarItems = [
            { label: "Dashboard", icon: "dashboard", to: "/dashboard/member" },
            { label: "History", icon: "history", to: "/dashboard/history" },
            { label: "Profile", icon: "profile", to: "/dashboard/profile" },
        ];
    }

    const isUserSuperAdmin = localStorage.getItem("role") === "super_admin";

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#1c5e22] text-white transition-all duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:flex-col ${isSidebarCollapsed ? "w-[76px]" : "w-[240px]"}`}>
            {/* Toggle button placed OUTSIDE scrollable area to prevent cutting off */}
            <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="hidden md:flex absolute top-5 -right-3.5 z-[60] h-7 w-7 items-center justify-center rounded-full bg-[#1c5e22] border border-white/20 text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full h-full scrollbar-none">
                <div className="flex flex-col items-center pt-8 pb-6 px-4">
                    <img
                        src={hmifLogo}
                        alt="HMIF"
                        className={`rounded-full object-contain border-4 border-white/10 shadow-lg shadow-black/10 transition-all duration-300 ${isSidebarCollapsed ? "h-11 w-11" : "h-20 w-20"}`}
                    />
                    {!isSidebarCollapsed && (
                        <>
                            <p className="mt-3 text-[1.1rem] font-extrabold tracking-[0.2em] text-white uppercase text-center w-full truncate">HMIF</p>
                            <p className="text-[0.68rem] font-medium leading-relaxed text-white/60 text-center mt-1 px-2">
                                Himpunan Mahasiswa Informatika ITERA
                            </p>
                        </>
                    )}
                </div>
                <hr className="border-white/10 mx-4" />
                <nav className="flex-1 px-3 pt-5 space-y-1.5">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                onClick={() => setIsSidebarOpen(false)}
                                title={isSidebarCollapsed ? item.label : ""}
                                className={`flex items-center rounded-xl text-[0.92rem] font-semibold transition-all duration-150 ${
                                    isSidebarCollapsed ? "justify-center px-0 py-3 h-11 w-11 mx-auto" : "gap-3.5 px-4.5 py-3"
                                } ${
                                    isActive
                                        ? "bg-white/12 text-white shadow-sm ring-1 ring-white/8"
                                        : "text-white/65 hover:bg-white/8 hover:text-white"
                                }`}
                            >
                                {renderIcon(item.icon)}
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    {isUserSuperAdmin && role !== "super_admin" && (
                        <button
                            type="button"
                            onClick={() => {
                                navigate("/dashboard");
                                setIsSidebarOpen(false);
                            }}
                            title={isSidebarCollapsed ? "Super Admin Dashboard" : ""}
                            className={`flex items-center rounded-xl text-left text-[0.92rem] font-semibold text-white/65 transition-all duration-150 hover:bg-white/8 hover:text-white ${
                                isSidebarCollapsed ? "justify-center px-0 py-3 h-11 w-11 mx-auto" : "gap-3.5 px-4.5 py-3"
                            }`}
                        >
                            {renderIcon("dashboard")}
                            {!isSidebarCollapsed && <span className="truncate">Super Admin Dashboard</span>}
                        </button>
                    )}
                </nav>

                <div className="p-4 mt-auto">
                    {isSidebarCollapsed ? (
                        <div className="flex flex-col items-center gap-3">
                            <button onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-red-300 hover:bg-white/20 transition-all border border-white/10" title="Logout">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/8 bg-white/10 px-4 py-3.5 backdrop-blur-sm">
                            <p className="truncate text-[0.9rem] font-bold text-white">{userName}</p>
                            <p className="mt-0.5 truncate text-[0.72rem] text-white/55 font-medium">{nim}</p>
                            <button onClick={handleLogout} className="mt-3.5 inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-red-300 transition-all hover:text-red-200 active:scale-95">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 17l5-5-5-5M15 12H3" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

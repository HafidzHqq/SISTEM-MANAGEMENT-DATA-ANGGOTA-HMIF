import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserMenu() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState("User");
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        setIsLoggedIn(!!token);
        setName(localStorage.getItem("name") || "User");
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        window.location.href = "/login";
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    {name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <span className="truncate max-w-[120px] text-sm font-semibold">{name}</span>
                <span
                    className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/20">
                    <div className="px-4 py-3 text-sm text-slate-500">Akun aktif</div>
                    <div className="space-y-1 px-2 pb-3">
                        <Link
                            to="/dashboard"
                            className="block rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50"
                        >
                            Dashboard
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

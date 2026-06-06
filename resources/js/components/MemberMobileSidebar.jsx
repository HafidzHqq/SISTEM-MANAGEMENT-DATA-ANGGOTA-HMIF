import React from "react";
import { Link, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";

export function MemberMenuButton({ onClick, label = "Buka menu" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c5e22] text-white shadow-sm transition active:scale-95 md:hidden"
        >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
        </button>
    );
}

export default function MemberMobileSidebar({
    open,
    onClose,
    navItems,
    name,
    nim,
    avatarSrc,
    onLogout,
}) {
    const location = useLocation();

    React.useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    return (
        <div className={`fixed inset-0 z-[80] md:hidden ${open ? "" : "pointer-events-none"}`}>
            <button
                type="button"
                aria-label="Tutup menu"
                onClick={onClose}
                className={`absolute inset-0 bg-black/45 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
            />

            <aside
                className={`absolute left-0 top-0 flex h-full w-[82vw] max-w-[320px] flex-col bg-[#1c5e22] text-white shadow-2xl transition-transform duration-300 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between px-5 pt-6">
                    <div className="flex items-center gap-3">
                        <img src={hmifLogo} alt="HMIF" className="h-14 w-14 rounded-full border-4 border-white/15 object-contain" />
                        <div>
                            <p className="text-base font-extrabold leading-none">HMIF</p>
                            <p className="mt-1 max-w-[150px] text-[0.68rem] leading-tight text-white/60">
                                Himpunan Mahasiswa Informatika ITERA
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup menu"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <hr className="mx-5 mt-5 border-white/10" />

                <nav className="flex-1 space-y-2 px-4 pt-5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;

                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                                    isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <img src={item.icon} alt="" className="h-5 w-5 object-contain brightness-[10] opacity-90" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                        <div className="flex items-center gap-3">
                            <img src={avatarSrc || fotoProfile} alt="Profil" className="h-11 w-11 rounded-xl object-cover" />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">{name}</p>
                                <p className="mt-0.5 truncate text-[0.72rem] text-white/55">{nim}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-semibold text-red-200 transition hover:text-red-100"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17l5-5m0 0-5-5m5 5H9m4 8H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}

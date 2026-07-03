import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    // Fetch events and compute notifications
    const fetchNotifications = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch("/api/events", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });
            if (!res.ok) return;
            const events = await res.json();
            
            const list = [];
            const now = new Date();

            events.forEach(event => {
                const startStr = event.attendance_window_start ? event.attendance_window_start.replace(" ", "T") : null;
                const endStr = event.attendance_window_end ? event.attendance_window_end.replace(" ", "T") : null;
                const start = startStr ? new Date(startStr) : null;
                const end = endStr ? new Date(endStr) : null;

                if (!start || !end) return;

                // 1. Check if Active
                if (now >= start && now <= end) {
                    list.push({
                        id: `active-${event.event_id}`,
                        title: `Acara Aktif: ${event.title}`,
                        message: `Presensi telah dibuka! Segera lakukan check-in sebelum pukul ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`,
                        type: "active",
                        time: "Aktif",
                        link: "/dashboard",
                    });
                }
                
                // 2. Check if 1 Day Before
                const diffTime = start - now;
                const diffHours = diffTime / (1000 * 60 * 60);
                if (diffHours > 0 && diffHours <= 24) {
                    list.push({
                        id: `reminder-${event.event_id}`,
                        title: `Pengingat Acara: ${event.title}`,
                        message: `Akan dimulai besok pada pukul ${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB. Pastikan Anda bersiap.`,
                        type: "reminder",
                        time: "H-1 Acara",
                        link: "/dashboard",
                    });
                }
            });

            // Get read notifications from localStorage to filter/mark them
            const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
            const processed = list.map(item => ({
                ...item,
                isRead: readIds.includes(item.id)
            }));

            setNotifications(processed);
        } catch (err) {
            console.error("Gagal memuat notifikasi:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const timer = setInterval(fetchNotifications, 30000);
        return () => clearInterval(timer);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem("read_notifications", JSON.stringify(allIds));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleItemClick = (id) => {
        const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
        if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem("read_notifications", JSON.stringify(readIds));
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-1.5 text-slate-500 hover:text-emerald-700 transition-all rounded-full hover:bg-slate-100/80 active:scale-95 flex items-center justify-center" 
                aria-label="Notifikasi"
            >
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-slate-100 shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
                    {/* Header */}
                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800">Notifikasi Acara</h4>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition"
                            >
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    to={notif.link}
                                    onClick={() => handleItemClick(notif.id)}
                                    className={`block px-4 py-3 hover:bg-slate-50/80 transition ${!notif.isRead ? "bg-emerald-50/20" : ""}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-[12px] font-bold text-slate-900 leading-snug">
                                            {notif.title}
                                        </p>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize whitespace-nowrap ${
                                            notif.type === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                        }`}>
                                            {notif.time}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                        {notif.message}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-400 text-[12px]">
                                <svg className="h-8 w-8 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                Tidak ada notifikasi saat ini
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

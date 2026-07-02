import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const token = localStorage.getItem("auth_token");
    const [isValidating, setIsValidating] = useState(true);
    const [userRole, setUserRole] = useState(localStorage.getItem("role"));

    useEffect(() => {
        if (!token) {
            setIsValidating(false);
            return;
        }

        // Ambil data profil dari API untuk memverifikasi keaslian role & token
        fetch("/api/me", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Unauthorized");
                return res.json();
            })
            .then((data) => {
                const realRole = data.role;
                setUserRole(realRole);
                // Selaraskan kembali local storage dengan data asli dari database
                localStorage.setItem("role", realRole);
                setIsValidating(false);
            })
            .catch(() => {
                // Token palsu, rusak, atau kedaluwarsa: hapus penyimpanan dan paksa login ulang
                localStorage.removeItem("auth_token");
                localStorage.removeItem("role");
                localStorage.removeItem("name");
                localStorage.removeItem("nim");
                setUserRole(null);
                setIsValidating(false);
            });
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (isValidating) {
        // Tampilkan loading screen minimalis saat memverifikasi sesi & keamanan
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f0f2ee]">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#1c5e22] border-t-transparent" />
            </div>
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

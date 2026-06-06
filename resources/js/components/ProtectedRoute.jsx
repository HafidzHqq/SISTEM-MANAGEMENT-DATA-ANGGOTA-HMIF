import React from "react";
import { Navigate } from "react-router-dom";

// Komponen ini ngecek apakah user sudah login
// Kalau allowedRoles diisi, role user juga harus sesuai
export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("role");
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}

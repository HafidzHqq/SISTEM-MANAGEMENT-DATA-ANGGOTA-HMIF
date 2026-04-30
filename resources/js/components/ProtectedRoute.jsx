import React from "react";
import { Navigate } from "react-router-dom";

// Komponen ini ngecek apakah user sudah login
// Kalau belum ada token di localStorage, redirect ke /login
// Kalau sudah ada token, tampilkan halaman yang diminta
export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}
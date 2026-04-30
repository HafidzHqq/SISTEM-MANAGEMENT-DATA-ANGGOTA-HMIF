import React from "react";
import { Navigate } from "react-router-dom";
import DashboardAnggota from "../components/DashboardAnggota";
import DashboardAdmin from "../components/DashboardAdmin";
import DashboardSuperAdmin from "../components/DashboardSuperAdmin";

export default function Dashboard() {
    // Ambil role dari localStorage yang disimpen saat login
    const role = localStorage.getItem('role');

    // Kalau role tidak dikenali, redirect ke login
    const validRoles = ['anggota', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
        return <Navigate to="/login" replace />;
    }

    if (role === 'admin') return <DashboardAdmin />
    if (role === 'super_admin') return <DashboardSuperAdmin />
    return <DashboardAnggota />
}
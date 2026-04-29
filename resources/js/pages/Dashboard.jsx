import React from "react";
import DashboardAnggota from "../components/DashboardAnggota";
import DashboardAdmin from "../components/DashboardAdmin";
import DashboardSuperAdmin from "../components/DashboardSuperAdmin";

export default function Dashboard() {
    // Ambil role dari localStorage yang disimpen saat login
    const role = localStorage.getItem('role');

    if (role === 'admin') return <DashboardAdmin />
    if (role === 'super_admin') return <DashboardSuperAdmin />
    return <DashboardAnggota />
}
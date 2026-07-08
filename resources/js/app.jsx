import './bootstrap';
import "../css/app.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import Profile from "./pages/Profile";
import History from "./pages/History";
import QrScanner from "./components/QrScanner";
import Anggota from "./pages/Anggota";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardAdminAcara from "./components/DashboardAdminAcara";
import DashboardAdminLaporan from "./components/DashboardAdminLaporan";
import DashboardAnggota from "./components/DashboardAnggota";

function App() {
    return (
        <BrowserRouter>
            <PageTransition>
            <Routes>
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/anggota" element={
                    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <Anggota />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/admin-overview" element={
                    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <DashboardAdmin />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/member" element={
                    <ProtectedRoute allowedRoles={["anggota", "admin", "super_admin"]}>
                        <DashboardAnggota />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/acara" element={
                    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <DashboardAdminAcara />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/laporan" element={
                    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <DashboardAdminLaporan />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/history" element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                } />
                <Route path="/scan" element={
                    <ProtectedRoute>
                        <QrScanner />
                    </ProtectedRoute>
                } />
                <Route path="/anggota" element={
                    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                        <Anggota />
                    </ProtectedRoute>
                } />
            </Routes>
            </PageTransition>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);

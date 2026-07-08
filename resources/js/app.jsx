import './bootstrap';
import "../css/app.css";
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";

// Lazy load dashboard components for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History"));
const QrScanner = lazy(() => import("./components/QrScanner"));
const Anggota = lazy(() => import("./pages/Anggota"));
const DashboardAdmin = lazy(() => import("./components/DashboardAdmin"));
const DashboardAdminAcara = lazy(() => import("./components/DashboardAdminAcara"));
const DashboardAdminLaporan = lazy(() => import("./components/DashboardAdminLaporan"));
const DashboardAnggota = lazy(() => import("./components/DashboardAnggota"));

function App() {
    return (
        <BrowserRouter>
            <PageTransition>
                <Suspense fallback={
                    <div className="flex h-screen w-screen items-center justify-center bg-[#0a220c]">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-[#F4C44C]" />
                    </div>
                }>
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
                </Suspense>
            </PageTransition>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);

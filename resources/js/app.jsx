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
import ProtectedRoute from "./components/ProtectedRoute"; // tambah ini

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <MainLayout><Dashboard /></MainLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
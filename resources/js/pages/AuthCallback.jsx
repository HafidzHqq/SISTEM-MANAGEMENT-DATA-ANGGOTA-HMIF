import React, { useEffect } from "react";

export default function AuthCallback() {
    useEffect(() => {
        // Ambil token dari query parameter URL
        // contoh URL: http://localhost:5173/auth/callback?token=xxxxx
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error) {
            // Kalau ada error dari Laravel (misal domain tidak valid)
            // redirect balik ke login dengan pesan error
            window.location.href = "/login?error=" + error;
            return;
        }

        if (token) {
            // Simpan token di localStorage
            // Token ini akan dipakai untuk semua request ke API Laravel selanjutnya
            localStorage.setItem("auth_token", token);
            localStorage.setItem("role", params.get("role"));
            
            // Extract nama dari email
            // Format: nama.nim@student.itera.ac.id
            const namaParam = params.get("name");
            localStorage.setItem("name", namaParam || "User");
            
            window.location.href = "/";
        } else {
            // Kalau ga ada token sama sekali, balik ke login
            window.location.href = "/login";
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Memproses login...</p>
        </div>
    );
}
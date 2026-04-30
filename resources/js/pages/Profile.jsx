// Fitur: Profile Page
// Deskripsi: Menampilkan dan mengelola data profil anggota HMIF

import React from "react";

export default function Profile() {
    // Ambil data dari localStorage dulu sebagai dummy
    // Nanti diganti ambil dari API /api/me
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email"); // belum ada, nanti ditambah

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Nama</label>
                    <p className="font-semibold">Andryano</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">tes usn email</label>
                    <p className="font-semibold">{name || "-"}</p>
                </div>
            </div>
        </div>
    );
}
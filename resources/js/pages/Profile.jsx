// Fitur: Profile Page
// Deskripsi: Menampilkan dan mengelola data profil anggota HMIF

import React, { useEffect, useState } from "react";

function parseAngkatan(nim) {
    if (!nim) return "-";
    const digits = nim.replace(/\D/g, "");
    if (digits.length < 3) return "-";
    return "20" + digits.substring(1, 3);
}

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        fetch("/api/me", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        })
        .then(res => res.json())
        .then(data => {
            setUser(data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Gagal fetch data user:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profil Saya</h1>
            <div className="bg-white rounded-lg shadow p-6">

                {/* READ-ONLY */}
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">NIM</label>
                    <p className="font-semibold">{user?.nim || "-"}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Nama</label>
                    <p className="font-semibold">{user?.name || "-"}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Angkatan</label>
                    <p className="font-semibold">{parseAngkatan(user?.nim)}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Email</label>
                    <p className="font-semibold">{user?.email || "-"}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Status Keanggotaan</label>
                    <p className="font-semibold">{user?.profile?.status_keanggotaan || "-"}</p>
                </div>

                {/* EDITABLE — tampil data saja, Firman yang buat form-nya */}
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Departemen</label>
                    <p className="font-semibold">{user?.profile?.departemen || "-"}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">Jabatan</label>
                    <p className="font-semibold">{user?.profile?.jabatan || "-"}</p>
                </div>
                <div className="mb-4">
                    <label className="text-gray-500 text-sm">No. Telepon</label>
                    <p className="font-semibold">{user?.profile?.no_telepon || "-"}</p>
                </div>

            </div>
        </div>
    );
}
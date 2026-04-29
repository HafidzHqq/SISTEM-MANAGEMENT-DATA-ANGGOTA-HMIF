import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    // State buat buka/tutup dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const navigate = useNavigate();

    // Ambil nama dari localStorage
    const name = localStorage.getItem("name");
    const token = localStorage.getItem("auth_token");

    // Fungsi logout — hapus localStorage, balik ke homepage
    const handleLogout = async () => {
        setLogoutLoading(true)

        await new Promise(resolve => setTimeout(resolve, 1000));

        localStorage.removeItem("auth_token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/");
        setLogoutLoading(false);
        setDropdownOpen(false);
    };

    return (
        <nav className="bg-gray-800 text-white p-4 flex justify-between">
            <h1 className="font-bold">HMIF</h1>
            <ul className="flex gap-4 items-center">
                <li><Link to="/">Home</Link></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
                <li className="relative">
                    {token ? (
                        // Kalau sudah login, tampilkan nama user
                        <>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
                            >
                                {name} ▾
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg z-10">
                                    <Link
                                        to="/dashboard"
                                        className="block px-4 py-2 hover:bg-gray-100"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logoutLoading}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                                    >
                                        {logoutLoading ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Kalau belum login, tampilkan tombol Login
                        <Link
                            to="/login"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
                        >
                            Login
                        </Link>
                    )}
                </li>
            </ul>
        </nav>
    );
}
import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import iconAdd from "../assets/icon-gantiprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconProfile from "../assets/icon-profile.png";
import iconKegiatan from "../assets/icon-kegiatan.png";
import iconArchive from "../assets/icon-archive.png";

const METRICS = [
    { label: "Total Anggota", value: "1,248", help: "+12% peningkatan" },
    { label: "Anggota Muda", value: "420", help: "" },
    { label: "Anggota Tetap", value: "712", help: "" },
    { label: "Luar Biasa", value: "116", help: "" },
];

const SAMPLE_ROWS = [
    {
        id: 1,
        nim: "121140090",
        nama: "Aditya Kusuma",
        kontak: "0812-3456-7890",
        angkatan: 2021,
        divisi: "Eksternal",
        jabatan: "Ketua Divisi",
        status: "TETAP",
        email: "aditya.k@hmif.org",
    },
    {
        id: 2,
        nim: "123140152",
        nama: "Siti Pertiwi",
        kontak: "0812-3456-7891",
        angkatan: 2023,
        divisi: "Internal",
        jabatan: "Staff",
        status: "MUDA",
        email: "siti.p@hmif.org",
    },
    {
        id: 3,
        nim: "122140032",
        nama: "Rizky Ramadhan",
        kontak: "0812-3456-7892",
        angkatan: 2022,
        divisi: "-",
        jabatan: "Alumni",
        status: "LUAR BIASA",
        email: "rizky.r@hmif.org",
    },
    {
        id: 4,
        nim: "124140051",
        nama: "Farhan Naufal",
        kontak: "0812-3456-7893",
        angkatan: 2024,
        divisi: "Minat Bakat",
        jabatan: "Sekretaris",
        status: "TETAP",
        email: "farhan.n@hmif.org",
    },
    {
        id: 5,
        nim: "123140014",
        nama: "Luthfi Wijaya",
        kontak: "0812-3456-7894",
        angkatan: 2023,
        divisi: "Eksternal",
        jabatan: "Staff",
        status: "MUDA",
        email: "luthfi.w@hmif.org",
    },
];

const NAV_ITEMS = [
    { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
    { label: "Anggota", icon: iconProfile, to: "/dashboard/anggota" },
    { label: "Acara", icon: iconKegiatan, to: "/dashboard/acara" },
    { label: "Laporan", icon: iconArchive, to: "/dashboard/laporan" },
];

const statusClasses = {
    TETAP: "bg-emerald-50 text-emerald-700",
    MUDA: "bg-amber-100 text-amber-700",
    "LUAR BIASA": "bg-sky-100 text-sky-700",
};

export default function DashboardAdminAnggota() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const [search, setSearch] = useState("");
    const [division, setDivision] = useState("Semua Divisi");
    const [year, setYear] = useState("Semua Angkatan");
    const [status, setStatus] = useState("Semua Status");
    const [selectedIds, setSelectedIds] = useState([]);
    const [detailMember, setDetailMember] = useState(null);
    const [memberStatus, setMemberStatus] = useState("");

    const handleOpenDetail = (member) => {
        setDetailMember(member);
        setMemberStatus(member.status === "TETAP" ? "Anggota Tetap" : member.status === "MUDA" ? "Anggota Muda" : "Luar Biasa");
    };

    const handleCloseDetail = () => {
        setDetailMember(null);
    };

    const handleMemberStatusChange = (value) => {
        setMemberStatus(value);
    };

    const filteredRows = useMemo(() => {
        return SAMPLE_ROWS.filter((row) => {
            const matchesSearch = search
                ? `${row.nama} ${row.nim}`.toLowerCase().includes(search.toLowerCase())
                : true;
            const matchesDivision = division === "Semua Divisi" || row.divisi === division;
            const matchesYear = year === "Semua Angkatan" || String(row.angkatan) === String(year);
            const matchesStatus = status === "Semua Status" || row.status === status;
            return matchesSearch && matchesDivision && matchesYear && matchesStatus;
        });
    }, [search, division, year, status]);

    const handleToggleRow = (id) => {
        setSelectedIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const handleToggleAll = () => {
        if (selectedIds.length === filteredRows.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRows.map((row) => row.id));
        }
    };

    const selectedCount = selectedIds.length;

    return (
        <div className="min-h-screen bg-[#e8f6ea] font-sans text-gray-900">
            <div className="min-h-screen flex">
                <aside className="hidden md:flex flex-col w-55 min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
                    <div className="flex flex-col items-center pt-8 pb-5 px-4">
                        <img src={hmifLogo} alt="HMIF" className="h-18 w-18 rounded-full object-contain border-4 border-white/20" />
                        <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                        <p className="text-[0.62rem] text-white/55 text-center leading-snug mt-0.5">
                            Himpunan Mahasiswa Informatika ITERA
                        </p>
                    </div>
                    <hr className="border-white/10 mx-4" />
                    <nav className="flex-1 px-3 pt-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                                        isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    <img src={item.icon} alt={item.label} className="h-4.5 w-4.5 object-contain brightness-[10] opacity-90" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4">
                        <div className="bg-white/10 rounded-2xl px-4 py-3">
                            <p className="text-sm font-semibold text-white truncate">Admin User</p>
                            <p className="text-[0.7rem] text-white/55 mt-0.5">admin@hmif.com</p>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 md:ml-55 flex flex-col min-h-screen min-w-0 relative">
                    <header className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-sm w-full">
                        <div className="flex items-center gap-2">
                            <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain rounded-full" />
                            <span className="text-sm font-bold text-gray-800">HMIF ITERA</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">Anggota</div>
                    </header>

                    <main className="flex-1 px-5 py-6 md:px-8 md:py-8 pb-28 md:pb-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Member Management</p>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Manajemen Anggota</h1>
                                <p className="text-sm text-gray-600">Kelola data seluruh anggota aktif dan luar biasa HMIF.</p>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-yellow-300 transition"
                            >
                                <img src={iconAdd} alt="Tambah" className="h-4 w-4" />
                                Tambah Anggota
                            </button>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
                            {METRICS.map((metric) => (
                                <div key={metric.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
                                            {metric.label.charAt(0)}
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            {metric.help || " "}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900">{metric.value}</h2>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-3xl bg-[#2f8c2b] p-4 shadow-sm mb-6">
                            <div className="grid gap-3 sm:grid-cols-[1.65fr_0.95fr] items-center">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari nama atau NIM..."
                                        className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    />
                                    <select
                                        value={division}
                                        onChange={(e) => setDivision(e.target.value)}
                                        className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    >
                                        <option>Semua Divisi</option>
                                        <option>Eksternal</option>
                                        <option>Internal</option>
                                        <option>Minat Bakat</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    >
                                        <option>Semua Angkatan</option>
                                        <option>2021</option>
                                        <option>2022</option>
                                        <option>2023</option>
                                        <option>2024</option>
                                    </select>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-xl border border-white/20 bg-white/95 px-4 py-2 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                                    >
                                        <option>Semua Status</option>
                                        <option>TETAP</option>
                                        <option>MUDA</option>
                                        <option>LUAR BIASA</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setDivision("Semua Divisi");
                                            setYear("Semua Angkatan");
                                            setStatus("Semua Status");
                                        }}
                                        className="text-white/80 hover:text-white transition font-semibold"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                            <div className="text-sm text-slate-700">Terpilih: {selectedCount} baris</div>
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition">
                                    Export CSV
                                </button>
                                <button className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition">
                                    Hapus Massal
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-4 shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-max text-sm">
                                    <thead>
                                        <tr className="text-left text-xs uppercase text-slate-500 tracking-[0.12em]">
                                            <th className="w-10 py-3 pl-4 pr-2">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                                        checked={selectedIds.length === filteredRows.length && filteredRows.length > 0}
                                                        onChange={handleToggleAll}
                                                    />
                                                </label>
                                            </th>
                                            <th className="py-3 px-3">NO</th>
                                            <th className="py-3 px-3">NIM</th>
                                            <th className="py-3 px-3">NAMA</th>
                                            <th className="py-3 px-3">KONTAK</th>
                                            <th className="py-3 px-3">ANGKATAN</th>
                                            <th className="py-3 px-3">DIVISI</th>
                                            <th className="py-3 px-3">JABATAN</th>
                                            <th className="py-3 px-3">STATUS</th>
                                            <th className="py-3 px-3">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((row) => (
                                            <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                                                <td className="py-3 pl-4 pr-2">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                                            checked={selectedIds.includes(row.id)}
                                                            onChange={() => handleToggleRow(row.id)}
                                                        />
                                                    </label>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">{row.id}</td>
                                                <td className="py-3 px-3 text-blue-600 font-semibold">{row.nim}</td>
                                                <td className="py-3 px-3 font-semibold">{row.nama}</td>
                                                <td className="py-3 px-3 text-slate-500">{row.kontak}</td>
                                                <td className="py-3 px-3">{row.angkatan}</td>
                                                <td className="py-3 px-3">{row.divisi}</td>
                                                <td className="py-3 px-3">{row.jabatan}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-semibold ${
                                                        statusClasses[row.status] || "bg-slate-100 text-slate-700"
                                                    }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={() => handleOpenDetail(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm hover:bg-slate-50 transition">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                        <button type="button" onClick={() => handleOpenDetail(row)} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm hover:bg-slate-50 transition">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-100 text-slate-500 shadow-sm hover:bg-slate-50 transition">
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                                <div>Menampilkan 1 - {filteredRows.length} dari 1,248 data</div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                                    <button className="h-8 w-8 rounded-full bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition">1</button>
                                    <button className="h-8 w-8 rounded-full text-slate-500 hover:bg-white transition">2</button>
                                    <button className="h-8 w-8 rounded-full text-slate-500 hover:bg-white transition">3</button>
                                    <span className="px-2 text-slate-400">...</span>
                                    <button className="h-8 w-8 rounded-full text-slate-500 hover:bg-white transition">250</button>
                                </div>
                            </div>
                        </div>
                        {detailMember && (
                            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-sm px-4 py-6">
                                <div className="mx-auto w-full max-w-4xl rounded-4xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseDetail}
                                        className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm hover:bg-slate-200 transition"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-3xl font-bold text-slate-700">
                                                    {detailMember.nama
                                                        .split(" ")
                                                        .map((part) => part[0])
                                                        .slice(0, 2)
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Detail Anggota</p>
                                                    <h2 className="mt-3 text-3xl font-semibold text-slate-900">{detailMember.nama}</h2>
                                                    <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                                                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-700">
                                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                                                                <circle cx="9" cy="7" r="4" />
                                                            </svg>
                                                            {detailMember.nim}
                                                        </span>
                                                    </div>
                                                    <span className="mt-4 inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                                                        {memberStatus}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Division</div>
                                                    <p className="mt-3 text-lg font-semibold text-slate-900">{detailMember.divisi}</p>
                                                </div>
                                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Position</div>
                                                    <p className="mt-3 text-lg font-semibold text-slate-900">{detailMember.jabatan}</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email Address</div>
                                                    <p className="mt-3 text-lg font-semibold text-slate-900">{detailMember.email}</p>
                                                </div>
                                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone Number</div>
                                                    <p className="mt-3 text-lg font-semibold text-slate-900">{detailMember.kontak}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                            <div className="mb-6">
                                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status Keanggotaan</div>
                                                <select
                                                    value={memberStatus}
                                                    onChange={(e) => handleMemberStatusChange(e.target.value)}
                                                    className="mt-3 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                                >
                                                    <option>Anggota Tetap</option>
                                                    <option>Anggota Muda</option>
                                                    <option>Luar Biasa</option>
                                                </select>
                                            </div>

                                            <button
                                                type="button"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Delete Member
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid gap-3 sm:grid-cols-2 border-t border-slate-200 pt-5 text-xs uppercase tracking-[0.24em] text-slate-400">
                                        <span>HMIF ITERA • MEMBER RECORDS DIVISION</span>
                                        <span className="text-right text-slate-500">Last updated: Oct 24, 2023</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

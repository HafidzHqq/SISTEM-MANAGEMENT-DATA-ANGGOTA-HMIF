import React from "react";
import { Link, useNavigate } from "react-router-dom";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";

const DEPARTEMEN_LIST = [
    "Kesekjenan", "Senator", "DPA", "Eksternal", "PSDA", "Internal", "Keprofesian", "Kominfo",
];

const JABATAN_BY_DEPARTEMEN = {
    "Kesekjenan": ["Ketua Himpunan", "Sekretaris Jenderal", "Sekretaris Umum", "Bendahara Umum"],
    "Senator": ["Senator", "Sekretaris Umum", "Staff"],
    "DPA": ["Koordinator DPA", "Sekretaris Jenderal", "Sekretaris Umum", "Ketua Komisi", "Staff Ahli", "Staff"],
    "Eksternal": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "PSDA": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "Internal": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "Keprofesian": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "Kominfo": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
};

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [toast, setToast] = React.useState(false);
    const toastTimer = React.useRef(null);
    const [fotoUrl, setFotoUrl] = React.useState(null);
    const [uploadingFoto, setUploadingFoto] = React.useState(false);
    const [fotoFile, setFotoFile] = React.useState(null);
    const [fotoPreview, setFotoPreview] = React.useState(null);

    const showToast = () => {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 3000);
    };

    // Form state
    const [form, setForm] = React.useState({
        departemen: "",
        jabatan: "",
        no_telepon: "",
    });
    const [savedForm, setSavedForm] = React.useState({ ...form });
    const [phoneError, setPhoneError] = React.useState("");

    const [attendedEvents, setAttendedEvents] = React.useState([]);
    const [upcomingActivities, setUpcomingActivities] = React.useState([]);

    React.useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        };

        // Fetch profile
        fetch("/api/me", { headers })
            .then(res => res.json())
            .then(data => {
                setProfile(data);
                setFotoUrl(data?.profile?.foto
                    ? `/storage/${data.profile.foto}`
                    : null
                );
                const initial = {
                    departemen: data?.profile?.departemen || "",
                    jabatan: data?.profile?.jabatan || "",
                    no_telepon: data?.profile?.no_telepon || "",
                };
                setForm(initial);
                setSavedForm(initial);
            })
            .catch(err => console.error("Gagal fetch profil:", err));

        // Fetch attended events
        fetch("/api/attendances/me", { headers })
            .then(res => res.json())
            .then(data => setAttendedEvents(data))
            .catch(err => console.error("Gagal fetch history:", err));

        // Fetch upcoming events
        fetch("/api/events", { headers })
            .then(res => res.json())
            .then(data => setUpcomingActivities(data))
            .catch(err => console.error("Gagal fetch events:", err));
    }, []);

    const name = profile?.name || localStorage.getItem("name") || "Anggota HMIF";
    const nim = profile?.nim || "-";
    const statusKeanggotaan = profile?.profile?.status_keanggotaan || "Anggota Muda";
    const email = profile?.email || "-";
    const angkatan = nim.length >= 3 ? "20" + nim.replace(/\D/g, "").substring(1, 3) : "-";

    const hasChanges =
        form.departemen !== savedForm.departemen ||
        form.jabatan !== savedForm.jabatan ||
        form.no_telepon !== savedForm.no_telepon ||
        fotoFile !== null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "no_telepon") {
            if (!/^\d*$/.test(value)) {
                setPhoneError("Nomor telepon hanya boleh berisi angka");
                return;
            }
            setPhoneError("");
        }
        if (name === "departemen") {
            setForm(prev => ({ ...prev, departemen: value, jabatan: "" }));
            return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!hasChanges || saving) return;
        if (phoneError) return;

        setSaving(true);
        const token = localStorage.getItem("auth_token");
        try {
            // Upload foto dulu kalau ada
            if (fotoFile) {
                const formData = new FormData();
                formData.append("foto", fotoFile);
                const fotoRes = await fetch("/api/profile/foto", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    },
                    body: formData,
                });
                const fotoData = await fotoRes.json();
                if (!fotoRes.ok) throw new Error(fotoData.message || "Gagal upload foto");
                setFotoUrl(fotoData.foto_url);
                setFotoFile(null);
                setFotoPreview(null);
            }

            // Save data profile
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Gagal menyimpan");
            }
            setSavedForm({ ...form });
            showToast();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        ["auth_token", "role", "name"].forEach(k => localStorage.removeItem(k));
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard" },
        { label: "History", icon: iconHistory, to: "/dashboard/history" },
        { label: "Profile", icon: iconProfile, to: "/dashboard/profile" },
    ];

    const Field = ({ label, value, half }) => (
        <div className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 ${half ? "" : "col-span-2"}`}>
            <p className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">{label}</p>
            <p className="text-[0.92rem] font-semibold text-gray-800">{value || "-"}</p>
        </div>
    );

    const btnClass = hasChanges && !saving
        ? "bg-green-600 hover:bg-green-700 cursor-pointer"
        : "bg-gray-300 cursor-not-allowed";

    return (
        <div className="min-h-screen bg-[#f0f2ee] font-sans flex">

            {/* ════ SIDEBAR ════ */}
            <aside className="hidden md:flex flex-col w-[220px] min-h-screen bg-[#1c5e22] text-white fixed left-0 top-0 bottom-0 z-50">
                <div className="flex flex-col items-center pt-8 pb-5 px-4">
                    <img src={hmifLogo} alt="HMIF" className="h-[72px] w-[72px] rounded-full object-contain border-4 border-white/20" />
                    <p className="mt-3 text-base font-bold tracking-wide">HMIF</p>
                    <p className="text-[0.62rem] text-white/55 text-center leading-snug mt-0.5">Himpunan Mahasiswa Informatika ITERA</p>
                </div>
                <hr className="border-white/10 mx-4" />
                <nav className="flex-1 px-3 pt-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.to === "/dashboard/profile";
                        return (
                            <Link key={item.label} to={item.to}
                                className={`flex items-center gap-3 px-4 py-[10px] rounded-xl text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
                                <img src={item.icon} alt="" className="h-[18px] w-[18px] object-contain brightness-[10] opacity-90" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4">
                    <div className="bg-white/10 rounded-2xl px-4 py-3">
                        <p className="text-sm font-semibold text-white truncate">{name}</p>
                        <p className="text-[0.7rem] text-white/55 mt-0.5">{nim}</p>
                        <button onClick={handleLogout} className="mt-3 text-[0.78rem] text-red-300 hover:text-red-200 flex items-center gap-1">⤷ Logout</button>
                    </div>
                </div>
            </aside>

            {/* ════ MAIN ════ */}
            <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">

                {/* Mobile Header */}
                <header className="md:hidden flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
                    <button onClick={() => navigate(-1)} className="text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-base font-bold text-gray-800">Profil</span>
                </header>

                {/* Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                    <h2 className="text-[1.05rem] font-bold text-gray-800">Profile</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{form.departemen || "-"}</span>
                        <div className="h-5 w-px bg-gray-200" />
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <img src={fotoPreview || fotoUrl || fotoProfile} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" />
                    </div>
                </header>

                <main className="flex-1 px-5 py-6 md:px-8 md:py-8 pb-28 md:pb-10 space-y-5">

                    {/* Alert */}
                    {toast && (
                    <div className="fixed bottom-6 right-6 z-999">
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 w-75 flex items-start gap-3 overflow-hidden relative">
                            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">Profil berhasil diperbarui</p>
                                <p className="text-xs text-gray-400 mt-0.5">Perubahan kamu sudah tersimpan.</p>
                            </div>
                            <button onClick={() => setToast(false)} className="text-gray-300 hover:text-gray-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                    {/* ── PROFILE HEADER CARD ── */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col items-center md:hidden mb-2">
                            <div className="relative mb-3">
                                <img
                                    src={fotoPreview || fotoUrl || fotoProfile}
                                    alt="Profile"
                                    className="h-24 w-24 rounded-2xl object-cover shadow"
                                />
                                <label className={`absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer ${uploadingFoto ? "opacity-50" : ""}`}>
                                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="file" accept="image/jpg,image/jpeg,image/png" onChange={handleFotoChange} className="hidden" disabled={uploadingFoto} />
                                </label>
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-900">{name}</h2>
                            <span className="mt-2 bg-yellow-400 text-yellow-900 text-[0.7rem] font-bold px-4 py-1 rounded-full uppercase tracking-wide">{statusKeanggotaan}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <div className="relative">
                                <img src={fotoPreview || fotoUrl || fotoProfile} alt="Profile" className="h-24 w-24 rounded-2xl object-cover shadow" />
                                <label className={`absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer ${uploadingFoto ? "opacity-50" : ""}`}>
                                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="file" accept="image/jpg,image/jpeg,image/png" onChange={handleFotoChange} className="hidden" disabled={uploadingFoto} />
                                </label>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-extrabold text-gray-900">{name}</h2>
                                    <span className="bg-yellow-400 text-yellow-900 text-[0.72rem] font-bold px-3 py-0.5 rounded-full">{statusKeanggotaan}</span>
                                </div>
                                <p className="text-gray-400 text-sm">{nim}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── MOBILE: FORM ── */}
                    <div className="md:hidden space-y-3">
                        <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400">Informasi Identitas</p>
                        {[["Nama Lengkap", name], ["NIM", nim], ["Angkatan", angkatan]].map(([label, val]) => (
                            <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                                <p className="text-[0.65rem] text-gray-400 mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-gray-800">{val}</p>
                            </div>
                        ))}
                        <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 pt-1">Informasi Organisasi</p>
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[0.65rem] text-gray-400 mb-1">Departemen</p>
                            <select name="departemen" value={form.departemen} onChange={handleChange}
                                className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none">
                                <option value="">-- Pilih Departemen --</option>
                                {DEPARTEMEN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[0.65rem] text-gray-400 mb-1">Jabatan</p>
                            <select
                            name="jabatan"
                            value={form.jabatan}
                            onChange={handleChange}
                            disabled={!form.departemen}
                            className="w-full text-[0.92rem] font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400"
                        >
                            {!form.departemen
                                ? <option value="">Pilih departemen dulu</option>
                                : (JABATAN_BY_DEPARTEMEN[form.departemen] || []).map(j => (
                                    <option key={j} value={j}>{j}</option>
                                ))
                            }
                        </select>
                        </div>
                        <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 pt-1">Kontak</p>
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[0.65rem] text-gray-400 mb-1">Nomor Telepon</p>
                            <input type="text" name="no_telepon" value={form.no_telepon}
                                onChange={handleChange} placeholder="Contoh: 081234567890"
                                className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none" />
                            {phoneError && <p className="text-[0.65rem] text-red-500 mt-1">{phoneError}</p>}
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[0.65rem] text-gray-400 mb-1">Email</p>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-sm font-semibold text-gray-800 truncate">{email}</span>
                            </div>
                        </div>
                        <button onClick={handleSave} disabled={!hasChanges || saving}
                            className={`w-full flex items-center justify-center gap-2 text-white font-bold rounded-full py-4 text-sm transition mt-2 ${btnClass}`}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {saving ? "Menyimpan..." : "Update Profile"}
                        </button>
                    </div>

                    {/* ── DESKTOP: INFO ROWS ── */}
                    <div className="hidden md:grid grid-cols-2 gap-5">
                        {/* Academic & Organization */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                <h3 className="text-base font-bold text-gray-800">Academic &amp; Organization</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Nama Lengkap" value={name} />
                                <Field label="NIM" value={nim} half />
                                <Field label="Angkatan" value={angkatan} half />
                                {/* Departemen dropdown */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <p className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">Departemen</p>
                                    <select name="departemen" value={form.departemen} onChange={handleChange}
                                        className="w-full text-[0.92rem] font-semibold text-gray-800 bg-transparent outline-none">
                                        <option value="">-- Pilih --</option>
                                        {DEPARTEMEN_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {/* Jabatan dropdown */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <p className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">Jabatan</p>
                                    <select
                                    name="jabatan"
                                    value={form.jabatan}
                                    onChange={handleChange}
                                    disabled={!form.departemen}
                                    className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400"
                                >
                                    {!form.departemen
                                        ? <option value="">Pilih departemen dulu</option>
                                        : (JABATAN_BY_DEPARTEMEN[form.departemen] || []).map(j => (
                                            <option key={j} value={j}>{j}</option>
                                        ))
                                    }
                                </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <h3 className="text-base font-bold text-gray-800">Contact Information</h3>
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Email Address</p>
                                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                        <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <span className="text-sm text-gray-700 truncate">{email}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">Phone Number</p>
                                    <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            <input type="text" name="no_telepon" value={form.no_telepon}
                                                onChange={handleChange} placeholder="Contoh: 081234567890"
                                                className="flex-1 text-sm text-gray-700 bg-transparent outline-none" />
                                        </div>
                                        {phoneError && <p className="text-[0.65rem] text-red-500 mt-1">{phoneError}</p>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSave} disabled={!hasChanges || saving}
                                className={`mt-5 w-full flex items-center justify-center gap-2 text-white font-bold rounded-xl py-3.5 text-sm transition ${btnClass}`}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                {saving ? "Menyimpan..." : "Update Profile"}
                            </button>
                        </div>
                    </div>

                    {/* ── DESKTOP: EVENTS ROW ── */}
                    <div className="hidden md:grid grid-cols-2 bg-white rounded-2xl shadow-sm divide-x divide-gray-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="text-base font-bold text-gray-800">Attended Events</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                            {attendedEvents.slice(0, 3).map((ev, i) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{ev.event_name}</p>
                                            <p className="text-[0.72rem] text-gray-400">{ev.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-[0.62rem] font-bold tracking-wider text-green-600 border border-green-300 bg-green-50 px-2.5 py-1 rounded-full uppercase">Verified</span>
                                </div>
                            ))}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="text-base font-bold text-gray-800">Upcoming Activities</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {upcomingActivities.slice(0, 3).map((act, i) => (
                                    <div key={i} className="flex items-center gap-3 py-3">
                                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{act.title}</p>
                                            <p className="text-[0.72rem] text-gray-400">{act.date_time} • {act.location_name || "-"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            {/* ════ MOBILE BOTTOM NAV ════ */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1c5e22] flex z-50">
                {navItems.map((item) => {
                    const isActive = item.to === "/dashboard/profile";
                    return (
                        <Link key={item.label} to={item.to} className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 ${isActive ? "bg-white/15" : ""}`}>
                            <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain brightness-[10]" />
                            <span className="text-[0.58rem] font-bold tracking-[0.12em] text-white/80 uppercase">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
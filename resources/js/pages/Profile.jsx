import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import hmifLogo from "../assets/logo-hmif.png";
import fotoProfile from "../assets/fotoprofile.png";
import iconDashboard from "../assets/icon-dashboard.png";
import iconHistory from "../assets/icon-history.png";
import iconProfile from "../assets/icon-profile.png";
import NotificationBell from "../components/NotificationBell";
import BottomBar from "../components/buttombar";

// HAPUS JABATAN_LIST lama

// GANTI DEPARTEMEN_LIST dan tambah mapping:
const DEPARTEMEN_LIST = [
    "Kesekjenan", "Senator", "DPA", "Eksternal", "PSDA", "Internal", "Keprofesian", "Kominfo",
];

const JABATAN_BY_DEPARTEMEN = {
    "Kesekjenan": ["Ketua Himpunan", "Sekretaris Jenderal", "Sekretaris Umum", "Bendahara Umum"],
    "Senator": ["Senator", "Sekretaris Umum", "Staff"],
    "DPA": ["Koordinator DPA", "Sekretaris Jenderal", "Sekretaris Umum", "Ketua Komisi", "Staff Ahli", "Staff"],
    "Eksternal": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "PSDA": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "Internal": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi","Staff Ahli", "Staff"],
    "Keprofesian": ["Kepala Departemen", "Sekretaris Departemen", "Kepala Divisi", "Staff Ahli", "Staff"],
    "Kominfo": ["Kepala Departemen", "Sekretaris Departemen","Kepala Divisi", "Staff Ahli", "Staff"],
};

const normalizeJabatan = (value) => {
    return String(value ?? "").trim() || "";
};

const normalizeProfileForm = (data) => {
    const profile = data?.profile || {};

    return {
        status_keanggotaan: profile.status_keanggotaan || "Muda",
        departemen: profile.departemen || profile.Departemen || "",
        jabatan: normalizeJabatan(profile.jabatan),
        no_telepon: profile.no_telepon || "",
    };
};

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = React.useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(
        localStorage.getItem("sidebar-collapsed") === "true"
    );

    const toggleSidebarCollapse = () => {
        const newValue = !isSidebarCollapsed;
        setIsSidebarCollapsed(newValue);
        localStorage.setItem("sidebar-collapsed", String(newValue));
    };
    const [saving, setSaving] = React.useState(false);
    const [toast, setToast] = React.useState(false);
    const toastTimer = React.useRef(null);
    const [fotoUrl, setFotoUrl] = React.useState(null);
    const [fotoLoadFailed, setFotoLoadFailed] = React.useState(false);
    const [uploadingFoto, setUploadingFoto] = React.useState(false);
    const [fotoFile, setFotoFile] = React.useState(null);
    const [fotoPreview, setFotoPreview] = React.useState(null);

    // Crop Image States
    const [cropModalOpen, setCropModalOpen] = React.useState(false);
    const [cropImageSrc, setCropImageSrc] = React.useState(null);
    const [zoom, setZoom] = React.useState(1.0);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = React.useState({ width: 0, height: 0 });
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);

    React.useEffect(() => {
        if (!cropImageSrc) return;
        const img = new Image();
        img.onload = () => {
            const aspect = img.naturalWidth / img.naturalHeight;
            let width, height;
            if (aspect > 1) {
                height = 288;
                width = 288 * aspect;
            } else {
                width = 288;
                height = 288 / aspect;
            }
            setImageDimensions({ width, height });
        };
        img.src = cropImageSrc;
    }, [cropImageSrc]);

    const showToast = () => {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(false), 3000);
    };

    // Form state
    const [form, setForm] = React.useState({
        status_keanggotaan: "Muda",
        departemen: "",
        jabatan: "",
        no_telepon: "",
    });
    const [savedForm, setSavedForm] = React.useState({ ...form });
    const [phoneError, setPhoneError] = React.useState("");
    const hasUnsavedChangesRef = React.useRef(false);

    const [attendedEvents, setAttendedEvents] = React.useState([]);
    const [upcomingActivities, setUpcomingActivities] = React.useState([]);

    const applyProfileData = React.useCallback((data) => {
        setProfile(data);
        setFotoLoadFailed(false);
        setFotoUrl(data?.profile?.foto
            ? `/storage/${data.profile.foto}`
            : null
        );

        const nextForm = normalizeProfileForm(data);
        setForm(nextForm);
        setSavedForm(nextForm);
    }, []);

    const fetchProfile = React.useCallback(async () => {
        const token = localStorage.getItem("auth_token");

        if (!token) return;

        const res = await fetch("/api/me", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            }
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Gagal fetch profil");
        }

        applyProfileData(data);
    }, [applyProfileData]);

    const fetchProfileLists = React.useCallback(async () => {
        const token = localStorage.getItem("auth_token");

        if (!token) return;

        const headers = {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
        };

        fetch("/api/attendances/me", { headers })
            .then(res => res.json())
            .then(data => setAttendedEvents(Array.isArray(data) ? data : []))
            .catch(err => console.error("Gagal fetch history:", err));

        fetch("/api/events", { headers })
            .then(res => res.json())
            .then(data => setUpcomingActivities(Array.isArray(data) ? data : []))
            .catch(err => console.error("Gagal fetch events:", err));
    }, []);

    React.useEffect(() => {
        fetchProfile().catch(err => console.error("Gagal fetch profil:", err));
        fetchProfileLists();

        const handleFocus = () => {
            // Kalau ada unsaved changes, skip fetch profile
            // tapi tetap fetch lists
            if (!hasUnsavedChangesRef.current) {
                fetchProfile().catch(err => console.error("Gagal sinkron profil:", err));
            }
            fetchProfileLists();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchProfile, fetchProfileLists]);

    const name = profile?.name || localStorage.getItem("name") || "Anggota HMIF";
    const nim = profile?.nim || "-";
    const statusKeanggotaan = profile?.profile?.status_keanggotaan || "Muda";
    const statusLabel = statusKeanggotaan === "Non Anggota" 
        ? "Non Anggota" 
        : (statusKeanggotaan.toLowerCase().startsWith("anggota")
            ? statusKeanggotaan
            : `Anggota ${statusKeanggotaan}`);
    const email = profile?.email || "-";
    const angkatan = nim.length >= 3 ? "20" + nim.replace(/\D/g, "").substring(1, 3) : "-";

    const hasChanges =
        form.status_keanggotaan !== savedForm.status_keanggotaan ||
        form.departemen !== savedForm.departemen ||
        form.jabatan !== savedForm.jabatan ||
        form.no_telepon !== savedForm.no_telepon ||
        fotoFile !== null;

    React.useEffect(() => {
        hasUnsavedChangesRef.current = hasChanges;
    }, [hasChanges]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log("handleChange:", name, value); 
        if (name === "no_telepon") {
            if (!/^\d*$/.test(value)) {
                setPhoneError("Nomor telepon hanya boleh berisi angka");
                return;
            }
            setPhoneError("");
        }
        if (name === "status_keanggotaan") {
            if (value === "Non Anggota") {
                setForm(prev => ({ ...prev, status_keanggotaan: value, departemen: "", jabatan: "" }));
            } else {
                setForm(prev => ({ ...prev, status_keanggotaan: value }));
            }
            return;
        }
        if (name === "departemen") {
            const firstJabatan = JABATAN_BY_DEPARTEMEN[value]?.[0] || "";
            setForm(prev => ({ ...prev, departemen: value, jabatan: firstJabatan }));
            return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result);
            setZoom(1.0);
            setOffset({ x: 0, y: 0 });
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        setDragStart({
            x: clientX - offset.x,
            y: clientY - offset.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY;
        setOffset({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleCropCancel = () => {
        setCropModalOpen(false);
        setCropImageSrc(null);
    };

    const handleCropSave = () => {
        const img = new Image();
        img.onload = () => {
            // --- Langkah 1: Crop ke 300x300 ---
            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = 300;
            cropCanvas.height = 300;
            const ctx = cropCanvas.getContext("2d");

            ctx.clearRect(0, 0, 300, 300);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            const scale = 1.5;
            const canvasImageWidth = imageDimensions.width * zoom * scale;
            const canvasImageHeight = imageDimensions.height * zoom * scale;
            const canvasImageCenterX = 150 + offset.x * scale;
            const canvasImageCenterY = 150 + offset.y * scale;

            const drawX = canvasImageCenterX - canvasImageWidth / 2;
            const drawY = canvasImageCenterY - canvasImageHeight / 2;

            ctx.drawImage(img, drawX, drawY, canvasImageWidth, canvasImageHeight);

            // --- Langkah 2: Kompresi otomatis (resize + convert ke JPEG) ---
            const MAX_SIZE = 600; // px — cukup untuk foto profil
            const srcW = cropCanvas.width;
            const srcH = cropCanvas.height;
            const ratio = Math.min(MAX_SIZE / srcW, MAX_SIZE / srcH, 1); // tidak pernah memperbesar
            const outW = Math.round(srcW * ratio);
            const outH = Math.round(srcH * ratio);

            const compCanvas = document.createElement("canvas");
            compCanvas.width = outW;
            compCanvas.height = outH;
            const compCtx = compCanvas.getContext("2d");
            compCtx.imageSmoothingEnabled = true;
            compCtx.imageSmoothingQuality = "high";
            compCtx.drawImage(cropCanvas, 0, 0, outW, outH);

            // Export sebagai JPEG kualitas 80% — jauh lebih kecil dari PNG
            compCanvas.toBlob((blob) => {
                if (!blob) return;
                // Tampilkan ukuran file ke console untuk debugging
                console.log(`[Foto] Ukuran setelah kompresi: ${(blob.size / 1024).toFixed(1)} KB`);
                const file = new File([blob], "profile_photo.jpg", { type: "image/jpeg" });
                setFotoFile(file);
                setFotoPreview(URL.createObjectURL(file));
                setCropModalOpen(false);
            }, "image/jpeg", 0.80); // kualitas 80%
        };
        img.src = cropImageSrc;
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
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Gagal menyimpan");
            }

            if (data.logout) {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("email");
                localStorage.removeItem("name");
                window.location.href = "/login?error=menunggu_validasi";
                return;
            }

            const nextForm = {
            status_keanggotaan: form.status_keanggotaan,
            departemen: form.departemen,
            jabatan: form.jabatan,
            no_telepon: form.no_telepon,
        };

        setForm(nextForm);
        setSavedForm(nextForm);
            setProfile((current) => ({
                ...(current || {}),
                profile: {
                    ...(current?.profile || {}),
                    ...(data.profile || {}),
                    status_keanggotaan: nextForm.status_keanggotaan,
                    departemen: nextForm.departemen,
                    jabatan: nextForm.jabatan,
                    no_telepon: nextForm.no_telepon,
                },
            }));
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

    const role = profile?.role || localStorage.getItem("role");
    const navItems = [
        { label: "Dashboard", icon: iconDashboard, to: "/dashboard/member" },
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
    const displayFoto = fotoLoadFailed ? fotoProfile : (fotoPreview || fotoUrl || fotoProfile);

    return (
        <div className="min-h-screen bg-[#f0f2ee] font-sans flex">
            {/* ─── SIDEBAR (RESPONSIVE) ─── */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                role="anggota"
                userName={name}
                nim={nim}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebarCollapse={toggleSidebarCollapse}
            />

            {/* ─── MAIN AREA ─── */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? "md:ml-[76px]" : "md:ml-[240px]"}`}>

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
                            aria-label="Open sidebar"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span className="text-base font-bold text-gray-800">Profil</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full border border-red-100 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 transition active:scale-95"
                    >
                        Logout
                    </button>
                </header>

                {/* Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between bg-white px-8 py-[14px] border-b border-gray-100 sticky top-0 z-40">
                    <h2 className="text-[1.05rem] font-bold text-gray-800">Profile</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-[0.7rem] font-bold tracking-[0.18em] uppercase text-gray-400">{form.departemen || "-"}</span>
                        <div className="h-5 w-px bg-gray-200" />
                        <NotificationBell />
                        <img src={displayFoto} alt="avatar" className="h-9 w-9 rounded-full object-cover border-2 border-gray-200" onError={() => setFotoLoadFailed(true)} />
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
                    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Profile Photo */}
                        <div className="relative shrink-0">
                            <img
                                src={displayFoto}
                                alt="Profile"
                                className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover shadow-sm border border-slate-100"
                                onError={() => setFotoLoadFailed(true)}
                            />
                            <label className={`absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-2 shadow-md cursor-pointer hover:bg-green-700 active:scale-95 transition-all duration-200 ${uploadingFoto ? "opacity-50" : ""}`}>
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input type="file" accept="image/jpg,image/jpeg,image/png" onChange={handleFotoChange} className="hidden" disabled={uploadingFoto} />
                            </label>
                        </div>

                        {/* Profile Details */}
                        <div className="flex-1 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
                            <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">
                                Member Profile
                            </p>
                            <span className="inline-block bg-yellow-400 text-yellow-900 text-[0.7rem] font-bold px-3 py-0.5 rounded-full mb-3">
                                {statusLabel}
                            </span>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{name}</h2>
                            <p className="text-sm text-gray-400 font-semibold mb-4">{form.departemen || "-"}</p>

                            {/* NIM Tag */}
                            <div className="flex w-full max-w-[250px] items-center justify-between rounded-xl bg-[#1c5e22] px-4 py-2.5">
                                <div>
                                    <p className="text-[0.55rem] font-bold tracking-[0.18em] uppercase text-white/70 leading-none mb-0.5">NIM</p>
                                    <p className="text-[0.95rem] font-bold text-white tracking-widest leading-none">{nim}</p>
                                </div>
                                <svg className="h-4.5 w-4.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* ─── MOBILE: FORM ─── */}
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
                            <p className="text-[0.65rem] text-gray-400 mb-1">Jenis Keanggotaan</p>
                            <select name="status_keanggotaan" value={form.status_keanggotaan} onChange={handleChange}
                                className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none">
                                <option value="Muda">Anggota Muda</option>
                                <option value="Tetap">Anggota Tetap</option>
                                <option value="Luar Biasa">Anggota Luar Biasa</option>
                                <option value="Non Anggota">Non Anggota</option>
                            </select>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-[0.65rem] text-gray-400 mb-1">Departemen</p>
                            <select name="departemen" value={form.departemen} onChange={handleChange}
                                disabled={form.status_keanggotaan === "Non Anggota"}
                                className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400 disabled:opacity-50">
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
                            disabled={!form.departemen || form.status_keanggotaan === "Non Anggota"}
                            className="w-full text-[0.92rem] font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400 disabled:opacity-50"
                        >
                            {!form.departemen || form.status_keanggotaan === "Non Anggota"
                            ? <option value="">-</option>
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

                    {/* Ã¢â€â‚¬Ã¢â€â‚¬ DESKTOP: INFO ROWS Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                                
                                {/* Status Keanggotaan */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 col-span-2 md:col-span-1">
                                    <p className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">Jenis Keanggotaan</p>
                                    <select name="status_keanggotaan" value={form.status_keanggotaan} onChange={handleChange}
                                        className="w-full text-[0.92rem] font-semibold text-gray-800 bg-transparent outline-none">
                                        <option value="Muda">Anggota Muda</option>
                                        <option value="Tetap">Anggota Tetap</option>
                                        <option value="Luar Biasa">Anggota Luar Biasa</option>
                                        <option value="Non Anggota">Non Anggota</option>
                                    </select>
                                </div>
                                
                                {/* Departemen dropdown */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 col-span-2 md:col-span-1">
                                    <p className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-gray-400 mb-1">Departemen</p>
                                    <select name="departemen" value={form.departemen} onChange={handleChange}
                                        disabled={form.status_keanggotaan === "Non Anggota"}
                                        className="w-full text-[0.92rem] font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400 disabled:opacity-50">
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
                                    disabled={!form.departemen || form.status_keanggotaan === "Non Anggota"}
                                    className="w-full text-sm font-semibold text-gray-800 bg-transparent outline-none disabled:text-gray-400 disabled:opacity-50"
                                >
                                    {!form.departemen || form.status_keanggotaan === "Non Anggota"
                                    ? <option value="">-</option>
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

                    {/* Ã¢â€â‚¬Ã¢â€â‚¬ DESKTOP: EVENTS ROW Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                                            <p className="text-[0.72rem] text-gray-400">{act.date_time} Ã¢â‚¬Â¢ {act.location_name || "-"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </main>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <BottomBar items={navItems.map(item => ({ label: item.label, href: item.to }))} activeHref="/dashboard/profile" />

            {cropModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col items-center">
                        <h3 className="text-lg font-bold text-white mb-4">Sesuaikan Foto Profil</h3>
                        
                        {/* Cropping Window */}
                        <div 
                            className="relative w-72 h-72 overflow-hidden bg-slate-950 rounded-2xl cursor-move touch-none border border-slate-800"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                        >
                            <img 
                                src={cropImageSrc} 
                                alt="Crop source"
                                className="absolute max-w-none origin-center pointer-events-none select-none"
                                style={{
                                    width: `${imageDimensions.width}px`,
                                    height: `${imageDimensions.height}px`,
                                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                                    top: '50%',
                                    left: '50%',
                                }}
                            />
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="absolute w-[200px] h-[200px] rounded-2xl border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
                            </div>
                        </div>

                        {/* Zoom Slider */}
                        <div className="w-full mt-6 space-y-2">
                            <div className="flex justify-between text-xs text-slate-400 font-semibold">
                                <span>Perkecil</span>
                                <span>Perbesar ({zoom.toFixed(1)}x)</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                step="0.05"
                                value={zoom} 
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full mt-6 flex gap-3">
                            <button 
                                onClick={handleCropCancel}
                                className="flex-1 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm py-3 transition hover:bg-slate-700/80 active:scale-95"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleCropSave}
                                className="flex-1 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-sm py-3 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition hover:bg-emerald-400 active:scale-95"
                            >
                                Gunakan Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

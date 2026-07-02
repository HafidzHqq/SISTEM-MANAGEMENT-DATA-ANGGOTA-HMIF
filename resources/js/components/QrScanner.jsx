import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import jsQR from "jsqr";
import iconQr from "../assets/icon-qrscan.png";
import hmifLogo from "../assets/logo-hmif.png";

const getAuthHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const postJson = (url, body) => {
    const token = localStorage.getItem("auth_token");
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
};

const toDateTime = (value) => {
    if (!value) return null;
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? null : date;
};

const isEventOpen = (event) => {
    const now = new Date();
    const start = toDateTime(event?.attendance_window_start);
    const end = toDateTime(event?.attendance_window_end);
    return (!start || now >= start) && (!end || now <= end);
};

const eventLabel = (event) => {
    const date = toDateTime(event?.date_time);
    const dateText = date
        ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
        : "Tanpa tanggal";
    return `${event?.title || "Tanpa Judul"} - ${dateText}`;
};

function FlashIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 2h6l-1.2 6H17l-6 14 1.1-8H8l1-12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function UploadImageIcon() {
    return (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="m6.5 17 3.2-3.3a1 1 0 0 1 1.4 0l1.2 1.2 2.3-2.8a1 1 0 0 1 1.5-.1l1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 9h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function MemberQrView({ navigate }) {
    const [user, setUser] = React.useState(null);
    const [events, setEvents] = React.useState([]);
    const [eventId, setEventId] = React.useState("");
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        Promise.all([
            fetch("/api/me", { headers: getAuthHeaders() }).then((res) => res.json()),
            fetch("/api/events", { headers: getAuthHeaders() }).then((res) => res.json()),
        ])
            .then(([me, eventData]) => {
                const list = Array.isArray(eventData) ? eventData : Array.isArray(eventData.data) ? eventData.data : [];
                const openEvents = list.filter(isEventOpen);
                setUser(me);
                setEvents(openEvents);
                setEventId(String(openEvents[0]?.event_id || ""));
            })
            .catch(() => setError("Gagal memuat data QR."));
    }, []);

    const selectedEvent = events.find((event) => String(event.event_id) === String(eventId));
    const qrPayload = user && selectedEvent ? JSON.stringify({
        type: "hmif_user_attendance",
        version: 1,
        event_id: selectedEvent.event_id,
        user_id: user.user_id,
        nim: user.nim,
        name: user.name,
    }) : "";
    const qrUrl = qrPayload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(qrPayload)}`
        : "";
    const hasActiveEvents = events.length > 0;

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(31,94,34,0.16),transparent_30%),linear-gradient(180deg,#f7fbf7_0%,#eaf3ea_100%)] px-4 py-5 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-md">
                <div className="mb-5 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white">Kembali</button>
                    <div className="flex items-center gap-2">
                        <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain" />
                        <span className="text-sm font-extrabold">HMIF</span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 p-5 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">QR Presensi Saya</p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Tunjukkan ke Admin</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">Pilih acara, lalu admin memindai QR ini untuk mencatat kehadiran secara cepat.</p>

                    {hasActiveEvents ? (
                        <>
                            <label className="mt-5 block text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Acara</label>
                            <select
                                value={eventId}
                                onChange={(e) => setEventId(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                {events.map((event) => (
                                    <option key={event.event_id} value={event.event_id}>{eventLabel(event)}</option>
                                ))}
                            </select>
                        </>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-800">
                            Tidak ada acara aktif saat ini.
                        </div>
                    )}

                    {hasActiveEvents && (
                        <div className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50 p-4">
                            {qrUrl ? (
                                <img src={qrUrl} alt="QR presensi anggota" className="mx-auto h-64 w-64 rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)]" />
                            ) : (
                                <div className="flex h-64 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-400">QR belum tersedia</div>
                            )}
                        </div>
                    )}

                    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-left ring-1 ring-emerald-100">
                        <p className="text-sm font-extrabold text-emerald-900">{user?.name || localStorage.getItem("name") || "Anggota"}</p>
                        <p className="mt-1 text-xs font-semibold text-emerald-700">NIM: {user?.nim || localStorage.getItem("nim") || "-"}</p>
                    </div>

                    {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
                </div>
            </div>
        </div>
    );
}

function AdminScannerView({ navigate }) {
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const rafRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const isProcessingRef = React.useRef(false);
    const streamRef = React.useRef(null);

    const [cameraError, setCameraError] = React.useState("");
    const [status, setStatus] = React.useState(null);
    const [statusMsg, setStatusMsg] = React.useState("");
    const [torchOn, setTorchOn] = React.useState(false);
    const [torchSupported, setTorchSupported] = React.useState(false);
    const [events, setEvents] = React.useState([]);
    const [members, setMembers] = React.useState([]);
    const [manualEventId, setManualEventId] = React.useState("");
    const [manualUserId, setManualUserId] = React.useState("");
    const [manualRemarks, setManualRemarks] = React.useState("Set hadir manual oleh admin");

    React.useEffect(() => {
        Promise.all([
            fetch("/api/events", { headers: getAuthHeaders() }).then((res) => res.json()),
            fetch("/api/members", { headers: getAuthHeaders() }).then((res) => res.json()),
        ])
            .then(([eventData, memberData]) => {
                const eventList = Array.isArray(eventData) ? eventData : Array.isArray(eventData.data) ? eventData.data : [];
                const memberList = Array.isArray(memberData) ? memberData : Array.isArray(memberData.data) ? memberData.data : [];
                const openEvents = eventList.filter(isEventOpen);
                setEvents(openEvents.length ? openEvents : eventList);
                setMembers(memberList.filter((member) => member.status !== "non-aktif" && member.role !== "super_admin"));
                setManualEventId(String((openEvents[0] || eventList[0])?.event_id || ""));
                setManualUserId(String(memberList[0]?.user_id || ""));
            })
            .catch(() => setStatusMsg("Gagal memuat data manual."));
    }, []);

    const resetScan = React.useCallback(() => {
        setTimeout(() => {
            isProcessingRef.current = false;
            setStatus(null);
            setStatusMsg("");
            startScanLoop();
        }, 2500);
    }, []);

    const submitScan = async (qrPayload) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        cancelAnimationFrame(rafRef.current);
        setStatus("loading");
        setStatusMsg("Memverifikasi QR anggota...");

        try {
            const res = await postJson("/api/attendances/admin-scan", { qr_payload: qrPayload });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setStatusMsg(data.message || "Presensi berhasil dicatat.");
                resetScan();
            } else {
                setStatus("error");
                setStatusMsg(data.message || "QR tidak valid atau presensi gagal.");
                resetScan();
            }
        } catch (err) {
            setStatus("error");
            setStatusMsg("Gagal terhubung ke server.");
            resetScan();
        }
    };

    const startScanLoop = React.useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const tick = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                if (code?.data) {
                    submitScan(code.data);
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code?.data) submitScan(code.data);
                else {
                    setStatus("error");
                    setStatusMsg("QR tidak terbaca dari gambar.");
                    resetScan();
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    React.useEffect(() => {
        let isMounted = true;
        async function startCamera() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    setCameraError("Browser belum mendukung akses kamera.");
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
                streamRef.current = stream;
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities?.() || {};
                if (capabilities.torch) setTorchSupported(true);
                if (isMounted && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    startScanLoop();
                }
            } catch (err) {
                setCameraError("Kamera tidak bisa dibuka. Aktifkan izin kamera lalu refresh halaman.");
            }
        }
        startCamera();
        return () => {
            isMounted = false;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [startScanLoop]);

    const toggleTorch = async () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;
        const next = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
    };

    const submitManual = async (event) => {
        event.preventDefault();
        setStatus("loading");
        setStatusMsg("Menyimpan presensi manual...");
        try {
            const res = await postJson("/api/attendances/manual", {
                event_id: manualEventId,
                user_id: manualUserId,
                remarks: manualRemarks,
            });
            const data = await res.json();
            setStatus(res.ok ? "success" : "error");
            setStatusMsg(data.message || (res.ok ? "Presensi manual berhasil." : "Presensi manual gagal."));
            resetScan();
        } catch (err) {
            setStatus("error");
            setStatusMsg("Gagal terhubung ke server.");
            resetScan();
        }
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(185deg,#0a190a_0%,#0f2e14_100%)] text-white font-sans flex flex-col">
            {/* Header / Top Bar */}
            <header className="z-30 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/15 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold transition hover:bg-white/15">
                        ← Kembali
                    </button>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <img src={hmifLogo} alt="HMIF" className="h-5 w-5" />
                        <span className="text-xs font-semibold tracking-wide">Scan Admin</span>
                    </div>
                </div>
                <h1 className="hidden sm:block text-sm font-extrabold text-white/90">Sistem Presensi HMIF</h1>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
                
                {/* Left Side: Camera Scanner Viewport */}
                <section className="lg:col-span-7 flex flex-col justify-between rounded-[28px] border border-white/10 bg-black/40 overflow-hidden relative min-h-[380px] sm:min-h-[460px] shadow-2xl">
                    {/* Camera Video Stream */}
                    <div className="absolute inset-0 z-0">
                        <video ref={videoRef} className="h-full w-full object-cover" playsInline autoPlay muted />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.5)_70%,rgba(0,0,0,0.85)_100%)]" />
                    </div>

                    {/* Camera Status Notification */}
                    {(cameraError || status) && (
                        <div className="z-10 m-4 flex justify-center">
                            <div className={`w-full max-w-md rounded-2xl px-4 py-3 text-center text-xs sm:text-sm font-bold shadow-lg backdrop-blur ${
                                status === "loading" ? "bg-yellow-600/90" : status === "success" ? "bg-green-600/90" : "bg-red-600/90"
                            }`}>
                                {statusMsg || cameraError}
                            </div>
                        </div>
                    )}

                    {/* Scanning Target Frame overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                        <div className="relative h-56 w-56 sm:h-64 sm:w-64 border border-white/20 rounded-[28px]">
                            {/* Scanning Target Corners */}
                            <div className="absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-emerald-400" />
                            <div className="absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-emerald-400" />
                            <div className="absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-emerald-400" />
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-emerald-400" />
                            
                            {/* Glowing scan bar animation */}
                            <div className="absolute inset-x-0 h-1 bg-[linear-gradient(90deg,transparent,rgba(52,211,153,0.8),transparent)] animate-pulse" style={{
                                top: '50%',
                                boxShadow: '0 0 15px rgba(52, 211, 153, 0.8)'
                            }} />
                        </div>
                    </div>

                    {/* Camera Control overlay */}
                    <div className="z-10 m-4 flex items-center justify-between mt-auto">
                        <span className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[0.72rem] font-semibold tracking-wide text-white/80 backdrop-blur">
                            Pusatkan QR dalam bingkai
                        </span>
                        
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur">
                            <button type="button" onClick={torchSupported ? toggleTorch : undefined} className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition ${!torchSupported ? "opacity-30" : torchOn ? "bg-yellow-400/30 text-yellow-300" : "hover:bg-white/15"}`} title="Aktifkan Senter">
                                <FlashIcon />
                            </button>
                            <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/15" title="Unggah Foto QR">
                                <UploadImageIcon />
                                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </section>

                {/* Right Side: Control Panels & Fallback Forms */}
                <section className="lg:col-span-5 flex flex-col gap-5">
                    
                    {/* Info Card */}
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                        <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-emerald-400">QR Scanner</p>
                        <h2 className="mt-1 text-2xl font-black text-white">Scan Cepat & Fallback</h2>
                        <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                            Arahkan QR Code anggota ke kamera untuk mencatat kehadiran. Jika terkendala masalah teknis, gunakan opsi unggah gambar QR atau presensi manual di bawah.
                        </p>
                    </div>

                    {/* Presensi Manual Panel */}
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-md flex-1">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-white mb-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            Presensi Manual
                        </h3>
                        <form onSubmit={submitManual} className="space-y-4">
                            <div>
                                <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/55 mb-1.5">Pilih Acara</label>
                                <select value={manualEventId} onChange={(e) => setManualEventId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white outline-none transition focus:border-emerald-500 focus:bg-black/50">
                                    {events.map((event) => <option key={event.event_id} value={event.event_id} className="bg-slate-950 text-white">{eventLabel(event)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/55 mb-1.5">Nama Anggota</label>
                                <select value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white outline-none transition focus:border-emerald-500 focus:bg-black/50">
                                    {members.map((member) => <option key={member.user_id} value={member.user_id} className="bg-slate-950 text-white">{member.name} - {member.nim || "Tanpa NIM"}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/55 mb-1.5">Catatan Kehadiran</label>
                                <input value={manualRemarks} onChange={(e) => setManualRemarks(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white outline-none transition focus:border-emerald-500 focus:bg-black/50" placeholder="Keterangan kehadiran..." />
                            </div>
                            <button type="submit" className="w-full mt-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500">
                                Simpan Kehadiran
                            </button>
                        </form>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="rounded-[24px] border border-white/10 bg-white/5 p-3 flex justify-between gap-3 text-white/70">
                        <Link to="/dashboard" className="flex-1 py-2.5 rounded-xl bg-black/25 flex items-center justify-center gap-2 text-xs font-semibold hover:bg-black/45 hover:text-white transition">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Dashboard
                        </Link>
                        <Link to="/dashboard/laporan" className="flex-1 py-2.5 rounded-xl bg-black/25 flex items-center justify-center gap-2 text-xs font-semibold hover:bg-black/45 hover:text-white transition">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Laporan
                        </Link>
                    </div>

                </section>
            </main>
        </div>
    );
}

export default function QrScanner() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");
    const forceMemberQr = new URLSearchParams(location.search).get("mode") === "user";
    const isAdminScanner = (role === "admin" || role === "super_admin") && !forceMemberQr;

    return isAdminScanner ? <AdminScannerView navigate={navigate} /> : <MemberQrView navigate={navigate} />;
}
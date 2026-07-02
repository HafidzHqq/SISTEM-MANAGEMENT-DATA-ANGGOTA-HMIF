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
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#081108_0%,#101b12_100%)] text-white">
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline autoPlay muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.3)_55%,rgba(0,0,0,0.7)_100%)]" />

            <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6">
                <button onClick={() => navigate(-1)} className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold backdrop-blur transition hover:bg-black/45">
                    Kembali
                </button>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur">
                    <img src={hmifLogo} alt="HMIF" className="h-6 w-6" />
                    <span className="text-sm font-bold tracking-wide">Scan Admin</span>
                </div>
                <div className="w-20" />
            </div>

            {(cameraError || status) && (
                <div className={`absolute left-1/2 top-20 z-40 w-[90%] max-w-md -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-lg ${
                    status === "loading" ? "bg-yellow-600/90" : status === "success" ? "bg-green-600/90" : "bg-red-600/90"
                }`}>
                    {statusMsg || cameraError}
                </div>
            )}

            <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-4">
                <div className="relative h-64 w-64 sm:h-80 sm:w-80">
                    <div className="absolute inset-0 rounded-[34px] border border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]" />
                    <div className="absolute inset-4 rounded-[26px] border border-white/18 bg-white/4 backdrop-blur-[1px]" />
                    <div className="absolute -left-2 -top-2 h-8 w-8 rounded-tl-md border-l-4 border-t-4 border-white" />
                    <div className="absolute -right-2 -top-2 h-8 w-8 rounded-tr-md border-r-4 border-t-4 border-white" />
                    <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-bl-md border-b-4 border-l-4 border-white" />
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-br-md border-b-4 border-r-4 border-white" />
                    <div className="absolute inset-x-0 -bottom-14 flex justify-center">
                        <div className="rounded-full border border-white/12 bg-black/25 px-4 py-2 text-[0.72rem] font-semibold tracking-[0.16em] text-white/80 backdrop-blur">
                            Pusatkan QR di dalam bingkai
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-6">
                <div className="mx-auto max-w-2xl rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-emerald-300">QR Scanner</p>
                            <h2 className="text-[1.9rem] font-black tracking-tight text-white sm:text-[2.2rem]">Scan cepat, fallback tetap siap</h2>
                            <p className="max-w-xl text-sm leading-relaxed text-white/70">
                                Arahkan QR ke kamera. Jika cahaya kurang atau kamera gagal membaca, aktifkan lampu atau unggah gambar QR.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-black/15 p-2">
                            <button type="button" onClick={torchSupported ? toggleTorch : undefined} className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-lg transition ${!torchSupported ? "opacity-40" : torchOn ? "bg-yellow-400/30" : "hover:bg-white/20"}`}>
                                <FlashIcon />
                            </button>
                            <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-lg transition hover:bg-white/20">
                                <UploadImageIcon />
                                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_320px]">
                        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                            <p className="font-bold text-white">Panduan scan</p>
                            <p className="mt-1 leading-relaxed">Pastikan QR penuh di layar, jangan terlalu dekat, dan posisikan di area bingkai. Hasil sukses akan muncul otomatis tanpa tombol tambahan.</p>
                        </div>

                        <details className="rounded-[22px] border border-white/10 bg-white/5 p-4 text-white/85">
                            <summary className="cursor-pointer list-none text-sm font-bold tracking-[0.16em] text-white">Presensi Manual</summary>
                            <p className="mt-2 text-sm text-white/65">Gunakan jika QR tidak terbaca atau anggota tidak bisa menampilkan QR.</p>
                            <form onSubmit={submitManual} className="mt-4 space-y-3 text-slate-900">
                                <select value={manualEventId} onChange={(e) => setManualEventId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                                    {events.map((event) => <option key={event.event_id} value={event.event_id}>{eventLabel(event)}</option>)}
                                </select>
                                <select value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
                                    {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.name} - {member.nim || "Tanpa NIM"}</option>)}
                                </select>
                                <input value={manualRemarks} onChange={(e) => setManualRemarks(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                                <button type="submit" className="w-full rounded-2xl bg-[linear-gradient(135deg,#1f7a2c_0%,#2b8f3c_100%)] px-4 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(31,122,44,0.28)] transition hover:brightness-105">
                                    Set Hadir
                                </button>
                            </form>
                        </details>
                    </div>

                    <div className="mt-4 flex justify-between rounded-[22px] border border-white/10 bg-white/5 p-3 text-white/85">
                        <Link to="/dashboard" className="flex flex-col items-center text-xs font-bold transition hover:text-white">
                            <img src={iconQr} alt="" className="mb-1 h-5 w-5 object-contain" />Dashboard
                        </Link>
                        <Link to="/dashboard/laporan" className="flex flex-col items-center text-xs font-bold transition hover:text-white">
                            Laporan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QrScanner() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");
    const forceMemberQr = new URLSearchParams(location.search).get("mode") === "user";
    const isAdminScanner = (role === "admin" || role === "super_admin") && !(role === "admin" && forceMemberQr);

    return isAdminScanner ? <AdminScannerView navigate={navigate} /> : <MemberQrView navigate={navigate} />;
}
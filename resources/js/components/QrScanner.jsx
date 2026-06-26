import React from "react";
import { useNavigate, Link } from "react-router-dom";
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
                setEvents(openEvents.length ? openEvents : list);
                setEventId(String((openEvents[0] || list[0])?.event_id || ""));
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

    return (
        <div className="min-h-screen bg-[#e7f5e5] px-4 py-5 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-md">
                <div className="mb-5 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">Kembali</button>
                    <div className="flex items-center gap-2">
                        <img src={hmifLogo} alt="HMIF" className="h-8 w-8 object-contain" />
                        <span className="text-sm font-extrabold">HMIF</span>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">QR Presensi Saya</p>
                    <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Tunjukkan ke Admin</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">Pilih acara, lalu admin akan memindai QR ini untuk mencatat kehadiran.</p>

                    <label className="mt-5 block text-left text-xs font-bold uppercase tracking-wide text-slate-500">Acara</label>
                    <select
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        {events.map((event) => (
                            <option key={event.event_id} value={event.event_id}>{eventLabel(event)}</option>
                        ))}
                    </select>

                    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        {qrUrl ? (
                            <img src={qrUrl} alt="QR presensi anggota" className="mx-auto h-64 w-64 rounded-xl bg-white p-3 shadow-sm" />
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-400">QR belum tersedia</div>
                        )}
                    </div>

                    <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-left">
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
        <div className="min-h-screen bg-black text-white md:grid md:grid-cols-[1fr_380px]">
            <div className="relative flex min-h-[62vh] flex-col md:min-h-screen">
                <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-3">
                    <button onClick={() => navigate(-1)} className="rounded-full bg-black/45 px-4 py-2 text-sm font-bold">Kembali</button>
                    <div className="flex items-center gap-3"><img src={hmifLogo} alt="HMIF" className="h-7 w-7" /><span className="font-bold">Scan Admin</span></div>
                    <div className="w-20" />
                </div>

                <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline autoPlay muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 bg-black/55" />

                {(cameraError || status) && (
                    <div className={`absolute left-1/2 top-20 z-40 w-[90%] max-w-md -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm font-bold shadow-lg ${
                        status === "loading" ? "bg-yellow-600/90" : status === "success" ? "bg-green-600/90" : "bg-red-600/90"
                    }`}>
                        {statusMsg || cameraError}
                    </div>
                )}

                <div className="relative z-20 flex flex-1 items-center justify-center pt-16">
                    <div className="relative h-64 w-64 sm:h-80 sm:w-80">
                        <div className="absolute inset-0 rounded-2xl border-2 border-white/90" />
                        <div className="absolute -left-2 -top-2 h-8 w-8 rounded-tl-md border-l-4 border-t-4 border-white" />
                        <div className="absolute -right-2 -top-2 h-8 w-8 rounded-tr-md border-r-4 border-t-4 border-white" />
                        <div className="absolute -bottom-2 -left-2 h-8 w-8 rounded-bl-md border-b-4 border-l-4 border-white" />
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-br-md border-b-4 border-r-4 border-white" />
                    </div>
                </div>

                <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-8">
                    <button type="button" onClick={torchSupported ? toggleTorch : undefined} className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 ${!torchSupported ? "opacity-40" : torchOn ? "bg-yellow-400/30" : ""}`}><FlashIcon /></button>
                    <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10">
                        <UploadImageIcon />
                        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <aside className="bg-[#e7f5e5] p-5 text-slate-900 md:min-h-screen md:overflow-y-auto">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Presensi Manual</p>
                    <h2 className="mt-2 text-xl font-extrabold">Set Hadir Tanpa QR</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">Gunakan saat perangkat anggota tidak bisa menampilkan QR.</p>

                    <form onSubmit={submitManual} className="mt-5 space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Acara</label>
                            <select value={manualEventId} onChange={(e) => setManualEventId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-500">
                                {events.map((event) => <option key={event.event_id} value={event.event_id}>{eventLabel(event)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Anggota</label>
                            <select value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-500">
                                {members.map((member) => <option key={member.user_id} value={member.user_id}>{member.name} - {member.nim || "Tanpa NIM"}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Keterangan</label>
                            <input value={manualRemarks} onChange={(e) => setManualRemarks(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-emerald-500" />
                        </div>
                        <button type="submit" className="w-full rounded-xl bg-[#1f7a2c] px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#186322]">Set Hadir</button>
                    </form>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <p className="font-bold text-slate-900">Alur baru</p>
                    <p className="mt-1">Anggota membuka halaman QR, memilih acara, lalu admin memindai QR tersebut.</p>
                </div>

                <div className="mt-5 flex justify-around rounded-2xl bg-[#145c2a] p-3 text-white">
                    <Link to="/dashboard" className="flex flex-col items-center text-xs font-bold"><img src={iconQr} alt="" className="mb-1 h-5 w-5 object-contain" />Dashboard</Link>
                    <Link to="/dashboard/laporan" className="flex flex-col items-center text-xs font-bold">Laporan</Link>
                </div>
            </aside>
        </div>
    );
}

export default function QrScanner() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const isAdmin = role === "admin" || role === "super_admin";

    return isAdmin ? <AdminScannerView navigate={navigate} /> : <MemberQrView navigate={navigate} />;
}
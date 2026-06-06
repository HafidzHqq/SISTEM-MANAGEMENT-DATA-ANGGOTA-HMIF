import React from "react";
import { useNavigate, Link } from "react-router-dom";
import jsQR from "jsqr";
import iconQr from "../assets/icon-qrscan.png";
import hmifLogo from "../assets/logo-hmif.png";

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

export default function QrScanner() {
    const navigate = useNavigate();
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const rafRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const isProcessingRef = React.useRef(false);
    const streamRef = React.useRef(null);

    const [cameraError, setCameraError] = React.useState("");
    const [status, setStatus] = React.useState(null); // null | 'loading' | 'success' | 'error'
    const [statusMsg, setStatusMsg] = React.useState("");
    const [torchOn, setTorchOn] = React.useState(false);
    const [torchSupported, setTorchSupported] = React.useState(false);

    // ── Kirim token ke backend (tanpa GPS) ────────────────────
    const submitCheckIn = async (qrToken) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        cancelAnimationFrame(rafRef.current);

        setStatus("loading");
        setStatusMsg("Memverifikasi QR...");

        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch("/api/attendances/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    qr_token: qrToken,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setStatusMsg(data.message || "Presensi berhasil!");
                setTimeout(() => navigate("/dashboard"), 2200);
            } else {
                setStatus("error");
                setStatusMsg(data.message || "QR tidak valid atau presensi gagal.");
                setTimeout(() => {
                    isProcessingRef.current = false;
                    setStatus(null);
                    setStatusMsg("");
                    startScanLoop();
                }, 2500);
            }
        } catch (err) {
            setStatus("error");
            setStatusMsg("Gagal terhubung ke server.");
            setTimeout(() => {
                isProcessingRef.current = false;
                setStatus(null);
                setStatusMsg("");
                startScanLoop();
            }, 2500);
        }
    };

    // ── Scan loop dari video ───────────────────────────────────
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
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                if (code?.data) {
                    submitCheckIn(code.data);
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, []);

    // ── Upload gambar QR ───────────────────────────────────────
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
                if (code?.data) {
                    submitCheckIn(code.data);
                } else {
                    setStatus("error");
                    setStatusMsg("QR tidak terbaca dari gambar. Coba foto yang lebih jelas.");
                    setTimeout(() => { setStatus(null); setStatusMsg(""); }, 2500);
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    // ── Kamera ────────────────────────────────────────────────
    React.useEffect(() => {
        let isMounted = true;

        async function startCamera() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    setCameraError("Browser belum mendukung akses kamera.");
                    return;
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false,
                });
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
                console.error("Gagal membuka kamera:", err);
                setCameraError("Kamera tidak bisa dibuka. Aktifkan izin kamera lalu refresh halaman.");
            }
        }

        startCamera();

        return () => {
            isMounted = false;
            cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [startScanLoop]);

    // ── Toggle torch ──────────────────────────────────────────
    const toggleTorch = async () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;
        const next = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
    };

    return (
        <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-transparent">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-black/40">
                    <span className="text-xl">✕</span>
                </button>
                <div className="flex items-center gap-3">
                    <img src={hmifLogo} alt="HMIF" className="h-6 w-6 object-contain" />
                    <span className="font-semibold">HMIF</span>
                </div>
                <div className="w-[90px]" />
            </div>

            {/* Camera area */}
            <div className="flex-1 relative flex items-center justify-center">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline autoPlay muted />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 bg-black/60" />

                {cameraError && (
                    <div className="absolute top-8 left-1/2 z-30 w-[90%] max-w-md -translate-x-1/2 rounded-2xl bg-red-600/90 px-4 py-3 text-center text-sm font-semibold text-white">
                        {cameraError}
                    </div>
                )}

                {status && (
                    <div className={`absolute top-8 left-1/2 z-30 w-[90%] max-w-md -translate-x-1/2 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg ${
                        status === "loading" ? "bg-yellow-600/90" :
                        status === "success" ? "bg-green-600/90" :
                        "bg-red-600/90"
                    }`}>
                        {status === "loading" && <span className="mr-2 inline-block animate-spin">⏳</span>}
                        {status === "success" && <span className="mr-2">✅</span>}
                        {status === "error" && <span className="mr-2">❌</span>}
                        {statusMsg}
                    </div>
                )}

                {/* Scanning frame */}
                <div className="relative z-20">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                        <div className="absolute inset-0 m-auto rounded-2xl border-2 border-white/90 w-full h-full" style={{ borderRadius: 18 }} />
                        <div className="absolute -left-2 -top-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-md" />
                        <div className="absolute -right-2 -top-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-md" />
                        <div className="absolute -left-2 -bottom-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-md" />
                        <div className="absolute -right-2 -bottom-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-md" />
                    </div>
                </div>

                <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-black/70 text-white px-5 py-2 rounded-full text-sm">
                        Align QR code within the frame
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-8 sm:bottom-10">
                    <button
                        type="button"
                        aria-label="Nyalakan flash"
                        onClick={torchSupported ? toggleTorch : undefined}
                        className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-95 ${!torchSupported ? "opacity-40 cursor-not-allowed" : torchOn ? "bg-yellow-400/30 border-yellow-300" : ""}`}
                    >
                        <FlashIcon />
                    </button>
                    <label
                        aria-label="Upload gambar QR"
                        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15 active:scale-95"
                    >
                        <UploadImageIcon />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>
            </div>

            {/* Bottom nav */}
            <div className="bg-[#145c2a] p-3 flex items-center justify-around">
                <Link to="/dashboard" className="flex flex-col items-center text-white">
                    <div className="bg-white/10 p-2 rounded-md mb-1">
                        <img src={iconQr} alt="scan" className="h-5 w-5 object-contain" />
                    </div>
                    <span className="text-xs">DASHBOARD</span>
                </Link>
                <Link to="/dashboard/profile" className="flex flex-col items-center text-white/90">
                    <div className="p-2 rounded-md mb-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.606 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="text-xs">PROFILE</span>
                </Link>
                <Link to="/dashboard/history" className="flex flex-col items-center text-white/90">
                    <div className="p-2 rounded-md mb-1">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-xs">HISTORY</span>
                </Link>
            </div>
        </div>
    );
}
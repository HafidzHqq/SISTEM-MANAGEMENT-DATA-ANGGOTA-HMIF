import React from "react";
import hmifLogo from "../assets/logo-hmif.png";
import googleLogo from "../assets/logo-google.png";

const ERROR_LABEL = {
    domain_tidak_valid:
        "Akun tidak valid. Gunakan email dengan domain @student.itera.ac.id.",
};

export default function Login() {
    const handleGoogleLogin = () => {
        window.location.href = "/auth/google";
    };

    const query = new URLSearchParams(window.location.search);
    const errorKey = query.get("error");
    const errorMessage = errorKey
        ? ERROR_LABEL[errorKey] ?? "Login gagal. Silakan coba beberapa saat lagi."
        : "";

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#02050f] font-sans text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-[26%] h-80 w-80 rounded-full bg-[#2b4074]/25 blur-3xl md:hidden" />
                <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#15203c]/30 blur-3xl md:hidden" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,48,90,0.25)_0%,rgba(2,5,15,0.9)_48%,#02050f_100%)] md:hidden" />

                <div className="hidden md:block xl:hidden absolute inset-0 bg-[linear-gradient(150deg,#0b1129_0%,#070b1a_45%,#040712_100%)]" />
                <div className="hidden md:block xl:hidden absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#31457e]/22 blur-3xl" />
                <div className="hidden md:block xl:hidden absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#1b2b57]/20 blur-3xl" />
                <div className="hidden md:block xl:hidden absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(40,58,106,0.2)_0%,rgba(5,9,21,0.88)_58%,#040712_100%)]" />

                <div className="hidden xl:block absolute -left-24 top-[26%] h-80 w-80 rounded-full bg-[#2b4074]/25 blur-3xl" />
                <div className="hidden xl:block absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#15203c]/30 blur-3xl" />
                <div className="hidden xl:block absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,48,90,0.25)_0%,rgba(2,5,15,0.9)_48%,#02050f_100%)]" />
            </div>

            <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl px-6 py-8 sm:px-9 md:items-center md:px-10 md:py-10 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-center xl:gap-10 xl:px-12">
                <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[390px] flex-col items-center justify-between md:min-h-[44rem] md:max-w-[560px] md:rounded-[34px] md:border md:border-white/10 md:bg-[#050917]/72 md:px-10 md:py-11 md:shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:backdrop-blur-xl xl:min-h-[44rem] xl:max-w-none xl:px-9 xl:py-10">
                    <div />

                    <div className="w-full">
                        <div className="flex flex-col items-center">
                            <img
                                src={hmifLogo}
                                alt="Logo HMIF"
                                className="h-28 w-28 object-contain sm:h-32 sm:w-32 md:h-36 md:w-36 xl:h-32 xl:w-32"
                            />
                            <h1 className="mt-4 text-center text-[2.8rem] font-semibold tracking-tight text-[#f3f5fa] sm:mt-5 sm:text-[3.15rem] md:mt-6 md:text-[3.35rem] xl:text-[3.15rem]">
                                WELCOME
                            </h1>
                            <p className="mt-6 max-w-[20rem] text-center text-[1.04rem] leading-relaxed text-slate-300 sm:max-w-[21rem] sm:text-[1.1rem]">
                                Log in with your credentials or{" "}
                                <span className="font-semibold text-[#9bb1ff]">
                                    @student.itera.ac.id
                                </span>{" "}
                                account.
                            </p>
                        </div>

                        {errorMessage && (
                            <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            onClick={handleGoogleLogin}
                            className="mt-9 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#020611]/60 px-5 py-4 text-[1.08rem] font-medium text-[#f4f7ff] transition duration-200 hover:border-white/20 hover:bg-[#091127] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#92a8ff]/60 md:mt-10 md:py-[1.05rem]"
                        >
                            <img
                                src={googleLogo}
                                alt="Google"
                                className="h-6 w-6 object-contain"
                            />
                            <span>Login with Google</span>
                        </button>

                        <a
                            href="#admin-portal"
                            className="mt-7 inline-flex w-full items-center justify-center gap-2 text-[1rem] text-slate-500 transition hover:text-slate-300"
                        >
                            <span>Sign in to Admin portal</span>
                            <span aria-hidden>{"->"}</span>
                        </a>
                    </div>

                    <div className="w-full pb-2 pt-14 text-center md:pb-0 md:pt-10 xl:pt-14">
                        <div className="flex items-center justify-center gap-4 text-[0.98rem] text-slate-400">
                            <a href="#" className="transition hover:text-slate-200">
                                Help &amp; Support
                            </a>
                            <span className="text-slate-600">|</span>
                            <a href="#" className="transition hover:text-slate-200">
                                Privacy Policy
                            </a>
                        </div>
                        <p className="mt-6 text-[0.78rem] tracking-[0.35em] text-slate-600 md:mt-4 md:text-[0.72rem] md:tracking-[0.26em] xl:mt-6 xl:text-[0.78rem] xl:tracking-[0.35em]">
                            (c) 2026 HMIF
                        </p>
                    </div>
                </section>

                <section className="relative hidden h-[44rem] overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(160deg,rgba(13,20,40,0.88),rgba(5,9,23,0.95))] p-12 shadow-[0_28px_80px_rgba(0,0,0,0.35)] xl:flex xl:flex-col xl:justify-between">
                    <div className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-[#405a9e]/30 blur-3xl" />
                    <div className="pointer-events-none absolute -left-16 bottom-6 h-52 w-52 rounded-full bg-[#1c2d5b]/35 blur-3xl" />

                    <div className="relative">
                        <p className="text-sm uppercase tracking-[0.35em] text-[#93a7e8]">
                            HMIF ITERA
                        </p>
                        <h2 className="mt-5 max-w-md text-5xl font-semibold leading-tight text-white">
                            Sistem Management Data Anggota
                        </h2>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                            Platform untuk autentikasi cepat dan aman menggunakan
                            akun resmi kampus agar proses administrasi HMIF
                            menjadi lebih efisien.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-2 gap-4 text-sm text-slate-300">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-[#9bb1ff]">Akses cepat</p>
                            <p className="mt-2 leading-relaxed">
                                Login satu klik dengan akun Google kampus.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-[#9bb1ff]">Terverifikasi</p>
                            <p className="mt-2 leading-relaxed">
                                Membatasi login untuk domain resmi mahasiswa.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

# Road Map Pengembangan Lanjutan - Sistem Management Data Anggota HMIF

Dokumen ini berisi rencana tindak lanjut pengembangan fitur dan arsitektur untuk meningkatkan kapabilitas sistem manajemen data anggota.

---

## 1. Fitur Personalia: Penilaian Kontribusi Anggota

Fitur ini dirancang untuk membantu divisi Personalia/PSDM dalam menilai, memantau, dan mengevaluasi kontribusi setiap anggota terhadap kegiatan HMIF secara objektif.

### A. Skema Database Baru (Migrations)
1. **Tabel `evaluation_periods`**: Menentukan periode penilaian (contoh: Kepengurusan 2026/2027 Ganjil).
   ```php
   Schema::create('evaluation_periods', function (Blueprint $table) {
       $table->id('period_id');
       $table->string('name');
       $table->date('start_date');
       $table->date('end_date');
       $table->enum('status', ['active', 'inactive'])->default('active');
       $table->timestamps();
   });
   ```
2. **Tabel `member_evaluations`**: Menyimpan detail nilai per anggota per periode.
   ```php
   Schema::create('member_evaluations', function (Blueprint $table) {
       $table->id('evaluation_id');
       $table->foreignId('user_id')->constrained('users', 'user_id')->onDelete('cascade');
       $table->foreignId('period_id')->constrained('evaluation_periods', 'period_id')->onDelete('cascade');
       $table->float('attendance_score')->default(0); // Dihitung otomatis dari persentase absensi
       $table->float('task_score')->default(0);       // Nilai dari pengerjaan proker / tugas divisi
       $table->float('peer_score')->default(0);       // Nilai dari rekan kerja / kepala divisi
       $table->float('final_score')->storedAs('(attendance_score * 0.4) + (task_score * 0.4) + (peer_score * 0.2)'); // Contoh kalkulasi bobot
       $table->text('notes')->nullable();
       $table->foreignId('evaluated_by')->constrained('users', 'user_id');
       $table->timestamps();
   });
   ```

### B. Backend Implementation (Laravel API)
- **`EvaluationController`**:
  - `index()`: Mengambil list evaluasi per periode (dengan pencarian, filter departemen, & pagination).
  - `store()` & `update()`: Menyimpan/mengubah penilaian tugas dan peer oleh Admin/Super Admin.
  - `calculateAttendanceScore($userId, $periodId)`: Helper function untuk menghitung persentase kehadiran user pada event yang berlangsung dalam rentang tanggal periode evaluasi tersebut.
- **API Endpoints Baru**:
  - `GET /api/evaluations` - List semua evaluasi anggota (Admin & Super Admin)
  - `GET /api/evaluations/me` - Akses untuk Anggota melihat riwayat & detail nilai kontribusi pribadi
  - `POST /api/evaluations` - Admin input nilai tugas & peer
  - `GET /api/evaluations/leaderboard` - Menampilkan peringkat anggota teraktif untuk apresiasi (Member of the Month)

### C. Frontend Implementation (React & Tailwind CSS)
- **Halaman Dashboard Admin (Divisi Personalia/PSDM)**:
  - UI Form Input/Update Nilai Anggota.
  - Filter berdasarkan Departemen/Divisi & Periode Penilaian.
  - Grafik distribusi nilai kontribusi anggota (menggunakan Recharts / Chart.js).
- **Halaman Dashboard Anggota**:
  - Halaman "Kontribusi Saya" berisi visualisasi radar chart / progress bar mengenai capaian kontribusi mereka saat ini (Kehadiran vs Tugas vs Peer Rating).

---

## 2. API Scale Up & Integrasi Multi-Website (Single Database & Logic)

Rencana integrasi agar 2 website terpisah (misal: Website Profil HMIF dan Website Kegiatan/Event Eksternal) dapat menggunakan resource, database, dan logika otentikasi yang tersentralisasi di sistem ini.

### A. Restrukturisasi API & Keamanan (API Gateway & Auth)
1. **Laravel Sanctum / Passport Client Credentials**:
   - Menggunakan token berbasis Client Credentials untuk komunikasi Server-to-Server yang aman antara website kedua dan API HMIF.
   - Menyediakan fitur pembuatan Client API Keys di Dashboard Super Admin.
2. **Endpoints API Terintegrasi Baru**:
   - `/api/v1/external/members/verify` - Verifikasi status keanggotaan aktif berdasarkan NIM untuk integrasi dengan platform pendaftaran event eksternal.
   - `/api/v1/external/events` - Integrasi daftar event HMIF agar otomatis tampil di website publik/profil utama.
   - `/api/v1/external/attendances` - Sinkronisasi atau pengiriman data log kehadiran dari platform luar.

### B. Arsitektur Single Sign-On (SSO) HMIF
- **OAuth2 Provider**:
  - Menjadikan web Management Data Anggota ini sebagai *OAuth2/OIDC Provider*.
  - Website lain (misal: Portal Pembelajaran, Web Pemilu HMIF) cukup menyediakan tombol "Login dengan Akun HMIF" yang mengarah ke otentikasi sentral ini.
  - Flow: User klik login -> Dialihkan ke website ini -> Login dengan Google (OAuth) -> Callback mengirimkan access token kembali ke website pemanggil.

### C. Sinkronisasi Data (Webhooks & Event Broadcasting)
- **Webhook Publisher**:
  - Jika ada perubahan data anggota (perubahan status keaktifan, pergantian foto profil, update jabatan), sistem ini akan memicu *Webhook Event* yang dikirimkan ke URL website kedua.
  - Menggunakan Laravel Jobs & Queues (Redis/Database driver) agar proses pengiriman webhook berjalan secara background tanpa membebani performa request.

### D. Standarisasi Format API
Menyeragamkan struktur respon API di seluruh endpoint agar memudahkan konsumsi data oleh developer website lain:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-11T12:00:00Z"
  }
}
```

---

## 3. Rencana Tahapan Eksekusi (Milestones)

| Tahap | Deskripsi | Target Waktu | Output Utama |
| :--- | :--- | :--- | :--- |
+| **Tahap 1** | Migrasi database kontribusi & pembuatan Controller evaluasi personalia | Minggu 1 | API endpoints internal penilaian kontribusi |
| **Tahap 2** | Pembuatan antarmuka admin PSDM & halaman dashboard kontribusi anggota | Minggu 2 | UI/UX React selesai terintegrasi dengan API |
| **Tahap 3** | Konfigurasi Laravel Passport / Sanctum untuk multi-website client | Minggu 3 | API Key generator & endpoint verifikasi NIM |
| **Tahap 4** | Implementasi SSO & Webhook untuk real-time data sync | Minggu 4 | Integrasi penuh website kedua |
| **Tahap 5** | Pengujian beban (Load Testing) & Audit Keamanan API | Minggu 5 | Sistem siap rilis (Production-ready) |

---

## 4. Cara Penggunaan & Pengujian Lokal
1. Jalankan migrasi: `php artisan migrate`
2. Jalankan queue listener untuk webhook: `php artisan queue:work`
3. Tes endpoint eksternal menggunakan Postman/Bruno dengan menyertakan header `Authorization: Bearer <token_klien>`.

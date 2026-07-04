# SISTEM MANAGEMENT DATA ANGGOTA HMIF

Sistem Informasi Manajemen Data Anggota Himpunan Mahasiswa Informatika (HMIF) ITERA. Aplikasi ini dibangun menggunakan framework **Laravel** untuk backend API dan **React.js + Tailwind CSS** untuk frontend client yang dikompilasi menggunakan **Vite**. Navigasi mobile dilengkapi dengan animasi premium berbasis **GSAP**.

---

## 🛠️ Tech Stack & Prasyarat

Sebelum memulai instalasi, pastikan perangkat Anda telah memenuhi prasyarat berikut:
* **PHP**: `>= 8.2` (dengan ekstensi `pdo_sqlite`, `sqlite3` diaktifkan jika menggunakan SQLite)
* **Composer**: `>= 2.x`
* **Node.js**: `>= 18.x` (disertai `npm`)
* **Web Server**: Laragon / XAMPP / Apache lokal
* **Database**: SQLite (default lokal) atau MySQL

---

## 🚀 Instalasi Lokal (Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal Anda:

### 1. Clone Repositori
Clone proyek ini ke direktori web server lokal Anda (misalnya di `C:\laragon\www\SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF`):
```bash
git clone https://github.com/HafidzHqq/SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF.git
cd SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF
```

### 2. Instal Dependensi PHP
Jalankan Composer untuk menginstal semua pustaka backend Laravel:
```bash
composer install
```

### 3. Instal Dependensi Node.js
Instal semua pustaka frontend React termasuk Tailwind CSS dan GSAP:
```bash
npm install
```

### 4. Konfigurasi Environment (`.env`)
Salin file konfigurasi contoh `.env.example` ke `.env`:
```bash
cp .env.example .env
```
*Buka file `.env` baru tersebut dan sesuaikan pengaturan database Anda. Jika menggunakan SQLite (direkomendasikan untuk pengembangan cepat), pastikan konfigurasinya seperti ini:*
```env
DB_CONNECTION=sqlite
# Kosongkan bagian DB_DATABASE, Laravel otomatis mencari database/database.sqlite
```
*Buat file database SQLite kosong jika belum ada:*
* **Windows (PowerShell)**: `New-Item -ItemType File database/database.sqlite`
* **Linux/macOS/Git Bash**: `touch database/database.sqlite`

### 5. Generate Application Key
Jalankan perintah ini untuk membuat key enkripsi aplikasi Laravel:
```bash
php artisan key:generate
```

### 6. Jalankan Migrasi & Database Seeder
Buat skema tabel dan masukkan data awal (admin, super admin, dan contoh data anggota):
```bash
php artisan migrate --seed
```

### 7. Jalankan Server Pengembangan
Jalankan server Laravel dan bundler Vite secara bersamaan:

* **Terminal 1 (Laravel Server)**:
  ```bash
  php artisan serve
  ```
  *(Aplikasi Anda akan dapat diakses di http://127.0.0.1:8000)*

* **Terminal 2 (Vite Hot Reload)**:
  ```bash
  npm run dev
  ```

---

## 🌐 Panduan Deployment di Hostinger (cPanel / SSH)

Berikut panduan singkat untuk merilis (deploy) aplikasi ke hosting Hostinger menggunakan SSH:

### 1. Masuk via SSH
Hubungi server Hostinger Anda menggunakan terminal SSH:
```bash
ssh -p <port> <username>@<ip_address>
```

### 2. Masuk ke Folder Proyek
Masuk ke direktori instalasi Laravel Anda (biasanya ditaruh sejajar dengan folder `public_html` atau di dalam folder khusus):
```bash
cd laravel
```

### 3. Tarik Kode Terbaru
Tarik kode revisi terupdate dari repositori GitHub:
```bash
git pull origin main
```

### 4. Kompilasi Aset Frontend (Produksi)
Lakukan kompilasi bundel JavaScript & CSS versi produksi:
```bash
npm run build
```

### 5. Sinkronisasi Folder Build ke public_html
Karena di Hostinger file web publik dibaca dari folder `public_html`, salin folder hasil build Vite dari folder `public/build` Laravel ke folder `public_html/build`:
```bash
cp -r public/build ../public_html/
```

### 6. Migrasi Database Produksi
Jalankan pembaruan skema database di server produksi secara aman:
```bash
php artisan migrate --force
```

### 7. Bersihkan Cache Laravel
Pastikan konfigurasi baru terbaca dengan membersihkan cache Laravel:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

## 📝 Perintah-Perintah Penting Lainnya

* **Membuat Acara/Event Baru**: Dapat dilakukan langsung melalui Dashboard Admin/Super Admin.
* **Membuat Backup Database SQLite**: Salin file `database/database.sqlite` ke tempat aman.
* **Membangun Bundel Aset Manual**: `npm run build`.

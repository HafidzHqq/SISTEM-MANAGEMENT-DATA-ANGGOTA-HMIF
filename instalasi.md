# PANDUAN INSTALASI PROJEK SISTEM MANAGEMENT DATA ANGGOTA HMIF

Sistem Informasi Manajemen Data Anggota Himpunan Mahasiswa Informatika (HMIF) ITERA. Dokumen ini memuat panduan lengkap instalasi di server lokal (development) serta panduan rilis (deployment) di cPanel Hostinger menggunakan SSH.

---

## 🛠️ Prasyarat Sistem

Pastikan perangkat/server Anda memenuhi prasyarat berikut:
* **PHP**: Versi `>= 8.2` (aktifkan ekstensi `pdo_sqlite` dan `sqlite3` jika ingin menggunakan SQLite secara lokal)
* **Composer**: Versi `>= 2.x`
* **Node.js**: Versi `>= 18.x` (lengkap dengan `npm`)
* **Database**: SQLite (default pengembangan lokal) atau MySQL (untuk produksi/Hostinger)

---

## 🚀 Panduan Instalasi Lokal (Langkah demi Langkah)

### 1. Clone Repositori
Jelajahi ke direktori web server Anda (misal Laragon `www/` atau XAMPP `htdocs/`) dan clone repositori ini:
```bash
git clone https://github.com/HafidzHqq/SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF.git
cd SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF
```

### 2. Instal Dependensi PHP (Backend)
Jalankan Composer untuk memasang seluruh paket backend Laravel:
```bash
composer install
```

### 3. Instal Dependensi Node.js (Frontend)
Instal seluruh paket frontend React, Tailwind CSS, dan pustaka animasi GSAP:
```bash
npm install
```

### 4. Salin Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` yang baru dibuat dengan teks editor, lalu sesuaikan koneksi database Anda.
* **Jika Menggunakan SQLite (Rekomendasi Lokal)**:
  ```env
  DB_CONNECTION=sqlite
  # Kosongkan bagian DB_DATABASE, Laravel akan otomatis merujuk ke database/database.sqlite
  ```
  Buat file database kosong tersebut:
  * **Windows (PowerShell)**: `New-Item -ItemType File database/database.sqlite`
  * **Linux/macOS**: `touch database/database.sqlite`

### 5. Buat Application Key
Jalankan perintah ini untuk generate kunci enkripsi unik aplikasi Laravel:
```bash
php artisan key:generate
```

### 6. Jalankan Migrasi & Database Seeder
Lakukan migrasi tabel database dan isi data dasar/contoh awal:
```bash
php artisan migrate --seed
```

### 7. Jalankan Server Lokal
Jalankan server backend Laravel dan compiler Vite secara bersamaan:
* **Terminal 1 (Backend Laravel)**:
  ```bash
  php artisan serve
  ```
  *(Aplikasi lokal akan berjalan di http://127.0.0.1:8000)*
* **Terminal 2 (Frontend Vite)**:
  ```bash
  npm run dev
  ```

---

## 🌐 Panduan Deployment di Hostinger (SSH & cPanel)

Ikuti langkah ini jika ingin melakukan update dan rilis di server Hostinger:

### 1. Masuk ke SSH Server Hostinger
```bash
ssh -p <port_ssh> u234110555@<ip_address_hostinger>
```

### 2. Masuk ke Folder Laravel & Update Kode
```bash
cd laravel
git pull origin main
```

### 3. Kompilasi Aset Produksi
Kompilasi seluruh file JavaScript dan CSS versi produksi:
```bash
npm run build
```

### 4. Sinkronkan Folder Hasil Build
Salin aset-aset hasil kompilasi dari folder `public/build` Laravel ke direktori publik hosting web server (`public_html/build`):
```bash
cp -r public/build ../public_html/
```

### 5. Jalankan Migrasi di Produksi
Update perubahan skema tabel database di server produksi secara aman:
```bash
php artisan migrate --force
```

### 6. Hapus Cache Laravel (Wajib)
Jalankan serangkaian perintah ini agar konfigurasi terupdate dibaca oleh Laravel:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

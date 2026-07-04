# Sistem Management Data Anggota HMIF

Website ini dirancang untuk membantu pengurus HMIF dalam mengelola data anggota serta mencatat kehadiran anggota pada kegiatan himpunan secara terpusat dan terstruktur.

---

## 👥 Tim Pengembang
- Project Manager
- Frontend Developer
- Backend Developer
- UI/UX Designer

---

## 🧰 Tech Stack
- **Laravel** (Backend)
- **React + Vite** (Frontend)
- **TailwindCSS** (Styling)
- **Figma** (UI/UX)
- **PostgreSQL** (Database)

---

## 📁 Struktur Project (Sederhana)


---

## 📦 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/leeclza/SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF.git
cd SISTEM-MANAGEMENT-DATA-ANGGOTA-HMIF
```

**Penjelasan:**
* `git clone` → download project dari GitHub ke laptop
* `cd` → masuk ke folder project

---

### 2. Install Dependency Backend

```bash
composer install
```

**Penjelasan:**
Menginstall semua dependency Laravel agar project bisa dijalankan.

---

### 3. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

**Penjelasan:**
* `.env` = file konfigurasi project
* `key:generate` = generate application key Laravel

---

### 4. Install Dependency Frontend

```bash
npm install
```

**Penjelasan:**
Menginstall dependency React, Vite, dan Tailwind.

---

### 5. Jalankan Server

Buka **2 terminal**:

**Terminal 1 (Backend - Laravel)**

```bash
php artisan serve
```

**Terminal 2 (Frontend - React / Vite)**

```bash
npm run dev
```

**Penjelasan:**

* Laravel = Backend API
* Vite = Frontend React
* ⚠️ Keduanya harus berjalan bersamaan

---

### 6. Akses Project

Buka di browser:

```
http://127.0.0.1:8000
```

Atau:

```
http://localhost:8000
```
---

## ⚠️ Catatan Penting

* Wajib menjalankan **2 server sekaligus**
* Jika hanya menjalankan `php artisan serve`, tampilan React tidak akan muncul
* Jika terjadi error:

  * Cek console browser (`F12`)
  * Pastikan semua dependency sudah terinstall

---

## 🧠 Troubleshooting

### ❌ Tampilan putih / kosong

* Pastikan `npm run dev` sedang berjalan
* Pastikan tidak ada error di terminal Vite

### ❌ Error React / JavaScript

* Cek console browser (`F12`)
* Perhatikan error message yang muncul



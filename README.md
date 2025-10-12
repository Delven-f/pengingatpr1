# 📘 Pengingat PR X-2 Modern

Aplikasi web untuk mencatat, mengingat, dan mengelola PR sekolah, dengan desain modern & fitur admin.

## 🚀 Fitur
- UI modern dan responsif (mobile & desktop)
- Tambah, edit, hapus PR (khusus admin)
- Login admin via password
- Daftar PR bisa dicari & diurutkan deadline
- Simpan data otomatis ke GitHub (pr.json)
- Notifikasi & loading, UX nyaman
- Mode gelap (dark mode)
- Backend Node.js untuk update data

## Cara Pakai

### 1. Jalankan Backend (Node.js)
1. Clone repo ini
2. Install dependencies:  
   `npm install express @octokit/rest body-parser cors dotenv`
3. Buat file `.env` dan isi dengan:
   ```
   GITHUB_TOKEN=token_github_pat_anda
   ```
4. Jalankan server:
   ```
   node server.js
   ```
   (Pastikan port 3000 terbuka)

### 2. Jalankan Frontend
- Buka `index.html` di browser.
- *Jika akses dari device lain*, ganti `localhost` di `app.js` dengan IP server.

### 3. Login Admin
- Klik tombol "Admin Login", masukkan password:  
  `firman1`

### 4. Penggunaan
- Tambah/edit/hapus PR hanya bisa dilakukan setelah login admin.
- Semua perubahan otomatis disimpan ke GitHub dan update ke semua device.

---

## Struktur File

- `index.html` — Halaman utama UI
- `style.css` — CSS modern & responsive
- `app.js` — JS aplikasi, modular
- `server.js` — Backend update ke GitHub
- `pr.json` — Data PR

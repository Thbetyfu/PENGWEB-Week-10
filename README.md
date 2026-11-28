## Informasi Mahasiswa & Proyek

- **Nama Lengkap:** Thoriq Abdurrohman Taqy
- **NIM:** 103022430006
- **Kelas:** SE-48-04
- **Program Studi:** S1 Rekayasa Perangkat Lunak (Software Engineering)
- **Mata Kuliah:** Perancangan dan Pemrograman Web (CCK3DAB3)
- **Nama Aplikasi:** **Bengkelin** (Sistem Manajemen Servis Motor Konvensional & Motor Listrik)

---

# Bengkelin Fullstack (Pekan 11: JWT Auth + Keamanan Dasar)

Proyek ini adalah pengembangan dari aplikasi **Bengkelin** (NestJS + PostgreSQL + Prisma ORM + React) dengan penambahan sistem autentikasi **JWT Bearer**, hashing password menggunakan **bcrypt**, **Security Headers (Helmet)**, dan **Rate Limiting (`@nestjs/throttler`)**.


Penggunaan AI week ini : -

tools yang di gunakan: Vs code dan choreme saja

---

## Fitur Keamanan & Autentikasi (Pekan 11)

1. **Registrasi & Login (`POST /auth/register`, `POST /auth/login`)**
   - Password di-hash dengan `bcrypt` (`saltRounds = 10`) sebelum disimpan ke tabel `users` di PostgreSQL.
   - Login memverifikasi password dengan `bcrypt.compare` dan menerbitkan JWT `accessToken`.
2. **Proteksi Endpoint Privat (`/servis/*`)**
   - Seluruh endpoint CRUD `/servis` dilindungi oleh `JwtAuthGuard` (`Authorization: Bearer <token>`).
   - Request tanpa token atau token tidak valid ditolak dengan status `401 Unauthorized`.
3. **Security Headers & CORS**
   - Menggunakan `helmet()` di `backend/src/main.ts` serta pembatasan CORS ke `http://localhost:5173`.
4. **Rate Limiting**
   - Menggunakan `@nestjs/throttler` dengan batas ketat pada `POST /auth/login` (maksimal 5 percobaan per 60 detik, mengembalikan `429 Too Many Requests` jika terlampaui).

---

## Cara Menjalankan Proyek Secara Lokal

### 1. Persiapan Backend & Database PostgreSQL

```bash
cd backend
npm install --legacy-peer-deps
cp .env.example .env          # Sesuaikan DATABASE_URL & JWT_SECRET
npx prisma migrate dev --name add_user_auth
npm run start:dev             # Backend berjalan di http://localhost:3001
```

### 2. Menjalankan Frontend React

```bash
cd frontend
npm install
npm run dev                   # Frontend berjalan di http://localhost:5173
```

---

## Dokumentasi Penjelasan Tugas

Penjelasan singkat (maksimal 1 halaman) untuk keperluan laporan pengumpulan tersedia di [docs/PENJELASAN_TUGAS_11.md](docs/PENJELASAN_TUGAS_11.md).

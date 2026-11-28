# Penjelasan Implementasi JWT Auth & Keamanan Dasar (Pekan 11)

**Aplikasi:** Bengkelin (Sistem Manajemen Servis Motor Konvensional & Motor Listrik)  
**Tech Stack:** NestJS + Prisma ORM + PostgreSQL (Backend) & React 19 + Vite (Frontend)

---

## 1. Alur & Implementasi JWT Authentication

1. **Registrasi & Hashing Password (`bcrypt`)**  
   Pada `backend/src/auth/auth.service.ts` (method `register`), email pengguna dinormalisasi ke huruf kecil dan dicek duplikasinya. Sebelum disimpan ke tabel `users` di PostgreSQL melalui Prisma (`prisma.user.create`), password pengguna di-hash terlebih dahulu menggunakan `bcrypt.hash(password, 10)` dengan 10 *salt rounds* sehingga tidak pernah tersimpan dalam bentuk *plaintext*.
2. **Login & Penerbitan JWT (`accessToken`)**  
   Pada `AuthService.login`, sistem mencari user berdasarkan email lalu memverifikasi kecocokan password menggunakan `bcrypt.compare`. Jika valid, `JwtService.signAsync()` menerbitkan token JWT berisi payload `{ sub: user.id, email, nama }` dan mengembalikannya dalam respons JSON sebagai `accessToken`.
3. **Proteksi Endpoint Privat (`JwtAuthGuard` & `JwtStrategy`)**  
   Pada `backend/src/auth/jwt.strategy.ts`, `ExtractJwt.fromAuthHeaderAsBearerToken()` mengekstrak token dari header `Authorization: Bearer <token>` dan memvalidasi signature-nya. Seluruh endpoint CRUD pada `backend/src/servis/servis.controller.ts` diproteksi dengan dekorator `@UseGuards(JwtAuthGuard)`. Request tanpa token atau dengan token tidak valid otomatis ditolak oleh NestJS dengan status `401 Unauthorized`.
4. **Integrasi Frontend (`api.js` & `AuthPanel.jsx`)**  
   Frontend menyimpan `accessToken` di `localStorage` setelah login berhasil (`loginUser` di `frontend/src/services/api.js`), lalu melampirkan header `Authorization: Bearer <token>` pada setiap pemanggilan endpoint `/servis` melalui helper `buildAuthHeaders()`.

---

## 2. Implementasi Keamanan Dasar (Helmet & Rate Limiting)

1. **HTTP Security Headers (`helmet`)**  
   Pada `backend/src/main.ts`, middleware `app.use(helmet())` dipasang secara global untuk menambahkan header keamanan HTTP standar seperti `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, dan `Content-Security-Policy` guna melindungi respons API dari serangan berbasis header/browser. Konfigurasi CORS juga dibatasi hanya ke origin frontend (`http://localhost:5173`) dengan header `Authorization` yang diizinkan secara eksplisit.
2. **Rate Limiting pada Login (`@nestjs/throttler`)**  
   Pada `backend/src/app.module.ts`, `ThrottlerModule` didaftarkan bersama `APP_GUARD` (`ThrottlerGuard`). Khusus pada endpoint `POST /auth/login` di `backend/src/auth/auth.controller.ts`, dipasang `@Throttle({ default: { limit: 5, ttl: 60000 } })` yang membatasi maksimal 5 kali percobaan login per 60 detik. Percobaan ke-6 akan langsung ditolak dengan status `429 Too Many Requests` untuk mencegah *brute-force attack*.

---

## 3. Mitigasi Ancaman (SQL Injection & XSS)

- **Mitigasi SQL Injection:** Seluruh query database menggunakan **Prisma ORM** (`findUnique`, `findMany`, `create`, `update`, `delete`) yang secara internal menggunakan *parameterized queries* / *prepared statements*, bukan penggabungan string SQL mentah. Selain itu, `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`) memvalidasi tipe dan struktur seluruh payload DTO sebelum masuk ke layer service.
- **Mitigasi Cross-Site Scripting (XSS):** Pada sisi frontend, **React** secara otomatis melakukan *escaping* terhadap seluruh data yang dirender di dalam JSX sehingga skrip berbahaya yang mungkin tersimpan tidak dieksekusi sebagai HTML/JS. Di sisi backend, `helmet()` turut menyertakan header perlindungan konten untuk meminimalkan risiko injeksi skrip.

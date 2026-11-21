# Bengkelin — Backend RESTful API & Fullstack MVC Architecture (Tugas Pekan 9)

**Mata Kuliah**: Perancangan dan Pemrograman Web (CCK3DAB3)  
**Program Studi**: S1 Rekayasa Perangkat Lunak, Telkom University  
**Nama**: Thoriq Abdurrohman Taqy  
**NIM**: 103022430006  
**Kelas**: SE-48-04  
**Repositori GitHub**: [https://github.com/Thbetyfu/bengkelin-fullstack-mvc-week9.git](https://github.com/Thbetyfu/bengkelin-fullstack-mvc-week9.git)

---

## 1. Deskripsi Proyek
Proyek ini merupakan kelanjutan dari aplikasi web pribadi **Bengkelin** yang telah dirintis sejak Pekan 2 (HTML), Pekan 5 (JavaScript DOM), Pekan 6 (React Components & State Lifting), dan Pekan 7 (AJAX & API Eksternal). Pada tugas Pekan 9 ini, dibangun fondasi backend menggunakan **NestJS** yang mengimplementasikan arsitektur **Model-View-Controller (MVC)** untuk mengelola operasi CRUD data antrean servis kendaraan secara mandiri.

---

## 2. Struktur Direktori Proyek

```text
Week 09/Tugas/
├── bengkelin-api/                       # Backend NestJS (MVC)
│   ├── src/
│   │   ├── main.ts                     # Entry point (ValidationPipe & CORS)
│   │   ├── app.module.ts               # Root module
│   │   └── servis/
│   │       ├── servis.module.ts        # Module Servis
│   │       ├── servis.controller.ts    # Controller (C)
│   │       ├── servis.service.ts       # Service CRUD in-memory (M/Logic)
│   │       ├── dto/
│   │       │   ├── create-servis.dto.ts# DTO Validasi class-validator
│   │       │   └── update-servis.dto.ts# DTO Update PartialType
│   │       └── entities/
│   │           └── servis.entity.ts    # Entity Servis (Model)
│   ├── servis.http                     # Berkas uji coba REST Client
│   ├── package.json
│   └── tsconfig.json
│
├── bengkelin-frontend/                  # Frontend React (View)
│   ├── src/
│   │   ├── App.jsx                     # Fullstack integration & state
│   │   └── services/api.js             # REST API client (fetch)
│   └── package.json
│
├── Sreenshot/                          # Seluruh tangkapan layar pengujian
│   ├── 01_struktur_folder_nest_mvc.png
│   ├── 02_entity_servis.png
│   ├── ...
│   └── 19_frontend_alur_hapus_servis.png
│
├── Tugas 9 PengWeb - 103022430006 - Thoriq Abdurrohman Taqy.docx
├── Tugas 9 PengWeb - 103022430006 - Thoriq Abdurrohman Taqy.pdf
└── README.md
```

---

## 3. Data Utama & Entitas Servis

Data utama yang dikelola backend adalah entitas **Servis** dengan 9 atribut bertipe variatif:

| Field | Tipe Data | Format / Validasi | Deskripsi & Contoh |
| :--- | :--- | :--- | :--- |
| **id** | `string` | Unik (`SRV-xxx`) | Primary key / identifier unik servis (`SRV-101`) |
| **kendaraan** | `string` | `@IsString()`, `@MinLength(3)` | Nama merek dan model motor (`Honda Vario 160`) |
| **platNomor** | `string` | `@IsString()`, `@IsNotEmpty()` | Nomor plat polisi kendaraan (`D 2341 ABC`) |
| **jenisMotor** | `enum string` | `@IsIn(['Konvensional', 'Listrik'])` | Kategori teknologi motor |
| **bengkel** | `string` | `@IsString()`, `@IsNotEmpty()` | Nama bengkel rekanan servis |
| **layanan** | `string` | `@IsString()`, `@IsNotEmpty()` | Paket servis / jenis perbaikan |
| **biaya** | `number` | `@IsNumber()`, `@Min(10000)` | Estimasi tarif minimal Rp 10.000 |
| **tanggal** | `string` | `@IsDateString()` | Tanggal reservasi format ISO YYYY-MM-DD |
| **status** | `enum string` | `@IsIn(['Dijadwalkan', 'Selesai'])` | Status pengerjaan (opsional, default: Dijadwalkan) |

---

## 4. Fitur Arsitektur Backend NestJS

1. **Global ValidationPipe (`main.ts`)**:
   - `whitelist: true`: Menghapus otomatis field yang tidak terdaftar di DTO.
   - `forbidNonWhitelisted: true`: Melempar HTTP 400 Bad Request jika ada payload liar.
   - `transform: true`: Mengubah payload JSON ke tipe instansiasi DTO.
2. **CORS Enabled**:
   - Mengizinkan komunikasi lintas origin dari antarmuka React di browser.
3. **Dependency Injection**:
   - `ServisController` menerima `ServisService` melalui konstruktor (`constructor(private readonly servisService: ServisService) {}`).
4. **Exception Handling**:
   - `NotFoundException` (404): Dilempar jika ID servis tidak ditemukan saat `findOne`, `update`, atau `remove`.
   - `ConflictException` (409): Dilempar pada `create` jika plat nomor dan tanggal pemesanan berstatus 'Dijadwalkan' sudah terdaftar.

---

## 5. Dokumentasi Endpoint REST API

| Method | Endpoint | Status Sukses | Status Error | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/servis` | `200 OK` | - | Mengambil seluruh antrean servis |
| **GET** | `/servis/:id` | `200 OK` | `404 Not Found` | Mengambil detail servis berdasarkan ID |
| **POST** | `/servis` | `201 Created` | `400 Bad Request`, `409 Conflict` | Menambah servis baru |
| **PATCH** | `/servis/:id` | `200 OK` | `404 Not Found`, `400 Bad Request` | Memperbarui sebagian data servis |
| **DELETE** | `/servis/:id` | `200 OK` | `404 Not Found` | Menghapus data servis dari memori |

---

## 6. Panduan Menjalankan Sistem

### Menjalankan Backend NestJS:
```bash
cd "bengkelin-api"
npm run build
node dist/src/main.js
# Backend berjalan di: http://localhost:3001
# Endpoint API: http://localhost:3001/servis
```

### Menjalankan Frontend React:
```bash
cd "../bengkelin-frontend"
npx vite --port 5173
# Frontend terbuka di: http://localhost:5173
```

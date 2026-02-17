## Audit Keamanan EMR_Nia

Tanggal: 2026-02-17  
Lingkup: **Form login**, **RBAC & idempotensi API**, **SQL Injection**, dan **modern security checks** (JWT, logging, storage token).

---

## 1. Form Login (Frontend & Backend)

### Temuan

- **Frontend login (`src/modules/auth/login.tsx`)**
  - Input `login` (email/username) dan `password` sudah menggunakan `type="password"` dan atribut `required`.
  - Tidak ada pembatasan percobaan login (rate limiting/brute-force protection) di sisi frontend maupun feedback delay; penyerang bisa meng-otomasi percobaan password.
  - Error handling cukup generik (401/422/others) sehingga tidak membocorkan apakah username valid, namun pesan 401 masih cukup deskriptif.
- **Backend login (`backend/app/Http/Requests/Auth/LoginRequest.php` & `AuthController`)**
  - Validasi request:
    - `login`: `required|string`
    - `password`: `required|string`
  - Di `AuthController::login`:
    - `login` ditrim dan diturunkan (`mb_strtolower`), lalu dicari dengan:
      - `whereRaw('LOWER(email) = ?', [$loginLower])`
      - `orWhereRaw('LOWER(username) = ?', [$loginLower])`
    - Password diverifikasi dengan `Hash::check` terhadap field `password` yang tersimpan hashed (konfirmasi dari `User::casts()` yang meng-cast `password` sebagai `hashed`).
  - Response 401 tidak membedakan apakah email/username atau password yang salah (baik untuk mencegah user enumeration).

### Risiko

- **R1 – Brute force login**: Tidak ada rate limiting/lockout di level API `/api/auth/login`, sehingga percobaan brute force terhadap akun penting (mis. `superadmin`) dimungkinkan, terutama karena ada user default dengan password lemah (lihat bagian seeder).
- **R2 – Pengungkapan kredensial default**: Seeder membuat akun-akun produksi-like dengan password statis `password123` untuk beberapa user, termasuk `superadmin`.
- **R3 – Penyimpanan token di `localStorage`**:
  - Token JWT disimpan di `localStorage` via `auth-storage.ts`. Ini praktis tetapi rentan jika suatu saat ada XSS; attacker dapat mencuri JWT dan mengambil alih sesi sepenuhnya.

### Rekomendasi

- **A1 – Tambahkan rate limiting dan mekanisme lockout di login**
  - Gunakan fitur rate limiting Laravel pada route `/auth/login` (mis. throttle berbasis IP + login identifier).
  - Pertimbangkan “progressive delay” setelah beberapa kegagalan login.
- **A2 – Manajemen kredensial default**
  - Wajib ganti password `superadmin` dan seluruh akun seeded sebelum sistem dipakai di lingkungan nyata.
  - Dokumentasikan bahwa seeder ini hanya untuk environment `local`/`staging`. Untuk `production`, gunakan seeder khusus atau nonaktifkan block yang mengisi password statis.
- **A3 – Pertimbangkan pindah dari `localStorage` ke cookie HttpOnly**
  - Untuk lingkungan dengan tingkat keamanan tinggi (EMR), sebaiknya:
    - JWT disimpan di cookie `HttpOnly`, `Secure`, `SameSite=strict` atau `lax`.
    - Gunakan CSRF token untuk permintaan state‑changing jika menggunakan cookie.
  - Jika tetap memakai `localStorage`, pastikan hardening XSS (lintasan input, sanitasi, Content Security Policy yang ketat – lihat bagian modern checks).

---

## 2. RBAC & Idempotensi Akses

### Temuan

- **Role & Permission**
  - RBAC didefinisikan di `config/rbac.php` dengan daftar `permissions` dan mapping `roles`.
  - Seeder (`DatabaseSeeder`) secara otomatis membangun tabel `roles`, `permissions`, dan relasi.
  - Model `User`:
    - Relasi `roles()` dan `hasPermission()`:
      - `hasRole('superadmin')` => akses penuh.
      - Selain itu, permission dicek lewat relasi `roles.permissions`.
    - `permissionNames()` memberikan daftar permission yang dimiliki user.
  - Token JWT menyimpan klaim `roles` tetapi **authorization aktual** dilakukan via database (`EnsurePermission` middleware) sehingga relatif aman terhadap manipulasi klaim di sisi klien.
- **Middleware RBAC (`EnsurePermission`)**
  - Menggunakan guard `auth('api')` untuk mendapatkan `User`.
  - Jika tidak ada user -> 401.
  - Jika user tidak punya permission -> 403 + pesan umum.
  - Bypass RBAC hanya untuk environment `testing`, bukan `local`/`production`.
- **Penerapan pada route (`backend/routes/api.php`)**
  - Semua endpoint bisnis berada di dalam group:
    - Testing: `['audit.api']`
    - Non-testing: `['auth:api', 'audit.api']`
  - Hampir semua route di-protect dengan `->middleware('permission:...')`, termasuk:
    - `dashboard.summary` – `dashboard.view`
    - Modul pasien – `pasien.read` / `pasien.write`
    - Modul kunjungan – `kunjungan.read` / `kunjungan.write`
    - Modul rekam medis – `rekam_medis.read` / `rekam_medis.write`
    - Modul superadmin – `master.manage`
    - Audit log – `audit_log.read`
  - Modul `superadmin` (CRUD user, role, poli, master ICD) seluruhnya di-scope dengan `permission:master.manage`.
- **Idempotensi & keamanan perubahan data**
  - Endpoint `PUT`/`PATCH`/`POST` sudah di-protect dengan kombinasi `auth:api` + `permission`.
  - Tidak ditemukan endpoint sensitif tanpa permission check dalam group yang sama.
  - Beberapa endpoint bisnis tidak sepenuhnya idempoten secara HTTP (misalnya `POST rekam-medis/*/addendum`, `POST rekam-medis/*/resep/send`) – namun ini lebih ke desain API daripada celah keamanan, selama backend memvalidasi state dengan benar (di luar scope kode yang ditinjau).

### Risiko

- **R4 – Superadmin all-access**:
  - `hasPermission` otomatis mengizinkan semua permission untuk role `superadmin`. Ini sesuai konsep, tetapi kesalahan konfigurasi role akan membuat superadmin sangat kuat tanpa granularitas.
- **R5 – Penggunaan klaim JWT roles tanpa validasi tambahan (risiko teoretis)**
  - Klaim `roles` diset di token, namun keputusan akses real berbasis DB, bukan klaim. Ini sudah benar. Risiko hanya jika suatu hari kode lain menggunakan klaim ini tanpa verifikasi DB.

### Rekomendasi

- **B1 – Review periodik set permission/role**
  - Pastikan `master.manage` dan `audit_log.read` hanya dimiliki akun yang benar‑benar perlu (prinsip least privilege).
- **B2 – Dokumentasi changelog izin**
  - Tambahkan dokumentasi internal ketika permission baru ditambahkan ke `config/rbac.php` dan bagaimana itu digunakan; ini membantu audit reguler.
- **B3 – Idempotensi endpoint kritis**
  - Untuk operasi seperti finalisasi rekam medis, `addendum`, dan pengiriman resep:
    - Pastikan backend memvalidasi status terbaru (misal: tidak bisa finalisasi dua kali, tidak bisa mengirim resep dua kali tanpa state yang tepat).
    - Jika sudah diimplementasikan, dokumentasikan aturan ini sebagai bagian dari “security by design”.

---

## 3. SQL Injection

### Temuan

- **Pemakaian query builder & ORM**
  - Mayoritas query yang terlihat (mis. di `SuperadminRepository`, `DashboardController`) menggunakan Eloquent builder dengan binding parameter otomatis:
    - Filter keyword menggunakan `where` + `like` dengan concatenation berbasis variabel PHP, namun tetap melewati mekanisme binding internal Eloquent, bukan string raw yang tidak di-escape.
  - Di `DashboardController`, pemakaian `DB::raw('COUNT(*) as total')` hanya untuk agregasi statis, tidak mengandung input user.
- **Pemakaian `whereRaw` pada login (`AuthController::login`)**
  - Menggunakan:
    - `whereRaw('LOWER(email) = ?', [$loginLower])`
    - `orWhereRaw('LOWER(username) = ?', [$loginLower])`
  - Parameter `$loginLower` di-binding dengan placeholder `?` (prepared statement).

### Analisis Risiko

- **R6 – SQL Injection**
  - Dari kode yang diperiksa, tidak ada indikasi SQL injection langsung:
    - Satu‑satunya `whereRaw` menggunakan placeholder `?` dengan binding array.
    - `DB::raw` hanya digunakan untuk ekspresi agregat yang statis.
  - Asalkan tidak ada bagian lain dari aplikasi yang memakai `DB::raw`/`whereRaw` dengan interpolasi string langsung dari input user, risiko SQLi tergolong rendah pada modul yang diperiksa.

### Rekomendasi

- **C1 – Standar coding untuk query raw**
  - Tegakkan aturan: **setiap** pemakaian `whereRaw`, `DB::raw`, `DB::statement`, dll. harus:
    - Menggunakan placeholder dan binding parameter.
    - Atau hanya berisi bagian query statis (tanpa input user).
- **C2 – Tambahkan pemeriksaan linting / review**
  - Bisa menambah aturan di code review checklist untuk mencari string seperti `"whereRaw(\"...$variable...\")"` tanpa binding, dan melarangnya.

---

## 4. Modern Security Checks

### 4.1 JWT & Session Management

#### Temuan

- Autentikasi backend menggunakan guard `auth:api` dengan JWT (`tymon/jwt-auth`):
  - `AuthController::login` membuat token dengan klaim `roles`.
  - Endpoint `/auth/me` dan `/auth/logout` dilindungi oleh `auth:api`.
- Frontend:
  - Menyimpan `access_token` di `localStorage` via `auth-storage.ts`.
  - Setiap request memakai header `Authorization: Bearer <token>` (`api-client.ts`).
- Logout:
  - Backend memanggil `auth('api')->logout()` jika token tersedia, lalu frontend selalu menghapus token dari storage, bahkan jika logout API gagal.

#### Risiko

- **R7 – Token theft via XSS**:
  - Penyimpanan JWT di `localStorage` rentan terhadap serangan XSS: jika penyerang berhasil menjalankan JS, ia dapat membaca token dan menggunakannya di luar browser korban.

#### Rekomendasi

- **D1 – Evaluasi ulang strategi penyimpanan token**
  - Untuk sistem EMR (data kesehatan), pertimbangkan:
    - Menggunakan cookie `HttpOnly + Secure + SameSite`.
    - Menambahkan expiry yang relatif pendek (mis. 15–30 menit) dengan mekanisme refresh token (juga aman).
- **D2 – Implementasi CSP & XSS-hardening**
  - Tambahkan Content Security Policy yang ketat (mis. hanya mengizinkan script dari origin sendiri, non-inline).
  - Pastikan seluruh data yang dirender ke UI disanitasi dan tidak disisipkan ke DOM sebagai HTML mentah kecuali lewat sanitization library.

### 4.2 Rate Limiting & Proteksi Brute Force

#### Temuan

- Route `/api/auth/login` belum terlihat memakai rate limiting built-in Laravel.
- Route lain (API bisnis) juga tidak tampak dibatasi per‑IP atau per‑user, meskipun lebih jarang jadi target brute force.

#### Rekomendasi

- **E1 – Tambahkan rate limiting di login**
  - Contoh: 5–10 percobaan per menit per IP + per `login` identifier.
  - Untuk repeated failure, perbesar delay atau lock akun sementara dan kirimkan notifikasi internal.

### 4.3 Logging & Audit

#### Temuan

- Middleware `AuditApiAction` mencatat seluruh request **write** (`POST`, `PUT`, `PATCH`, `DELETE`) ke tabel `AuditLog`:
  - Menyimpan `user_id`, method, path, status code, IP, user agent, dan payload request (dengan pengecualian field sensitif `password`, `password_confirmation`).
  - Query string juga disimpan di field `meta`.
- Ini sangat baik untuk **non‑repudiation** dan forensik insiden.

#### Potensi Perbaikan

- **F1 – Reduksi data sensitif di log**
  - Pastikan payload yang mengandung data pasien (rekam medis, diagnosa) tidak menyimpan informasi yang tidak perlu di log, atau enkripsi field ekstra sensitif di `AuditLog`.
  - Pastikan field mangement log sesuai regulasi privasi setempat (mis. data rekam medis yang tidak boleh disimpan terlalu lama di log).
- **F2 – Monitoring & alerting**
  - Tambahkan mekanisme untuk membaca log dan memicu alert jika ada pola anomali (mis. banyak kegagalan login, banyak perubahan dari satu akun tertentu, dll).

### 4.4 Headers & Transport Security (Asumsi)

- Dari kode yang tersedia:
  - Tidak terlihat konfigurasi khusus untuk HSTS, CSP, X-Frame-Options, dll. Ini biasanya diatur di level web server atau middleware global (di luar kode yang diperlihatkan).

#### Rekomendasi

- **G1 – Pastikan hanya HTTPS**
  - Terapkan HTTPS end‑to‑end, tambahkan HSTS (`Strict-Transport-Security`).
- **G2 – Security headers**
  - Tambahkan header:
    - `Content-Security-Policy`
    - `X-Frame-Options: DENY` (kecuali memang perlu iframe)
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: no-referrer-when-downgrade` atau lebih ketat.

---

## 5. Ringkasan Tingkat Risiko & Prioritas Perbaikan

- **Tinggi**
  - R1: Tidak ada rate limiting/lockout di login.
  - R2: Kredensial default dengan password lemah (`password123`) untuk akun superadmin dan akun lain.
  - R7: Penyimpanan JWT di `localStorage` (sangat bergantung pada posture XSS).
- **Sedang**
  - R4: Superadmin dengan akses penuh – perlu pengelolaan operasional yang ketat.
  - R6: Penggunaan `whereRaw` – saat ini aman, tapi butuh standar coding agar tidak menyimpang di masa depan.
- **Rendah**
  - Potensi over‑logging data sensitif di `AuditLog`.

### Prioritas Implementasi

1. **Segera ganti seluruh password default dan pastikan kebijakan password kuat** (min. panjang, kombinasi karakter, histori password, dll).
2. **Tambahkan rate limiting & lockout pada endpoint login**.
3. **Evaluasi strategi penyimpanan JWT** (pertimbangkan pindah ke cookie HttpOnly + Secure + SameSite).
4. Perkuat **CSP dan header keamanan** di level aplikasi/server.
5. Lanjutkan dengan **hardening log & audit**, termasuk rotasi dan proteksi terhadap kebocoran data sensitif.

---

## 6. Audit Khusus per Modul/Menu

Bagian ini merangkum celah potensial dari semua menu utama yang ada di API (`pasien`, `kunjungan`, `rekam-medis`, `superadmin`, `obat`, `icd`, `audit-logs`, dan `dashboard`).

### 6.1 Modul Dashboard

- **Proteksi saat ini**
  - Endpoint: `GET /api/dashboard/summary` dengan `permission:dashboard.view`.
  - Query menggunakan scope user (`applyUserScope`) sehingga:
    - `admin_poli` hanya melihat data poli yang menjadi scope-nya.
    - `dokter` hanya melihat data kunjungan yang terkait `dokter_id` miliknya.
- **Risiko & saran**
  - Pastikan role yang diberi `dashboard.view` memang hanya yang berwenang melihat agregat kunjungan & diagnosa (data ini bisa cukup sensitif walaupun teragregasi).

### 6.2 Modul Pasien

- **Proteksi saat ini**
  - Route:
    - `GET /api/pasien/*` dilindungi `permission:pasien.read`.
    - `POST /api/pasien` & `PATCH /api/pasien/{id}/allergies` dilindungi `permission:pasien.write`.
  - Semua endpoint menggunakan `FormRequest` khusus (`IndexPasienRequest`, `StorePasienRequest`, `UpdatePasienAllergiesRequest`) untuk validasi input.
  - Data selalu dibungkus `PasienResource` / `PasienCollection` (bukan model mentah) sehingga bisa dikontrol field yang keluar.
- **Risiko potensial**
  - **Ekspose data pasien lintas poli/dokter**:
    - Di kode yang terlihat, scope pasien berdasarkan poli/dokter tidak diterapkan di controller; scope akses biasanya diatur di service (`PasienService`) atau repository. Jika belum ada, `admin_poli` atau `dokter` berpotensi melihat pasien di luar scope-nya.
- **Rekomendasi**
  - Terapkan pola yang sama seperti `RekamMedisService::applyUserScopeToFilters` juga di **layer pasien & kunjungan**:
    - Tambahkan filter otomatis berdasarkan `poli` dan `dokter_id` untuk role non‑superadmin.
  - Pastikan `PasienResource` tidak mengembalikan field yang terlalu sensitif jika memang tidak dibutuhkan di UI (mis. alamat lengkap bila hanya perlu ringkasan).

### 6.3 Modul Kunjungan

- **Proteksi saat ini**
  - Route:
    - `GET /api/kunjungan/*` → `permission:kunjungan.read`.
    - `POST /api/kunjungan`, `PATCH /api/kunjungan/{id}` → `permission:kunjungan.write`.
  - Controller tidak menerima input mentah; semua operasi write melalui `StoreKunjunganRequest` dan `UpdateKunjunganStatusRequest`.
- **Risiko potensial**
  - Sama seperti modul pasien, **scope kunjungan per poli/dokter** harus dijaga ketat. Jika `KunjunganService` belum menerapkan scope seperti di `RekamMedisService::assertUserCanAccessKunjungan`, dokter atau admin poli bisa mengakses kunjungan di poli lain.
- **Rekomendasi**
  - Di `KunjunganService` / repository:
    - Terapkan filter otomatis berdasarkan `poliScopes()` dan `dokter_id` untuk semua query list/detail kunjungan.
  - Pastikan status transisi (mis. dari `WAITING` ke `IN_PROGRESS` ke `COMPLETED`) divalidasi di backend agar tidak bisa melompat state sembarangan.

### 6.4 Modul Rekam Medis

- **Proteksi saat ini**
  - Semua endpoint `rekam-medis` memakai permission:
    - `rekam_medis.read` untuk baca.
    - `rekam_medis.write` untuk tulis/finalisasi/kirim resep.
  - **Layer service** (`RekamMedisService`) sudah cukup ketat:
    - `list()` menerapkan `applyUserScopeToFilters` untuk membatasi data berdasarkan peran (`admin_poli`, `dokter`).
    - Untuk semua operasi pada 1 kunjungan (`getByKunjunganId`, `upsertDraft`, `finalize`, `addAddendum`, `sendResep`) selalu:
      - Validasi bahwa kunjungan ada.
      - Panggil `assertUserCanAccessKunjungan` untuk cek poli & dokter.
    - Ada aturan bisnis:
      - Tidak bisa mengubah data inti jika status `Final`.
      - Finalisasi wajib punya `Subjective`, `Assessment`, dan minimal 1 diagnosa.
      - Addendum hanya boleh di status `Final`.
- **Risiko potensial**
  - **Replay/duplikasi aksi**:
    - `sendResep` saat ini hanya mengeset `resep_status` ke `Sent` tanpa mencegah pemanggilan ulang. Secara bisnis bisa berdampak ke farmasi (penggandaan permintaan).
- **Rekomendasi**
  - Tambahkan guard di `sendResep`:
    - Jika `resep_status` sudah `Sent`, tolak dengan error 400/409.
  - Pastikan resource yang dipulangkan (`RekamMedisDetailResource`) tidak mengandung informasi pasien yang berlebihan untuk kebutuhan UI (sesuaikan dengan regulasi).

### 6.5 Modul Superadmin (User, Role, Poli, Master ICD)

- **Proteksi saat ini**
  - Semua route di bawah `/api/superadmin/*` berada di dalam group `permission:master.manage`.
  - Controller `SuperadminController` menggunakan service dan FormRequest terpisah untuk tiap operasi (create/update user, role, poli, ICD).
  - Repository (`SuperadminRepository`) memakai Eloquent biasa dengan filter yang aman (tidak menemukan query raw berbahaya).
- **Risiko potensial**
  - **Single point of failure**:
    - Jika sebuah akun non‑superadmin mendapat permission `master.manage` secara keliru, ia dapat:
      - Membuat/menghapus user.
      - Mengubah role & permission.
      - Mengubah poli dan master ICD.
  - **Mass assignment**:
    - Pastikan field yang boleh diisi user lewat API disaring di FormRequest, sehingga walaupun `User::fillable` cukup terbatas, tidak ada field tambahan yang ikut termodifikasi.
- **Rekomendasi**
  - Batasi pemilik `master.manage` hanya ke akun yang benar‑benar terkontrol secara operasional.
  - Tambahkan audit khusus untuk perubahan di modul ini (mis. kategori `meta` di `AuditLog` menandai operasi superadmin).

### 6.6 Modul Obat & ICD

- **Proteksi saat ini**
  - `/api/obat/search` → `permission:rekam_medis.read` + `SearchObatRequest`.
  - `/api/icd/search` → `permission:rekam_medis.read` + query langsung dengan Eloquent, tanpa raw SQL.
- **Risiko potensial**
  - **Data enumeration**:
    - Jika limit sangat besar dan tidak ada rate limiting, seorang attacker autentikasi bisa melakukan enumerasi seluruh katalog ICD/obat (lebih ke risiko beban & scraping daripada pelanggaran privasi berat).
- **Rekomendasi**
  - Pertahankan limit maksimum yang ketat (sudah ada di ICD, max 50).
  - Tambahkan limit maksimum juga di `ObatService::search` bila belum.

### 6.7 Modul Audit Log

- **Proteksi saat ini**
  - `GET /api/audit-logs` dilindungi `permission:audit_log.read`.
  - Query cukup fleksibel (filter by method, status_code, user_id, date range, dll.) namun semua lewat `IndexAuditLogRequest`.
- **Risiko potensial**
  - **Paparan meta-data aktivitas seluruh user**:
    - Akun dengan `audit_log.read` bisa melihat pola akses user lain; ini wajar untuk admin keamanan, tapi jangan diberikan ke role operasional biasa.
- **Rekomendasi**
  - Pastikan hanya security admin/owner sistem yang punya permission ini.
  - Pertimbangkan masking sebagian informasi jika diakses dari UI yang tidak murni untuk security (mis. sembunyikan sebagian IP bila tidak perlu).

---

## 7. Kesimpulan Tambahan untuk Semua Menu

- Secara umum, **semua menu utama API sudah diproteksi** oleh kombinasi `auth:api` + permission berbasis RBAC.
- Modul dengan data paling sensitif (rekam medis dan audit log) sudah memiliki:
  - Pembatasan berdasar poli/dokter di `RekamMedisService`.
  - Logging terpusat di `AuditApiAction` dan akses audit log via permission khusus.
- Fokus hardening lanjutan untuk mencegah celah “orang dalam” atau penyalahgunaan menu:
  - Pengetatan scope akses di modul pasien & kunjungan.
  - Pembatasan ketat pada permission kuat (`master.manage`, `audit_log.read`, `rekam_medis.write`).
  - Kontrol operasional (review berkala role/permission dan monitoring pola penggunaan menu).


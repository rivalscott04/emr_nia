# Panduan Backend API — Modul Auth (Autentikasi)

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Auth** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Login (email/username + password), session/token, dan logout. Dasar untuk akses semua modul lain.
- **Route frontend:** `/login` (unprotected), sisanya di belakang layout yang memeriksa auth.

---

## 2. Asumsi Umum

- Setelah login berhasil, backend mengembalikan **token** (JWT atau session identifier). Frontend menyimpan token (mis. di memory/localStorage/cookie) dan mengirimkannya di header setiap request API.
- Header yang umum: `Authorization: Bearer <token>` atau `Cookie` untuk session-based auth.

---

## 3. Endpoint yang Diperlukan

### 3.1 Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Body:**

```json
{
  "email": "admin@klinik.com",
  "password": "***"
}
```

atau `username` instead of `email` (sesuai form frontend: "Email / Username").

**Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2024-02-18T12:00:00.000Z",
  "user": {
    "id": "u1",
    "nama": "Dr. Andi",
    "email": "admin@klinik.com",
    "role": "dokter"
  }
}
```

**Response (401):** Kredensial salah (email/username atau password invalid).

**Response (400):** Body tidak valid (field kosong, format salah).

---

### 3.2 Logout (opsional)

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

Backend bisa invalidate token/session di sisi server. **Response (200/204):** Success.

---

### 3.3 Me / profil user saat ini

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):** Objek user (id, nama, email, role, dll) untuk menampilkan nama di header/sidebar dan pengecekan role.

**Response (401):** Token tidak valid atau kedaluwarsa.

---

### 3.4 Refresh token (opsional)

Jika memakai refresh token:

```http
POST /api/auth/refresh
Content-Type: application/json
```

**Body:** `{ "refresh_token": "..." }`  
**Response (200):** `{ "token": "...", "expires_at": "..." }`.

---

## 4. Keamanan

- Password tidak boleh dikembalikan di response; hanya hash yang disimpan di DB.
- Gunakan HTTPS di production.
- Token dengan expiry; refresh atau re-login ketika kedaluwarsa.
- Endpoint selain login (dan mungkin register) harus memeriksa token/session.

---

## 5. Integrasi dengan Modul Lain

- Semua endpoint modul Pasien, Kunjungan, Rekam Medis, Resep, Tindakan, Settings, Dashboard sebaiknya **memerlukan auth**. Backend memeriksa token dan mengisi `dokter_id` / `user_id` dari token (mis. saat create kunjungan, addendum, finalisasi).
- Role (dokter, perawat, farmasi, admin) bisa dipakai untuk otorisasi (mis. hanya dokter yang bisa finalisasi rekam medis).

---

## 6. Nama File Panduan

`apiguide_modul_auth.md`

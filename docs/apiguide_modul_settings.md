# Panduan Backend API — Modul Settings (Pengaturan)

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Settings** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Pengaturan sistem klinik (info klinik untuk kop surat/resep) dan manajemen user (daftar pengguna). Bisa diperluas untuk poli, dokter, dll.
- **Route frontend:** `/settings`.

---

## 2. Submodul

### 2.1 Info Klinik

Data profil klinik yang tampil di kop surat/resep.

| Field | Tipe | Keterangan |
|-------|------|------------|
| `nama` | string | Nama klinik |
| `alamat` | string | Alamat lengkap |
| `no_telepon` | string | No. telepon |
| `email` | string | Opsional |
| `logo_url` | string | Opsional; URL logo |

Biasanya **satu record** per tenant/instalasi (single clinic).

### 2.2 Manajemen User

Daftar pengguna sistem (admin, dokter, perawat, farmasi). Detail user: id, nama, email/username, role, status (aktif/nonaktif). Create/update user dan reset password bisa ditambah nanti.

---

## 3. Endpoint yang Diperlukan

### 3.1 Info Klinik — Get

```http
GET /api/settings/klinik
```

**Response (200):**

```json
{
  "nama": "Klinik Pratama Sehat",
  "alamat": "Jl. Sudirman No. 123, Jakarta",
  "no_telepon": "021-5556677",
  "email": "info@klinik.com",
  "logo_url": null
}
```

---

### 3.2 Info Klinik — Update

```http
PATCH /api/settings/klinik
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** Partial (nama, alamat, no_telepon, email, logo_url).

**Response (200):** Objek info klinik terbaru.

**Response (403):** Hanya role tertentu (mis. admin) yang boleh update.

---

### 3.3 Manajemen User — Daftar (untuk tab “Manajemen User”)

```http
GET /api/settings/users
Authorization: Bearer <token>
```

**Query (opsional):** `q`, `role`, `page`, `limit`.

**Response (200):**

```json
{
  "data": [
    {
      "id": "u1",
      "nama": "Dr. Andi",
      "email": "andi@klinik.com",
      "role": "dokter",
      "status": "aktif",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3.4 Manajemen User — Create / Update / Deactivate (opsional)

- `POST /api/settings/users` — buat user (body: nama, email, role, password sementara).
- `PATCH /api/settings/users/:id` — update nama, email, role, status.
- `POST /api/settings/users/:id/reset-password` — reset password (body: password baru atau kirim link reset).

Implementasi bisa mengikuti setelah kebutuhan role dan keamanan jelas.

---

## 4. Validasi & Keamanan

- Hanya user dengan role **admin** (atau sesuai kebijakan) yang boleh mengubah info klinik dan mengelola user.
- Info klinik: validasi format (email, no_telepon) opsional.

---

## 5. Integrasi dengan Modul Lain

- **Rekam Medis / Resep:** saat cetak resep atau surat, sistem mengambil info klinik dari GET settings/klinik untuk kop.
- **Auth:** daftar user bisa memakai entitas User yang sama dengan login; role dipakai untuk akses modul (dashboard, pasien, kunjungan, rekam medis, resep, tindakan, settings).

---

## 6. Nama File Panduan

`apiguide_modul_settings.md`

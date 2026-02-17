# Panduan Backend API — Modul Kunjungan

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Kunjungan** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Data kunjungan pasien ke poli (antrian, buat kunjungan, aksi ke Rekam Medis).
- **Alur:** Pasien dipilih dari master Pasien → kunjungan dibuat → dari kunjungan dibuka halaman Rekam Medis (`/rekam-medis/:kunjunganId`).
- **Route frontend:** `/kunjungan`, `/kunjungan/create`, `/kunjungan/:id` (jika ada detail).

---

## 2. Model Data

### Kunjungan

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | string | Ya | PK (contoh: K-001) |
| `pasien_id` | string | Ya | FK ke Pasien |
| `pasien_nama` | string | Ya | Denormalisasi untuk tampilan list |
| `dokter_id` | string | Ya | FK ke master Dokter |
| `dokter_nama` | string | Ya | Nama dokter untuk tampilan |
| `poli` | string | Ya | Nama poli (Umum, Gigi, KIA, dll) |
| `tanggal` | string | Ya | ISO 8601 date/datetime kunjungan |
| `keluhan_utama` | string | Ya | Keluhan saat daftar |
| `status` | string | Ya | OPEN \| COMPLETED \| CANCELLED |
| `created_at` | string | Ya | ISO 8601 datetime |

### KunjunganInput (untuk create)

| Field | Tipe | Wajib |
|-------|------|-------|
| `pasien_id` | string | Ya |
| `dokter_id` | string | Ya |
| `poli` | string | Ya |
| `keluhan_utama` | string | Ya |

---

## 3. Endpoint yang Diperlukan

### 3.1 Daftar kunjungan

```http
GET /api/kunjungan
```

**Query (opsional):**

- `status` — filter: OPEN, COMPLETED, CANCELLED
- `tanggal` — filter per tanggal (ISO date)
- `q` — pencarian (pasien_nama, no_rm)
- `page`, `limit` — paginasi

**Response (200):**

```json
{
  "data": [
    {
      "id": "K-001",
      "pasien_id": "1",
      "pasien_nama": "Budi Santoso",
      "dokter_id": "D-01",
      "dokter_nama": "dr. Andi",
      "poli": "Umum",
      "tanggal": "2024-02-17T08:00:00.000Z",
      "keluhan_utama": "Demam dan batuk",
      "status": "OPEN",
      "created_at": "2024-02-17T07:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3.2 Detail kunjungan

```http
GET /api/kunjungan/:id
```

**Response (200):** Satu objek Kunjungan (boleh ditambah field terkait rekam medis, misal `rekam_medis_id` atau `has_rekam_medis`).

**Response (404):** Kunjungan tidak ditemukan.

---

### 3.3 Buat kunjungan baru

```http
POST /api/kunjungan
Content-Type: application/json
```

**Body:** KunjunganInput.

**Response (201):** Objek Kunjungan yang baru dibuat. Backend mengisi:

- `id` (generate)
- `pasien_nama`, `dokter_nama` (dari master atau lookup)
- `tanggal` (bisa default hari ini)
- `status`: `"OPEN"`
- `created_at`

**Response (400):** Validasi gagal (pasien_id/dokter_id tidak valid, dll).

**Response (404):** Pasien tidak ditemukan.

---

### 3.4 Update status kunjungan (opsional)

```http
PATCH /api/kunjungan/:id
Content-Type: application/json
```

**Body (partial):**

```json
{
  "status": "COMPLETED"
}
```

Digunakan ketika rekam medis difinalisasi atau kunjungan dibatalkan.

---

## 4. Validasi & Aturan Bisnis

- `pasien_id` harus mengacu ke Pasien yang ada.
- `dokter_id` harus mengacu ke master Dokter (endpoint master dokter di luar dokumen ini).
- `status` hanya OPEN | COMPLETED | CANCELLED.
- Satu pasien boleh punya banyak kunjungan (termasuk beberapa OPEN jika aturan bisnis mengizinkan).

---

## 5. Integrasi dengan Modul Lain

- **Pasien:** dropdown pilih pasien di form create; tampilan list pakai `pasien_nama` (dan bisa no_rm).
- **Rekam Medis:** dibuka per kunjungan (`/rekam-medis/:kunjunganId`). Backend Rekam Medis perlu `kunjungan_id` untuk menyimpan dan mengambil data SOAP/TTV/Diagnosa/Resep. Saat buka halaman rekam medis, frontend membutuhkan:
  - Data kunjungan (id, pasien_id, poli, dokter, dll)
  - Data pasien (nama, umur, jenis_kelamin, no_rm, **allergies**) — bisa dari GET pasien by pasien_id atau dari response GET rekam-medis by kunjungan_id.

---

## 6. Nama File Panduan

`apiguide_modul_kunjungan.md`

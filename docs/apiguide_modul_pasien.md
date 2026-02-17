# Panduan Backend API — Modul Pasien

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Pasien** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Master data pasien (registrasi, profil, riwayat alergi).
- **Alur:** Data pasien dipakai di Kunjungan dan Rekam Medis; **alergi** diisi di sini dan ditampilkan/dipakai di Rekam Medis.
- **Route frontend:** `/pasien`, `/pasien/new`, `/pasien/:id`.

---

## 2. Model Data

### Pasien

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | string | Ya | PK, UUIDV7 atau kode unik |
| `nik` | string | Ya | NIK 16 digit |
| `no_rm` | string | Ya | No. Rekam Medis (bisa auto-generate) |
| `nama` | string | Ya | Nama lengkap |
| `tanggal_lahir` | string | Ya | ISO 8601 date |
| `jenis_kelamin` | `"L"` \| `"P"` | Ya | L = Laki-laki, P = Perempuan |
| `alamat` | string | Ya | Alamat |
| `no_hp` | string | Ya | No. telepon/HP |
| `golongan_darah` | string | Tidak | O/A/B/AB, dll |
| `pekerjaan` | string | Tidak | |
| `status_pernikahan` | string | Tidak | Belum Menikah / Menikah / Cerai |
| `nama_ibu_kandung` | string | Tidak | |
| `allergies` | string[] | Tidak | Daftar alergi (obat/bahan); dipakai di Rekam Medis |
| `created_at` | string | Ya | ISO 8601 datetime |
| `updated_at` | string | Ya | ISO 8601 datetime |

### PasienInput (untuk create)

Sama seperti Pasien tanpa: `id`, `no_rm`, `allergies`, `created_at`, `updated_at`. Field opsional tetap opsional.

---

## 3. Endpoint yang Diperlukan

### 3.1 Daftar pasien

```http
GET /api/pasien
```

**Query (opsional):**

- `q` — pencarian (nama, NIK, no_rm)
- `page`, `limit` — paginasi

**Response (200):**

```json
{
  "data": [
    {
      "id": "1",
      "nik": "1234567890123456",
      "no_rm": "RM-00001",
      "nama": "Budi Santoso",
      "tanggal_lahir": "1985-05-20",
      "jenis_kelamin": "L",
      "alamat": "Jl. Merdeka No. 10",
      "no_hp": "081234567890",
      "allergies": ["Amoxicillin", "Ibuprofen"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-02-17T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3.2 Detail pasien

```http
GET /api/pasien/:id
```

**Response (200):** Satu objek Pasien (struktur di atas).

**Response (404):** Pasien tidak ditemukan.

---

### 3.3 Pencarian pasien (untuk dropdown/autocomplete)

```http
GET /api/pasien/search?q=...
```

**Query:**

- `q` (wajib) — kata kunci (nama, NIK, no_rm).

**Response (200):** Array Pasien (bisa dibatasi, misal 20 item).

---

### 3.4 Tambah pasien (registrasi)

```http
POST /api/pasien
Content-Type: application/json
```

**Body:** PasienInput (tanpa `id`, `no_rm`, `allergies`, `created_at`, `updated_at`).

**Response (201):** Objek Pasien yang baru dibuat (termasuk `id`, `no_rm`, `allergies: []`, `created_at`, `updated_at`).

**Response (400):** Validasi gagal (NIK duplikat, field wajib kosong, dll).

---

### 3.5 Update alergi pasien

```http
PATCH /api/pasien/:id/allergies
Content-Type: application/json
```

**Body:**

```json
{
  "allergies": ["Amoxicillin", "Ibuprofen", "Paracetamol"]
}
```

**Response (200):** Objek Pasien terbaru (termasuk `allergies` dan `updated_at`).

**Response (404):** Pasien tidak ditemukan.

**Catatan:** Data alergi ini yang akan ditampilkan dan dipakai untuk validasi resep di Modul Rekam Medis.

---

## 4. Validasi & Aturan Bisnis

- **NIK:** unik, 16 digit.
- **no_rm:** unik, bisa di-generate oleh backend (misal format `RM-XXXXX`).
- **allergies:** array of string; simpan persis seperti input (untuk matching di resep); hindari duplikat case-insensitive.

---

## 5. Integrasi dengan Modul Lain

- **Kunjungan:** membutuhkan `pasien_id` dan sering menampilkan `pasien_nama`, `no_rm` (bisa join atau denormalisasi).
- **Rekam Medis:** membutuhkan data pasien (nama, umur, jenis_kelamin, no_rm, **allergies**) per kunjungan; sumber alergi adalah master pasien ini.

---

## 6. Nama File Panduan

`apiguide_modul_pasien.md`

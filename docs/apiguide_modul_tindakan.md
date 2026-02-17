# Panduan Backend API — Modul Tindakan (Master Tindakan)

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Tindakan** (master tindakan medis) pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Master/referensi tindakan medis (biasanya mengacu ICD-9 CM atau kode internal), untuk tarif dan billing.
- **Alur:** Data master dibaca untuk dropdown/pencarian di form (mis. di Rekam Medis atau billing). Bisa dipakai saat input tindakan per kunjungan.
- **Route frontend:** `/tindakan`.

---

## 2. Model Data

### Tindakan

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | string | Ya | PK (opsional jika kode unik) |
| `kode` | string | Ya | Kode tindakan (mis. ICD-9 CM: 89.03, 23.2) |
| `nama` | string | Ya | Nama tindakan |
| `kategori` | string | Ya | Kategori (Umum, Gigi, Bedah Minor, dll) |
| `tarif` | number | Ya | Tarif dalam satuan mata uang (IDR) |
| `created_at` | string | Tidak | ISO 8601 |
| `updated_at` | string | Tidak | ISO 8601 |

---

## 3. Endpoint yang Diperlukan

### 3.1 Daftar tindakan

```http
GET /api/tindakan
```

**Query (opsional):**

- `q` — pencarian (kode, nama)
- `kategori` — filter kategori
- `page`, `limit` — paginasi

**Response (200):**

```json
{
  "data": [
    {
      "kode": "89.03",
      "nama": "Consultation",
      "kategori": "Umum",
      "tarif": 50000
    },
    {
      "kode": "23.2",
      "nama": "Restoration of tooth",
      "kategori": "Gigi",
      "tarif": 150000
    }
  ],
  "total": 2
}
```

---

### 3.2 Detail tindakan (opsional)

```http
GET /api/tindakan/:id
```

atau

```http
GET /api/tindakan/kode/:kode
```

**Response (200):** Satu objek Tindakan.

---

### 3.3 Tambah tindakan

```http
POST /api/tindakan
Content-Type: application/json
```

**Body:** Objek Tindakan (tanpa `id` jika auto-generate). Minimal: `kode`, `nama`, `kategori`, `tarif`.

**Response (201):** Tindakan yang baru dibuat.

**Response (400):** Validasi (kode duplikat, tarif invalid, dll).

---

### 3.4 Update tindakan

```http
PATCH /api/tindakan/:id
Content-Type: application/json
```

**Body:** Partial (nama, kategori, tarif).

**Response (200):** Tindakan terbaru.

---

### 3.5 Hapus tindakan (soft delete opsional)

```http
DELETE /api/tindakan/:id
```

**Response (204):** Berhasil. Pertimbangkan soft delete jika sudah dipakai di transaksi.

---

## 4. Validasi & Aturan Bisnis

- `kode` unik.
- `tarif` >= 0.
- Kategori bisa dari master terpisah atau enum tetap (Umum, Gigi, KIA, Bedah Minor, dll).

---

## 5. Integrasi dengan Modul Lain

- **Rekam Medis / Billing:** saat input tindakan per kunjungan, frontend memanggil GET tindakan untuk autocomplete atau dropdown; simpan `tindakan_kode` atau `tindakan_id` + quantity dan tarif di transaksi.

---

## 6. Nama File Panduan

`apiguide_modul_tindakan.md`

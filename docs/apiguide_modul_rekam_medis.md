# Panduan Backend API — Modul Rekam Medis

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Rekam Medis** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Satu rekam medis per kunjungan: SOAP, TTV, Diagnosa (ICD-10), Resep, status Final/Draft, Addendum.
- **Alur:** Dibuka dari Kunjungan (`/rekam-medis/:kunjunganId`). Data pasien (termasuk **alergi**) diambil dari master Pasien dan ditampilkan; alergi tidak di-input di sini.
- **Route frontend:** `/rekam-medis` (list), `/rekam-medis/:kunjunganId` (detail/form).

---

## 2. Model Data

### Rekam Medis (header / identitas)

- Terikat ke **satu kunjungan** (`kunjungan_id`).
- Berisi status: **Draft** | **Final**.
- Setelah Final, hanya Addendum yang bisa ditambah.

### SOAP

| Field | Tipe | Keterangan |
|-------|------|------------|
| `subjective` | string | S |
| `objective` | string | O |
| `assessment` | string | A |
| `plan` | string | P |
| `instruksi` | string | Instruksi tambahan |

### TTV (Tanda Tanda Vital)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `sistole` | number | mmHg |
| `diastole` | number | mmHg |
| `nadi` | number | /menit |
| `rr` | number | Respiratory rate |
| `suhu` | number | °C |
| `spo2` | number | % |
| `berat_badan` | number | kg |
| `tinggi_badan` | number | cm |

### Diagnosa (ICD-10)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `code` | string | Kode ICD-10 |
| `name` | string | Deskripsi |

Banyak diagnosa per rekam medis (one-to-many). Satu bisa ditandai sebagai **utama** (opsional).

### Resep (item per obat)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | string | PK item |
| `nama_obat` | string | Nama obat |
| `jumlah` | string | Jumlah (mis. "30 tablet") |
| `aturan_pakai` | string | Aturan pakai |

Resep punya status: **Draft** | **Sent** | **Dispensed** (bisa di level header rekam medis atau level resep).

### Addendum

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | string | PK |
| `catatan` | string | Isi addendum |
| `timestamp` | string | ISO 8601 |
| `dokter` | string | Nama dokter (atau user_id) |

Hanya untuk rekam medis yang sudah **Final**.

---

## 3. Endpoint yang Diperlukan

### 3.1 Daftar rekam medis (untuk halaman Riwayat Rekam Medis)

```http
GET /api/rekam-medis
```

**Query (opsional):** `tanggal`, `pasien_id`, `dokter_id`, `status` (Draft/Final), `page`, `limit`.

**Response (200):** Daftar item dengan field tampilan, misal:

```json
{
  "data": [
    {
      "id": "RM-2024-001",
      "kunjungan_id": "K-001",
      "tanggal": "2024-02-17",
      "pasien_nama": "Budi Santoso",
      "no_rm": "00-12-34",
      "diagnosa_utama": "I10 - Essential (primary) hypertension",
      "dokter": "dr. Andi",
      "status": "Final"
    }
  ],
  "total": 1
}
```

`id` bisa sama dengan `kunjungan_id` atau ID dokumen rekam medis tersendiri.

---

### 3.2 Ambil satu rekam medis (untuk form isian / view)

```http
GET /api/rekam-medis/kunjungan/:kunjunganId
```

atau

```http
GET /api/kunjungan/:kunjunganId/rekam-medis
```

**Response (200):** Satu dokumen rekam medis lengkap, termasuk:

- **Header:** `kunjungan_id`, `status` (Draft/Final), `resep_status` (jika ada).
- **Pasien:** `id`, `nama`, `umur`, `jenis_kelamin`, `no_rm`, **`allergies`** (wajib dari master Pasien).
- **SOAP:** objek SOAP.
- **TTV:** objek TTV.
- **Diagnosa:** array ICD (`code`, `name`), plus penanda utama jika ada.
- **Resep:** array item resep.
- **Addendum:** array addendum (biasanya hanya jika status Final).

Contoh:

```json
{
  "kunjungan_id": "K-001",
  "status": "Draft",
  "resep_status": "Draft",
  "patient": {
    "id": "1",
    "nama": "Budi Santoso",
    "umur": "35 Tahun",
    "jenis_kelamin": "Laki-laki",
    "no_rm": "RM-00001",
    "allergies": ["Amoxicillin", "Ibuprofen"]
  },
  "soap": { "subjective": "", "objective": "", "assessment": "", "plan": "", "instruksi": "" },
  "ttv": { "sistole": 120, "diastole": 80, "nadi": 80, "rr": 20, "suhu": 36.5, "spo2": 98, "berat_badan": 60, "tinggi_badan": 170 },
  "diagnosa": [],
  "resep": [],
  "addendums": []
}
```

**Response (404):** Kunjungan atau rekam medis belum ada. Frontend bisa mengizinkan "buat baru" dan panggil POST.

---

### 3.3 Buat / update rekam medis (upsert per kunjungan)

Simpan SOAP, TTV, Diagnosa, Resep dalam satu payload atau terpisah; berikut pola umum.

**Buat atau update draft:**

```http
PUT /api/rekam-medis/kunjungan/:kunjunganId
Content-Type: application/json
```

**Body:** Minimal SOAP, TTV, diagnosa, resep (struktur sesuai model di atas). Backend:

- Jika belum ada rekam medis untuk `kunjungan_id` → create dengan status Draft.
- Jika sudah ada dan status Draft → update.
- Jika sudah Final → return 403 atau 400.

**Response (200/201):** Objek rekam medis terbaru.

---

### 3.4 Update partial (opsional, untuk real-time save)

Jika frontend menyimpan per section:

- `PATCH /api/rekam-medis/kunjungan/:kunjunganId/soap` — body: SOAP
- `PATCH /api/rekam-medis/kunjungan/:kunjunganId/ttv` — body: TTV
- `PUT /api/rekam-medis/kunjungan/:kunjunganId/diagnosa` — body: array ICD
- `PUT /api/rekam-medis/kunjungan/:kunjunganId/resep` — body: array item resep

---

### 3.5 Finalisasi rekam medis

```http
POST /api/rekam-medis/kunjungan/:kunjunganId/finalize
```

**Validasi backend:** Minimal satu diagnosa, SOAP Assessment dan Subjective terisi (sesuai aturan frontend).

**Response (200):** Status rekam medis berubah menjadi `Final`.

**Response (400):** Validasi gagal (daftar error).

---

### 3.6 Tambah addendum (hanya jika status Final)

```http
POST /api/rekam-medis/kunjungan/:kunjunganId/addendum
Content-Type: application/json
```

**Body:**

```json
{
  "catatan": "Tambahan hasil lab tanggal ..."
}
```

**Response (201):** Objek addendum (id, catatan, timestamp, dokter/user).

---

### 3.7 Kirim resep ke farmasi (opsional)

```http
POST /api/rekam-medis/kunjungan/:kunjunganId/resep/send
```

**Response (200):** `resep_status` berubah menjadi Sent (dan bisa muncul di antrian Modul Resep).

---

## 4. Validasi & Aturan Bisnis

- Satu kunjungan = satu rekam medis (1:1).
- Setelah **Final**, hanya addendum dan (jika ada) kirim resep yang boleh; SOAP/TTV/Diagnosa/Resep tidak boleh diubah.
- **Alergi** tidak disimpan di rekam medis; selalu ambil dari master Pasien (via `pasien_id` dari kunjungan). Frontend menampilkan dan memvalidasi resep terhadap alergi di sisi client; backend bisa menambah validasi saat simpan resep.
- Diagnosa: kode ICD-10 bisa divalidasi terhadap master/referensi ICD-10.

---

## 5. Integrasi dengan Modul Lain

- **Kunjungan:** rekam medis selalu punya `kunjungan_id`; data kunjungan (poli, dokter, tanggal) bisa ditampilkan di header.
- **Pasien:** data pasien (termasuk `allergies`) diambil dari Pasien by `pasien_id` dari kunjungan.
- **Resep (antrian farmasi):** ketika resep dikirim, entri antrian resep bisa dibuat dengan referensi ke `kunjungan_id` / `rekam_medis_id` dan detail item resep.

---

## 6. Referensi ICD-10 (Diagnosa)

Frontend saat ini memakai mock search ICD-10. Backend bisa:

- Menyediakan `GET /api/icd10?q=...` untuk autocomplete, atau
- Hanya menyimpan `code` + `name` yang dikirim frontend dan validasi opsional.

---

## 7. Nama File Panduan

`apiguide_modul_rekam_medis.md`

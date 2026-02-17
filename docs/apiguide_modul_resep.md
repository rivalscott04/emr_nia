# Panduan Backend API — Modul Resep (Farmasi / E-Resep)

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Resep** (antrian farmasi) pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Antrian resep dari poli untuk diproses/dispensing di farmasi. Status: Waiting → Processed → Done.
- **Alur:** Resep dibuat di Rekam Medis → dikirim (send) → muncul di antrian Resep → farmasi memproses dan menandai selesai.
- **Route frontend:** `/resep`.

---

## 2. Model Data

### Antrian Resep (queue item)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | string | PK (bisa sama dengan no_resep atau ID unik) |
| `kunjungan_id` | string | FK ke Kunjungan (sumber resep) |
| `rekam_medis_id` | string | Opsional; FK ke Rekam Medis |
| `no_resep` | string | Nomor resep (unik, bisa auto-generate) |
| `pasien` / `pasien_nama` | string | Nama pasien (denormalisasi) |
| `dokter` / `dokter_nama` | string | Nama dokter |
| `waktu` | string | Waktu masuk antrian (ISO datetime atau time) |
| `status` | string | Waiting \| Processed \| Done |
| `items` | array | Opsional; detail item resep (nama_obat, jumlah, aturan_pakai) |

---

## 3. Endpoint yang Diperlukan

### 3.1 Daftar antrian resep

```http
GET /api/resep/antrian
```

**Query (opsional):**

- `status` — Waiting, Processed, Done
- `tanggal` — filter per tanggal
- `page`, `limit` — paginasi

**Response (200):**

```json
{
  "data": [
    {
      "id": "1",
      "no_resep": "R-001",
      "kunjungan_id": "K-001",
      "waktu": "10:30",
      "pasien": "Budi Santoso",
      "dokter": "dr. Andi",
      "status": "Waiting",
      "items": [
        { "nama_obat": "Paracetamol 500mg", "jumlah": "30 tablet", "aturan_pakai": "3x1" }
      ]
    }
  ],
  "total": 1
}
```

---

### 3.2 Detail satu resep (untuk modal / halaman proses)

```http
GET /api/resep/:id
```

**Response (200):** Satu entri antrian resep beserta item resep lengkap, data pasien (nama, no_rm, alergi), dan dokter.

**Response (404):** Resep tidak ditemukan.

---

### 3.3 Update status (proses / selesai)

```http
PATCH /api/resep/:id
Content-Type: application/json
```

**Body:**

```json
{
  "status": "Processed"
}
```

atau `"Done"` ketika obat sudah diberikan.

**Response (200):** Objek resep terbaru.

**Response (400/409):** Status tidak valid atau sudah final.

---

### 3.4 Sumber data antrian

Entri antrian resep biasanya **dibuat oleh backend** saat:

- Rekam Medis memanggil **kirim resep** (mis. `POST /api/rekam-medis/kunjungan/:kunjunganId/resep/send`), atau
- Saat rekam medis difinalisasi dan ada item resep.

Backend Rekam Medis / Resep perlu membuat record di tabel/collection antrian resep dengan status `Waiting`, dan mengisi `no_resep`, `pasien`, `dokter`, `waktu`, serta detail item dari rekam medis.

---

## 4. Validasi & Aturan Bisnis

- `no_resep` unik.
- Status flow: Waiting → Processed → Done (jangan mundur).
- Item resep sebaiknya disimpan lengkap (nama_obat, jumlah, aturan_pakai) agar tidak bergantung lagi ke draft rekam medis.

---

## 5. Integrasi dengan Modul Lain

- **Rekam Medis:** sumber resep; saat "kirim resep" atau finalisasi, backend membuat/mengupdate entri antrian resep.
- **Pasien:** alergi pasien ditampilkan di detail resep (read-only dari master Pasien) untuk peringatan saat dispensing.

---

## 6. Nama File Panduan

`apiguide_modul_resep.md`

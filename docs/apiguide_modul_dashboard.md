# Panduan Backend API — Modul Dashboard

Dokumen ini menjadi acuan implementasi backend API untuk **Modul Dashboard** pada sistem EMR Nia.

---

## 1. Ringkasan Modul

- **Fungsi:** Ringkasan statistik dan grafik untuk tampilan awal setelah login (total pasien hari ini, kunjungan, resep, tindakan; top diagnosa; top obat).
- **Route frontend:** `/dashboard`.

---

## 2. Data yang Ditampilkan (Saat Ini di Frontend)

- **Total Pasien Hari Ini** — count pasien yang berkunjung hari ini (atau pasien terdaftar hari ini, sesuai definisi).
- **Total Kunjungan** — count kunjungan (dengan deskripsi perbandingan, mis. +10% minggu lalu).
- **Resep Keluar** — count resep (dengan info tebus obat % jika ada).
- **Tindakan Medis** — count tindakan (dengan deskripsi).
- **Top Diagnosa** — list diagnosa (nama + kode ICD) dengan jumlah kasus.
- **Top Obat** — list obat dengan jumlah (pcs/tablet) keluar.

---

## 3. Endpoint yang Diperlukan

### 3.1 Ringkasan dashboard (satu endpoint agregat)

```http
GET /api/dashboard/summary
```

**Query (opsional):** `tanggal` (untuk hari tertentu, default hari ini), `periode` (hari/minggu/bulan).

**Response (200):**

```json
{
  "stats": {
    "total_pasien_hari_ini": 12,
    "total_kunjungan": 45,
    "total_kunjungan_kemarin": 40,
    "resep_keluar": 32,
    "resep_tebus_count": 27,
    "tindakan_medis": 8
  },
  "top_diagnosa": [
    { "name": "Hipertensi Esensial (I10)", "code": "I10", "count": 45 },
    { "name": "ISPA (J06.9)", "code": "J06.9", "count": 32 }
  ],
  "top_obat": [
    { "name": "Paracetamol 500mg", "count": 120 },
    { "name": "Amoxicillin 500mg", "count": 85 }
  ]
}
```

Frontend bisa menghitung persen (mis. +2 dari kemarin, +10% minggu lalu) dari nilai `stats` jika backend menyediakan angka pembanding, atau backend mengembalikan langsung field seperti `total_kunjungan_percent_change`.

---

### 3.2 Alternatif: endpoint terpisah per widget

- `GET /api/dashboard/stats?tanggal=...` — hanya angka statistik.
- `GET /api/dashboard/top-diagnosa?limit=5&tanggal=...` — top diagnosa.
- `GET /api/dashboard/top-obat?limit=5&tanggal=...` — top obat.

Pilih salah satu pola (satu agregat vs beberapa endpoint) sesuai kemudahan backend dan caching.

---

## 4. Sumber Data (Backend)

- **Pasien hari ini:** count dari Kunjungan/Pasien dengan filter tanggal.
- **Kunjungan:** count dari tabel Kunjungan (filter tanggal/period).
- **Resep:** count dari antrian Resep atau dari Rekam Medis yang punya resep.
- **Tindakan:** count dari detail tindakan per kunjungan (jika ada tabel transaksi tindakan).
- **Top diagnosa:** agregasi dari Rekam Medis (diagnosa) group by kode ICD, order by count desc.
- **Top obat:** agregasi dari item resep (nama_obat, sum jumlah) order by count desc.

---

## 5. Validasi & Opsi

- Semua nilai count >= 0.
- Batasi `limit` untuk top list (mis. 5–10).
- Filter tanggal/timezone konsisten (server timezone atau kirim timezone dari client).

---

## 6. Nama File Panduan

`apiguide_modul_dashboard.md`

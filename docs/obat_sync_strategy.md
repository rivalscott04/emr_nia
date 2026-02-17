# Strategi Sinkronisasi Data Obat (Mirror Lokal)

Dokumen ini menjelaskan strategi sinkronisasi data obat dari API eksternal farmasi ke sistem EMR Nia agar pencarian obat cepat, stabil, dan audit-friendly.

## 1. Tujuan

- Menjamin autocomplete obat di modul resep tetap cepat walau data besar.
- Mengurangi ketergantungan langsung ke endpoint eksternal saat user mengetik.
- Menyediakan fallback saat API farmasi lambat/down.
- Menyediakan jejak sinkronisasi untuk monitoring dan audit.

## 2. Prinsip Arsitektur

- **Source of truth eksternal:** API farmasi.
- **Read model internal:** tabel mirror lokal untuk kebutuhan query cepat.
- **Sync berkala:** job terjadwal menarik data terbaru dari API farmasi.
- **Fallback terkontrol:** jika sync gagal, sistem tetap pakai data mirror terakhir dengan status stale.

## 3. Skema Data Mirror (Usulan)

Tabel: `master_obat_mirror`

Kolom minimum:

- `id` (PK internal)
- `external_noindex` (unique, dari `NOINDEX`)
- `kode` (index, dari `KODE`)
- `nama` (index full/like, dari `NAMA`)
- `nama_kelompok` (dari `NAMA_KELOMPOK`)
- `kode_satuan` (dari `KODE_SATUAN`)
- `harga_jual` (decimal)
- `stok` (decimal/int)
- `raw_payload` (json, opsional untuk debugging)
- `synced_at` (datetime, kapan row terakhir diperbarui)
- `created_at`, `updated_at`

Tabel tambahan monitoring: `obat_sync_logs`

- `id`
- `started_at`, `finished_at`
- `status` (`success` | `partial` | `failed`)
- `total_fetched`
- `total_inserted`
- `total_updated`
- `total_skipped`
- `error_message` (nullable)

## 4. Mapping Field API Eksternal

Contoh field dari API farmasi (`getbarangnia.json`) ke mirror:

- `NOINDEX` -> `external_noindex`
- `KODE` -> `kode`
- `NAMA` -> `nama`
- `NAMA_KELOMPOK` -> `nama_kelompok`
- `KODE_SATUAN` -> `kode_satuan`
- `HARGA_JUAL` -> `harga_jual`
- `STOK` -> `stok`

## 5. Alur Sinkronisasi

1. Scheduler memicu job sync (mis. tiap 10 menit).
2. Job hit endpoint farmasi dan ambil payload obat.
3. Validasi struktur response (`status`, `data[]`).
4. Lakukan upsert ke `master_obat_mirror` berdasarkan `external_noindex` (atau `kode` jika lebih stabil).
5. Simpan hasil proses ke `obat_sync_logs`.
6. Update metadata global sync (mis. `last_success_sync_at`).

## 6. Strategi Query untuk Autocomplete

Endpoint internal EMR (disarankan):

- `GET /api/obat/search?q=...&limit=20`

Perilaku:

- Query ke tabel mirror lokal, bukan langsung ke API farmasi.
- Pencarian di `nama` dan `kode`.
- Minimum karakter query: 2.
- Batasi hasil default 20 item.
- Sort prioritas:
  - prefix match `nama`
  - lalu prefix match `kode`
  - lalu contains match

## 7. Fallback dan Reliability

- Jika sync gagal, aplikasi tetap gunakan data mirror terakhir.
- UI dapat menampilkan label `Data obat terakhir sync: <timestamp>`.
- Jika `last_success_sync_at` melewati SLA (mis. >24 jam), tandai warning untuk admin.

## 8. Security dan Konfigurasi

Simpan konfigurasi endpoint eksternal di environment:

- `FARMASI_API_BASE_URL`
- `FARMASI_API_TOKEN` (jika dibutuhkan)
- `FARMASI_API_TIMEOUT_MS`

Catatan:

- Jangan expose token farmasi ke frontend.
- Selalu panggil API farmasi dari backend.

## 9. Rencana Implementasi Bertahap

Tahap 1:

- Buat migrasi tabel `master_obat_mirror` dan `obat_sync_logs`.
- Buat service sinkronisasi + command artisan/manual trigger.

Tahap 2:

- Tambahkan scheduler otomatis (cron Laravel).
- Tambahkan endpoint internal `GET /api/obat/search`.

Tahap 3:

- Pindahkan frontend autocomplete obat ke endpoint internal EMR.
- Tambahkan indikator status sync di UI admin (opsional).

## 10. Keputusan Operasional (Disepakati)

- Pendekatan yang dipakai: **hybrid mirror + sync berkala**.
- Bukan hit langsung endpoint farmasi pada setiap input user.
- Frontend tetap cepat, backend tetap resilient, dan integrasi lebih aman untuk production.


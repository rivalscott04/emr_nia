# Dokumentasi EMR Nia

## Panduan Backend API per Modul

Berikut daftar file panduan penerapan backend API berdasarkan alur sistem yang ada:

| Nama File | Modul | Keterangan Singkat |
|-----------|--------|---------------------|
| [apiguide_modul_pasien.md](./apiguide_modul_pasien.md) | **Pasien** | Master pasien, registrasi, alergi (sumber data alergi untuk Rekam Medis) |
| [apiguide_modul_kunjungan.md](./apiguide_modul_kunjungan.md) | **Kunjungan** | Data kunjungan, buat kunjungan, link ke Rekam Medis |
| [apiguide_modul_rekam_medis.md](./apiguide_modul_rekam_medis.md) | **Rekam Medis** | SOAP, TTV, Diagnosa ICD-10, Resep, Finalisasi, Addendum |
| [apiguide_modul_resep.md](./apiguide_modul_resep.md) | **Resep** | Antrian farmasi / E-Resep (Waiting → Processed → Done) |
| [apiguide_modul_tindakan.md](./apiguide_modul_tindakan.md) | **Tindakan** | Master tindakan medis (kode, nama, kategori, tarif) |
| [apiguide_modul_auth.md](./apiguide_modul_auth.md) | **Auth** | Login, token, logout, me |
| [apiguide_modul_dashboard.md](./apiguide_modul_dashboard.md) | **Dashboard** | Statistik & ringkasan (pasien, kunjungan, resep, top diagnosa/obat) |
| [apiguide_modul_settings.md](./apiguide_modul_settings.md) | **Settings** | Info klinik, manajemen user |

Gunakan masing-masing file sebagai acuan saat mengimplementasikan endpoint backend untuk modul yang bersangkutan.

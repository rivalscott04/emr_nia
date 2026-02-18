<?php

namespace Database\Seeders;

use App\Models\Tindakan;
use Illuminate\Database\Seeder;

/**
 * Tindakan medis standar untuk klinik umum dan rumah sakit.
 * Mengacu ICD-9-CM (procedure codes) dan praktik umum di Indonesia.
 */
class TindakanSeeder extends Seeder
{
    /**
     * @return list<array{kode: string, nama: string, kategori: string, tarif: int}>
     */
    public function getTindakanList(): array
    {
        return [
            // === Umum / Konsultasi ===
            ['kode' => '89.03', 'nama' => 'Konsultasi dokter umum', 'kategori' => 'Umum', 'tarif' => 75000],
            ['kode' => '89.04', 'nama' => 'Konsultasi dokter spesialis', 'kategori' => 'Umum', 'tarif' => 150000],
            ['kode' => '89.52', 'nama' => 'EKG (Elektrokardiogram)', 'kategori' => 'Umum', 'tarif' => 85000],
            ['kode' => '89.38', 'nama' => 'Spirometri (uji fungsi paru)', 'kategori' => 'Umum', 'tarif' => 120000],
            ['kode' => '93.99', 'nama' => 'Nebulizer / Terapi inhalasi', 'kategori' => 'Umum', 'tarif' => 50000],
            ['kode' => '99.21', 'nama' => 'Suntik antibiotik (IM/IV)', 'kategori' => 'Umum', 'tarif' => 35000],
            ['kode' => '99.22', 'nama' => 'Suntik vitamin / tonik', 'kategori' => 'Umum', 'tarif' => 25000],
            ['kode' => '99.04', 'nama' => 'Transfusi PRC (packed red cells)', 'kategori' => 'Umum', 'tarif' => 150000],
            ['kode' => '38.93', 'nama' => 'Pemasangan infus', 'kategori' => 'Umum', 'tarif' => 75000],
            ['kode' => '96.04', 'nama' => 'Intubasi endotrakeal', 'kategori' => 'Gawat Darurat', 'tarif' => 200000],
            ['kode' => '96.07', 'nama' => 'Pemasangan NGT (nasogastric tube)', 'kategori' => 'Umum', 'tarif' => 65000],
            ['kode' => '57.94', 'nama' => 'Kateter urine (pemasangan)', 'kategori' => 'Umum', 'tarif' => 55000],
            ['kode' => '86.22', 'nama' => 'Debridemen luka', 'kategori' => 'Bedah Minor', 'tarif' => 100000],
            ['kode' => '86.59', 'nama' => 'Jahit luka / Sutur', 'kategori' => 'Bedah Minor', 'tarif' => 125000],
            ['kode' => '86.3', 'nama' => 'Eksisi lesi kulit (minor)', 'kategori' => 'Bedah Minor', 'tarif' => 150000],
            ['kode' => '99.15', 'nama' => 'Injeksi anestesi lokal', 'kategori' => 'Bedah Minor', 'tarif' => 30000],
            // === Gigi ===
            ['kode' => '23.2', 'nama' => 'Tambal gigi (restorasi)', 'kategori' => 'Gigi', 'tarif' => 150000],
            ['kode' => '23.09', 'nama' => 'Pencabutan gigi sulung', 'kategori' => 'Gigi', 'tarif' => 100000],
            ['kode' => '23.11', 'nama' => 'Pencabutan gigi permanen', 'kategori' => 'Gigi', 'tarif' => 125000],
            ['kode' => '23.01', 'nama' => 'Scaling / pembersihan karang gigi', 'kategori' => 'Gigi', 'tarif' => 200000],
            ['kode' => '23.72', 'nama' => 'Perawatan saluran akar (pulpitis)', 'kategori' => 'Gigi', 'tarif' => 350000],
            ['kode' => '96.54', 'nama' => 'Pembersihan gigi dan mulut', 'kategori' => 'Gigi', 'tarif' => 75000],
            // === KIA (Kesehatan Ibu dan Anak) ===
            ['kode' => '74.1', 'nama' => 'Persalinan pervaginam (normal)', 'kategori' => 'KIA', 'tarif' => 750000],
            ['kode' => '74.0', 'nama' => 'Seksio sesarea (operasi Caesar)', 'kategori' => 'KIA', 'tarif' => 2500000],
            ['kode' => '75.0', 'nama' => 'Pertolongan persalinan dengan vakum', 'kategori' => 'KIA', 'tarif' => 350000],
            ['kode' => '73.22', 'nama' => 'Induksi persalinan', 'kategori' => 'KIA', 'tarif' => 150000],
            ['kode' => '73.4', 'nama' => 'Episiotomi dan perbaikan', 'kategori' => 'KIA', 'tarif' => 200000],
            ['kode' => '99.92', 'nama' => 'Fototerapi neonatus (kuning)', 'kategori' => 'KIA', 'tarif' => 150000],
            ['kode' => '88.74', 'nama' => 'USG obstetri / kehamilan', 'kategori' => 'KIA', 'tarif' => 200000],
            // === Lab ===
            ['kode' => '99.71', 'nama' => 'Pemeriksaan darah lengkap (LED, Hb, leukosit, trombosit)', 'kategori' => 'Lab', 'tarif' => 75000],
            ['kode' => '99.72', 'nama' => 'Pemeriksaan gula darah', 'kategori' => 'Lab', 'tarif' => 35000],
            ['kode' => '99.73', 'nama' => 'Profil lipid (kolesterol, LDL, HDL, trigliserida)', 'kategori' => 'Lab', 'tarif' => 100000],
            ['kode' => '99.74', 'nama' => 'Pemeriksaan fungsi ginjal (ureum, kreatinin)', 'kategori' => 'Lab', 'tarif' => 65000],
            ['kode' => '99.75', 'nama' => 'Pemeriksaan fungsi hati (SGOT, SGPT)', 'kategori' => 'Lab', 'tarif' => 65000],
            ['kode' => '99.76', 'nama' => 'Urinalisis lengkap', 'kategori' => 'Lab', 'tarif' => 40000],
            ['kode' => '99.77', 'nama' => 'Pemeriksaan kehamilan (HCG)', 'kategori' => 'Lab', 'tarif' => 50000],
            ['kode' => '99.78', 'nama' => 'Pemeriksaan COVID-19 (rapid/PCR)', 'kategori' => 'Lab', 'tarif' => 150000],
            // === Radiologi ===
            ['kode' => '87.03', 'nama' => 'CT scan kepala', 'kategori' => 'Radiologi', 'tarif' => 650000],
            ['kode' => '88.76', 'nama' => 'USG abdomen', 'kategori' => 'Radiologi', 'tarif' => 175000],
            ['kode' => '88.72', 'nama' => 'USG abdomen lengkap', 'kategori' => 'Radiologi', 'tarif' => 225000],
            ['kode' => '88.74', 'nama' => 'USG obstetri', 'kategori' => 'Radiologi', 'tarif' => 200000],
            ['kode' => '87.41', 'nama' => 'Foto thorax (rontgen dada)', 'kategori' => 'Radiologi', 'tarif' => 125000],
            ['kode' => '88.01', 'nama' => 'Foto abdomen', 'kategori' => 'Radiologi', 'tarif' => 100000],
            ['kode' => '88.38', 'nama' => 'Foto tulang / ekstremitas', 'kategori' => 'Radiologi', 'tarif' => 100000],
            // === Fisioterapi ===
            ['kode' => '93.12', 'nama' => 'Fisioterapi (sesi)', 'kategori' => 'Fisioterapi', 'tarif' => 100000],
            ['kode' => '93.14', 'nama' => 'Terapi listrik (TENS, dll)', 'kategori' => 'Fisioterapi', 'tarif' => 75000],
            ['kode' => '93.16', 'nama' => 'Terapi latihan / exercise therapy', 'kategori' => 'Fisioterapi', 'tarif' => 85000],
            // === Gawat Darurat ===
            ['kode' => '99.60', 'nama' => 'Resusitasi jantung paru (RJP)', 'kategori' => 'Gawat Darurat', 'tarif' => 250000],
            ['kode' => '99.62', 'nama' => 'Defibrilasi', 'kategori' => 'Gawat Darurat', 'tarif' => 300000],
            ['kode' => '96.05', 'nama' => 'Trakeostomi (emergency)', 'kategori' => 'Gawat Darurat', 'tarif' => 500000],
            // === Lain-lain ===
            ['kode' => '96.6', 'nama' => 'Pemasangan gips', 'kategori' => 'Lain-lain', 'tarif' => 150000],
            ['kode' => '93.59', 'nama' => 'Terapi oksigen (per jam)', 'kategori' => 'Lain-lain', 'tarif' => 50000],
            ['kode' => '89.07', 'nama' => 'Visite rawat inap (per visit)', 'kategori' => 'Lain-lain', 'tarif' => 75000],
        ];
    }

    public function run(): void
    {
        foreach ($this->getTindakanList() as $item) {
            Tindakan::query()->updateOrCreate(
                ['kode' => $item['kode']],
                [
                    'nama' => $item['nama'],
                    'kategori' => $item['kategori'],
                    'tarif' => $item['tarif'],
                    'is_active' => true,
                ]
            );
        }
    }
}

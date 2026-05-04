<?php

namespace Database\Seeders;

use App\Models\Tindakan;
use Illuminate\Database\Seeder;

/**
 * Master tindakan diselaraskan dengan poli aktif (nama poli = kategori).
 * Tarif dalam Rupiah (IDR).
 */
class TindakanSeeder extends Seeder
{
    /**
     * @return list<array{kode: string, nama: string, kategori: string, tarif: int}>
     */
    public function getTindakanList(): array
    {
        $obgyn = 'Obstetri & Ginekologi';
        $onko = 'Bedah Onkologi';

        return [
            // --- Obstetri & Ginekologi ---
            ['kode' => '89.04', 'nama' => 'Konsultasi dokter spesialis Obstetri & Ginekologi', 'kategori' => $obgyn, 'tarif' => 160000],
            ['kode' => '88.74', 'nama' => 'USG 2D obstetri / kehamilan', 'kategori' => $obgyn, 'tarif' => 160000],
            ['kode' => '88.78', 'nama' => 'USG Doppler obstetri', 'kategori' => $obgyn, 'tarif' => 250000],
            ['kode' => '88.79', 'nama' => 'USG transvaginal / pelvis', 'kategori' => $obgyn, 'tarif' => 200000],
            ['kode' => '74.1', 'nama' => 'Persalinan pervaginam (normal)', 'kategori' => $obgyn, 'tarif' => 750000],
            ['kode' => '74.0', 'nama' => 'Seksio sesarea (operasi Caesar)', 'kategori' => $obgyn, 'tarif' => 2500000],
            ['kode' => '75.0', 'nama' => 'Pertolongan persalinan dengan vakum', 'kategori' => $obgyn, 'tarif' => 350000],
            ['kode' => '73.22', 'nama' => 'Induksi persalinan', 'kategori' => $obgyn, 'tarif' => 150000],
            ['kode' => '73.4', 'nama' => 'Episiotomi dan perbaikan', 'kategori' => $obgyn, 'tarif' => 200000],
            ['kode' => '69.02', 'nama' => 'Insersi IUD (AKDR)', 'kategori' => $obgyn, 'tarif' => 500000],
            ['kode' => '69.01', 'nama' => 'Pap smear / IVA', 'kategori' => $obgyn, 'tarif' => 100000],
            ['kode' => '99.92', 'nama' => 'Fototerapi neonatus (hiperbilirubin)', 'kategori' => $obgyn, 'tarif' => 150000],

            // --- Bedah Onkologi ---
            ['kode' => '89.09', 'nama' => 'Konsultasi dokter spesialis bedah onkologi', 'kategori' => $onko, 'tarif' => 200000],
            ['kode' => '83.22', 'nama' => 'Biopsi jaringan lunak / dalam (minor)', 'kategori' => $onko, 'tarif' => 450000],
            ['kode' => '86.3', 'nama' => 'Eksisi lesi kulit / jaringan superfisial (bedah minor)', 'kategori' => $onko, 'tarif' => 1200000],
            ['kode' => '99.25', 'nama' => 'Kemoterapi sistemik (infus IV, per sesi)', 'kategori' => $onko, 'tarif' => 800000],
            ['kode' => '54.21', 'nama' => 'Laparoskopi diagnostik / staging', 'kategori' => $onko, 'tarif' => 1800000],
            ['kode' => '40.11', 'nama' => 'Biopsi kelenjar getah bening (sentinel / selective)', 'kategori' => $onko, 'tarif' => 2000000],
            ['kode' => '85.21', 'nama' => 'Bedah konserving payudara (lumpectomy)', 'kategori' => $onko, 'tarif' => 3500000],
            ['kode' => '85.41', 'nama' => 'Mastektomi unilateral', 'kategori' => $onko, 'tarif' => 5000000],
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

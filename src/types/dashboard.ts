export interface DashboardStats {
    total_pasien_hari_ini: number
    total_kunjungan: number
    total_kunjungan_kemarin: number
    total_kunjungan_minggu_ini?: number
    resep_keluar: number
    resep_tebus_count: number
    tindakan_medis: number
}

export interface DashboardDiagnosaItem {
    code: string
    name: string
    count: number
}

export interface DashboardObatItem {
    name: string
    count: number
}

export interface DashboardSummary {
    stats: DashboardStats
    top_diagnosa: DashboardDiagnosaItem[]
    top_obat: DashboardObatItem[]
}


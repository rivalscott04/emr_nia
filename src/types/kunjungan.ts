export type KunjunganStatus = "OPEN" | "COMPLETED" | "CANCELLED"

export interface Kunjungan {
    id: string
    pasien_id: string
    pasien_nama: string // Joined data for display
    dokter_id: string
    dokter_nama: string
    poli: string
    tanggal: string
    keluhan_utama: string
    status: KunjunganStatus
    created_at: string
}

export interface KunjunganInput {
    pasien_id: string
    dokter_id: string
    poli: string
    keluhan_utama: string
}

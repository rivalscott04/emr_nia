export type ResepStatusFarmasi = "Waiting" | "Processed" | "Done"

export interface ResepAntrianItem {
    id: string
    no_resep: string
    kunjungan_id: string
    waktu: string | null
    pasien: string
    dokter: string
    status: ResepStatusFarmasi
    items: Array<{
        nama_obat: string
        jumlah: string
        aturan_pakai: string
    }>
    farmasi_done_at?: string | null
    farmasi_done_by?: string | null
}

export interface ResepDetailFarmasi {
    id: string
    no_resep: string
    kunjungan_id: string
    resep_status: string
    status: ResepStatusFarmasi
    waktu: string | null
    tanggal: string | null
    pasien: {
        id: string
        nama: string
        no_rm: string
        allergies: string[]
    }
    dokter: string
    items: Array<{
        id: string
        nama_obat: string
        jumlah: string
        aturan_pakai: string
    }>
    farmasi_done_at: string | null
    farmasi_done_by: string | null
}

export interface ResepAntrianListResponse {
    data: ResepAntrianItem[]
    total: number
}

export interface ResepRiwayatListResponse {
    data: ResepAntrianItem[]
    total: number
}

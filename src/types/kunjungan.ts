export type KunjunganStatus = "OPEN" | "SEDANG_DIPERIKSA" | "COMPLETED" | "CANCELLED"

/** Label status untuk tampilan (admin: ubah status; dokter: filter). */
export const KUNJUNGAN_STATUS_LABELS: Record<KunjunganStatus, string> = {
    OPEN: "Menunggu",
    SEDANG_DIPERIKSA: "Sedang Diperiksa",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
}

/** TTV yang diinput di menu kunjungan; ditampilkan di Objektif rekam medis */
export interface KunjunganTTV {
    td_sistole: number | null
    td_diastole: number | null
    berat_badan: number | null
    tinggi_badan: number | null
}

/** Data obstetri (KIA/OBGYN): HPHT, HTP, G-P-A + Form Hidup */
export interface KunjunganObstetri {
    hpht?: string | null
    htp?: string | null
    gravida?: number | null
    para?: number | null
    form_hidup?: number | null
    abortus?: number | null
}

export interface Kunjungan extends KunjunganObstetri {
    id: string
    pasien_id: string
    pasien_nama: string // Joined data for display
    dokter_id: string
    dokter_nama: string
    poli: string
    /** Kunjungan ke berapa (pasien + poli), untuk riwayat rutin mis. ANC. */
    kunjungan_ke?: number | null
    /** Dari master poli; true = tampilkan blok data obstetri di detail. */
    supports_obstetri?: boolean
    tanggal: string
    keluhan_utama: string
    td_sistole?: number | null
    td_diastole?: number | null
    berat_badan?: number | null
    tinggi_badan?: number | null
    status: KunjunganStatus
    created_at: string
}

export interface KunjunganInput extends KunjunganObstetri {
    pasien_id: string
    dokter_id: string
    poli: string
    keluhan_utama: string
    td_sistole?: number | null
    td_diastole?: number | null
    berat_badan?: number | null
    tinggi_badan?: number | null
}

export interface DokterOption {
    id: string
    nama: string
    poli: string
}

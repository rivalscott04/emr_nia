export type RekamMedisStatus = "Draft" | "Final"
export type ResepStatus = "Draft" | "Sent" | "Dispensed"

export interface SOAPData {
    subjective: string
    objective: string
    assessment: string
    plan: string
    instruksi: string
}

export interface TTVData {
    sistole: number | null
    diastole: number | null
    nadi: number | null
    rr: number | null
    suhu: number | null
    spo2: number | null
    berat_badan: number | null
    tinggi_badan: number | null
}

export type DiagnosaType = "ICD-10" | "ICD-9"

export interface DiagnosaItem {
    code: string
    name: string
    type?: DiagnosaType
    is_utama?: boolean
}

export interface ResepItem {
    id: string
    nama_obat: string
    jumlah: string
    aturan_pakai: string
}

export interface AddendumItem {
    id: string
    catatan: string
    timestamp: string
    dokter: string
}

export interface RekamMedisPatient {
    id?: string
    nama: string
    umur: string
    jenis_kelamin: string
    no_rm: string
    allergies: string[]
}

export interface RekamMedisDetail {
    id: string
    kunjungan_id: string
    status: RekamMedisStatus
    resep_status: ResepStatus
    patient: RekamMedisPatient
    soap: SOAPData
    ttv: TTVData
    diagnosa: DiagnosaItem[]
    resep: ResepItem[]
    addendums: AddendumItem[]
}

export interface RekamMedisListItem {
    id: string
    kunjungan_id: string
    tanggal: string
    pasien_nama: string
    no_rm: string
    diagnosa_utama: string
    dokter: string
    status: RekamMedisStatus
}

export interface RekamMedisUpsertPayload {
    soap: SOAPData
    ttv: TTVData
    diagnosa: Array<{
        code: string
        name: string
        is_utama?: boolean
    }>
    resep: Array<{
        nama_obat: string
        jumlah: string
        aturan_pakai: string
    }>
}


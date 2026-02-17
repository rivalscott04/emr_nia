export interface Pasien {
    id: string
    nik: string
    no_rm: string
    nama: string
    tanggal_lahir: string // ISO Date string
    jenis_kelamin: "L" | "P"
    alamat: string
    no_hp: string
    golongan_darah?: string
    pekerjaan?: string
    status_pernikahan?: "Belum Menikah" | "Menikah" | "Cerai"
    nama_ibu_kandung?: string
    /** Daftar alergi (obat/bahan) — diisi di Profil Pasien, dipakai di Rekam Medis */
    allergies?: string[]
    created_at: string
    updated_at: string
}

export interface PasienInput {
    nik: string
    nama: string
    tanggal_lahir: string
    jenis_kelamin: "L" | "P"
    alamat: string
    no_hp: string
}

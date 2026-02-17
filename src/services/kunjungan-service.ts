import type { Kunjungan, KunjunganInput } from "../types/kunjungan"

const MOCK_KUNJUNGAN: Kunjungan[] = [
    {
        id: "K-001",
        pasien_id: "1",
        pasien_nama: "Budi Santoso",
        dokter_id: "D-01",
        dokter_nama: "dr. Andi",
        poli: "Umum",
        tanggal: new Date().toISOString(),
        keluhan_utama: "Demam dan batuk",
        status: "OPEN",
        created_at: new Date().toISOString(),
    },
]

export const KunjunganService = {
    getAll: async (): Promise<Kunjungan[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_KUNJUNGAN
    },

    create: async (data: KunjunganInput): Promise<Kunjungan> => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newKunjungan: Kunjungan = {
            ...data,
            id: `K-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            pasien_nama: "Pasien Dummy", // In real app, fetch patient name
            dokter_nama: "dr. Dummy",
            status: "OPEN",
            tanggal: new Date().toISOString(),
            created_at: new Date().toISOString(),
        }
        MOCK_KUNJUNGAN.push(newKunjungan)
        return newKunjungan
    },

    getById: async (id: string): Promise<Kunjungan | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_KUNJUNGAN.find((k) => k.id === id)
    },
}

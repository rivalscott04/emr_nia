import type { Pasien, PasienInput } from "../types/pasien"

// Mock data
const MOCK_PASIEN: Pasien[] = [
    {
        id: "1",
        nik: "1234567890123456",
        no_rm: "RM-00001",
        nama: "Budi Santoso",
        tanggal_lahir: "1985-05-20",
        jenis_kelamin: "L",
        alamat: "Jl. Merdeka No. 10",
        no_hp: "081234567890",
        allergies: ["Amoxicillin", "Ibuprofen"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        nik: "6543210987654321",
        no_rm: "RM-00002",
        nama: "Siti Aminah",
        tanggal_lahir: "1990-11-15",
        jenis_kelamin: "P",
        alamat: "Jl. Sudirman No. 5",
        no_hp: "081987654321",
        allergies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
]

export const PasienService = {
    getAll: async (): Promise<Pasien[]> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_PASIEN
    },

    getById: async (id: string): Promise<Pasien | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_PASIEN.find((p) => p.id === id)
    },

    create: async (data: PasienInput): Promise<Pasien> => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newPasien: Pasien = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            no_rm: `RM-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        MOCK_PASIEN.push(newPasien)
        return newPasien
    },

    search: async (query: string): Promise<Pasien[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return MOCK_PASIEN.filter(
            (p) =>
                p.nama.toLowerCase().includes(query.toLowerCase()) ||
                p.nik.includes(query) ||
                p.no_rm.toLowerCase().includes(query.toLowerCase())
        )
    },

    /** Update daftar alergi pasien (sumber data untuk tampilan di Rekam Medis) */
    updateAllergies: async (pasienId: string, allergies: string[]): Promise<Pasien | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const idx = MOCK_PASIEN.findIndex((p) => p.id === pasienId)
        if (idx === -1) return undefined
        MOCK_PASIEN[idx] = {
            ...MOCK_PASIEN[idx],
            allergies: [...allergies],
            updated_at: new Date().toISOString(),
        }
        return MOCK_PASIEN[idx]
    },
}

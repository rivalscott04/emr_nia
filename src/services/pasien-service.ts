import { apiRequest } from "../lib/api-client"
import type { Pasien, PasienInput } from "../types/pasien"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const PasienService = {
    getAll: async (): Promise<Pasien[]> => {
        const data = await apiRequest<ListResponse<Pasien>>("/api/pasien?limit=100")
        return data.items
    },

    getById: async (id: string): Promise<Pasien | undefined> => {
        return apiRequest<Pasien>(`/api/pasien/${id}`)
    },

    create: async (data: PasienInput): Promise<Pasien> => {
        return apiRequest<Pasien>("/api/pasien", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    search: async (query: string): Promise<Pasien[]> => {
        const params = new URLSearchParams({ q: query, limit: "20" })
        const data = await apiRequest<ListResponse<Pasien>>(`/api/pasien/search?${params.toString()}`)
        return data.items
    },

    /** Update daftar alergi pasien (sumber data untuk tampilan di Rekam Medis) */
    updateAllergies: async (pasienId: string, allergies: string[]): Promise<Pasien | undefined> => {
        return apiRequest<Pasien>(`/api/pasien/${pasienId}/allergies`, {
            method: "PATCH",
            body: JSON.stringify({ allergies }),
        })
    },
}

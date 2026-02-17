import { apiRequest } from "../lib/api-client"
import type { Kunjungan, KunjunganInput, KunjunganStatus } from "../types/kunjungan"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const KunjunganService = {
    getAll: async (): Promise<Kunjungan[]> => {
        const data = await apiRequest<ListResponse<Kunjungan>>("/api/kunjungan?limit=100")
        return data.items
    },

    create: async (data: KunjunganInput): Promise<Kunjungan> => {
        return apiRequest<Kunjungan>("/api/kunjungan", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    getById: async (id: string): Promise<Kunjungan | undefined> => {
        return apiRequest<Kunjungan>(`/api/kunjungan/${id}`)
    },

    updateStatus: async (id: string, status: KunjunganStatus): Promise<Kunjungan> => {
        return apiRequest<Kunjungan>(`/api/kunjungan/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        })
    },
}

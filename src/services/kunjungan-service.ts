import { apiRequest } from "../lib/api-client"
import type { DokterOption, Kunjungan, KunjunganInput, KunjunganStatus } from "../types/kunjungan"

type ListResponse<T> = { items: T[]; total: number }

export type KunjunganListParams = {
    tanggal?: string
    status?: string
    limit?: number
    page?: number
}

export const KunjunganService = {
    getDokterOptions: async (): Promise<DokterOption[]> => {
        const data = await apiRequest<DokterOption[]>("/api/kunjungan/dokter-options")
        return Array.isArray(data) ? data : []
    },

    getAll: async (): Promise<Kunjungan[]> => {
        const data = await apiRequest<ListResponse<Kunjungan>>("/api/kunjungan?limit=100")
        return data.items
    },

    getList: async (params: KunjunganListParams = {}): Promise<{ items: Kunjungan[]; total: number }> => {
        const search = new URLSearchParams()
        if (params.tanggal) search.set("tanggal", params.tanggal)
        if (params.status) search.set("status", params.status)
        search.set("limit", String(params.limit ?? 10))
        if (params.page) search.set("page", String(params.page))
        const data = await apiRequest<ListResponse<Kunjungan>>(`/api/kunjungan?${search.toString()}`)
        return { items: data.items, total: data.total }
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

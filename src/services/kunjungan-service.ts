import { apiRequest } from "../lib/api-client"
import type { DokterOption, Kunjungan, KunjunganInput, KunjunganStatus } from "../types/kunjungan"
import type { MasterPoli } from "../types/superadmin"

export type KunjunganUpdatePayload = {
    status?: KunjunganStatus
    td_sistole?: number | null
    td_diastole?: number | null
    berat_badan?: number | null
    tinggi_badan?: number | null
    hpht?: string | null
    gravida?: number | null
    para?: number | null
    abortus?: number | null
}

type ListResponse<T> = { items: T[]; total: number }

export type KunjunganListParams = {
    pasien_id?: string
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

    /** Daftar poli aktif untuk dropdown + flag supports_obstetri (dinamis dari master poli). */
    getPoliOptions: async (): Promise<MasterPoli[]> => {
        const data = await apiRequest<MasterPoli[]>("/api/kunjungan/poli-options")
        return Array.isArray(data) ? data : []
    },

    getAll: async (): Promise<Kunjungan[]> => {
        const data = await apiRequest<ListResponse<Kunjungan>>("/api/kunjungan?limit=100")
        return data.items
    },

    getList: async (params: KunjunganListParams = {}): Promise<{ items: Kunjungan[]; total: number }> => {
        const search = new URLSearchParams()
        if (params.pasien_id) search.set("pasien_id", params.pasien_id)
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

    update: async (id: string, payload: KunjunganUpdatePayload): Promise<Kunjungan> => {
        return apiRequest<Kunjungan>(`/api/kunjungan/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },
}

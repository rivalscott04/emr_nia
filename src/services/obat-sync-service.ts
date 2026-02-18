import { apiRequest } from "../lib/api-client"

export type MasterObatItem = {
    id: number
    external_noindex: string
    kode: string
    nama: string
    nama_kelompok: string | null
    kode_satuan: string | null
    harga_jual: number | null
    stok: number | null
    synced_at: string | null
}

export type ObatSyncLogItem = {
    id: number
    started_at: string
    finished_at: string | null
    status: "success" | "failed" | "running"
    total_fetched: number
    total_inserted: number
    total_updated: number
    total_skipped: number
    message: string
}

type ObatSyncListResponse = {
    items: ObatSyncLogItem[]
    total: number
    current_page: number
    per_page: number
}

export type TriggerObatSyncCredentials = {
    username?: string
    password?: string
}

type MasterObatListResponse = {
    items: MasterObatItem[]
    total: number
    current_page: number
    per_page: number
}

export const ObatSyncService = {
    getLogs: async (): Promise<ObatSyncLogItem[]> => {
        const data = await apiRequest<ObatSyncListResponse>("/api/superadmin/obat-sync")
        return data.items ?? []
    },

    getMasterObat: async (params: {
        search?: string
        page?: number
        per_page?: number
    } = {}): Promise<MasterObatListResponse> => {
        const search = new URLSearchParams()
        if (params.search) search.set("search", params.search)
        if (params.page) search.set("page", String(params.page))
        if (params.per_page) search.set("per_page", String(params.per_page))
        return apiRequest<MasterObatListResponse>(
            `/api/superadmin/master-obat?${search.toString()}`
        )
    },

    triggerSync: async (
        credentials?: TriggerObatSyncCredentials
    ): Promise<ObatSyncLogItem> => {
        const body: { username?: string; password?: string } = {}
        if (credentials?.username) body.username = credentials.username
        if (credentials?.password) body.password = credentials.password
        return apiRequest<ObatSyncLogItem>("/api/superadmin/obat-sync", {
            method: "POST",
            body: JSON.stringify(body),
        })
    },
}

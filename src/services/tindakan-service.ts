import { apiRequest } from "../lib/api-client"
import type {
    TindakanCreatePayload,
    TindakanItem,
    TindakanListResponse,
    TindakanUpdatePayload,
} from "../types/tindakan"

const BASE = "/api/tindakan"

export const TindakanService = {
    getList: async (params?: {
        q?: string
        kategori?: string
        page?: number
        limit?: number
        include_inactive?: boolean
    }): Promise<TindakanListResponse> => {
        const search = new URLSearchParams()
        if (params?.q) search.set("q", params.q)
        if (params?.kategori) search.set("kategori", params.kategori)
        if (params?.page) search.set("page", String(params.page))
        if (params?.limit) search.set("limit", String(params.limit))
        if (params?.include_inactive) search.set("include_inactive", "1")
        const query = search.toString()
        return apiRequest<TindakanListResponse>(`${BASE}${query ? `?${query}` : ""}`)
    },

    getCategories: async (): Promise<string[]> => {
        return apiRequest<string[]>(`${BASE}/categories`)
    },

    getById: async (id: number): Promise<TindakanItem> => {
        return apiRequest<TindakanItem>(`${BASE}/${id}`)
    },

    create: async (payload: TindakanCreatePayload): Promise<TindakanItem> => {
        return apiRequest<TindakanItem>(BASE, {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },

    update: async (id: number, payload: TindakanUpdatePayload): Promise<TindakanItem> => {
        return apiRequest<TindakanItem>(`${BASE}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },

    delete: async (id: number): Promise<void> => {
        await apiRequest<null>(`${BASE}/${id}`, { method: "DELETE" })
    },
}

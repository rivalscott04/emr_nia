import { apiRequest } from "../lib/api-client"
import type { ObatItem } from "../types/obat"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const ObatService = {
    search: async (query: string, limit = 20): Promise<ObatItem[]> => {
        const q = query.trim().toLowerCase()
        if (q.length < 2) return []
        const params = new URLSearchParams({ q, limit: String(limit) })
        const data = await apiRequest<ListResponse<ObatItem>>(`/api/obat/search?${params.toString()}`)
        return data.items
    },
}


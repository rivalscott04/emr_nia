import { apiRequest } from "../lib/api-client"
import type { AuditLogItem } from "../types/audit-log"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const AuditLogService = {
    getAll: async (params?: {
        q?: string
        method?: string
        status_code?: string
        date_from?: string
        date_to?: string
        limit?: number
    }): Promise<ListResponse<AuditLogItem>> => {
        const search = new URLSearchParams()
        if (params?.q) search.set("q", params.q)
        if (params?.method) search.set("method", params.method)
        if (params?.status_code) search.set("status_code", params.status_code)
        if (params?.date_from) search.set("date_from", params.date_from)
        if (params?.date_to) search.set("date_to", params.date_to)
        if (params?.limit) search.set("limit", String(params.limit))

        const query = search.toString()
        return apiRequest<ListResponse<AuditLogItem>>(`/api/audit-logs${query ? `?${query}` : ""}`)
    },
}

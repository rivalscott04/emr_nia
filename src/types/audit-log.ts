export interface AuditLogItem {
    id: number
    actor: {
        id?: number | null
        name?: string | null
        email?: string | null
    }
    method: string
    path: string
    status_code?: number | null
    ip_address?: string | null
    user_agent?: string | null
    request_payload?: Record<string, unknown> | null
    meta?: Record<string, unknown> | null
    created_at: string
}

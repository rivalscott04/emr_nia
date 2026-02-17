export type SystemStatus = "active" | "warning" | "inactive"

export interface SuperadminMetric {
    title: string
    value: string
    description: string
}

export interface UserAccessItem {
    id: number
    name: string
    role: "superadmin" | "admin_poli" | "dokter"
    status: SystemStatus
    lastLogin: string
}

export interface AuditLogItem {
    id: number
    actor: string
    action: string
    target: string
    timestamp: string
    status: SystemStatus
}

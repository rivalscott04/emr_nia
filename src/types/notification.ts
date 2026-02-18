export interface NotificationData {
    action_url?: string
    entity_id?: string | number
    entity_type?: string
    [key: string]: any
}

export interface Notification {
    id: string
    type: string
    notifiable_type: string
    notifiable_id: number
    data: NotificationData
    read_at: string | null
    created_at: string
    updated_at: string
}

export interface NotificationListResponse {
    items: Notification[]
    unread_count: number
}

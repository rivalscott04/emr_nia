import { apiRequest } from "../lib/api-client"
import type { Notification, NotificationListResponse } from "../types/notification"

export const NotificationService = {
    getAll: async (limit = 10): Promise<NotificationListResponse> => {
        // Assumes backend returns { items: Notification[], unread_count: number }
        return apiRequest<NotificationListResponse>(`/api/notifications?limit=${limit}`)
    },

    getUnreadCount: async (): Promise<number> => {
        const data = await apiRequest<{ unread_count: number }>("/api/notifications/unread-count")
        return data.unread_count
    },

    markAsRead: async (id: string): Promise<void> => {
        await apiRequest(`/api/notifications/${id}/read`, {
            method: "PATCH",
        })
    },

    markAllAsRead: async (): Promise<void> => {
        await apiRequest("/api/notifications/read-all", {
            method: "PATCH",
        })
    },
}

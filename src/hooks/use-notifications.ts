import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { NotificationService } from "../services/notification-service"

export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: NotificationService.getUnreadCount,
        refetchInterval: 15000, // Poll every 15 seconds
        staleTime: 10000,
    })
}

export function useNotifications(limit = 10) {
    return useQuery({
        queryKey: ["notifications", "list", limit],
        queryFn: () => NotificationService.getAll(limit),
        staleTime: 5000,
    })
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: NotificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
    })
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: NotificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
    })
}

import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useNotifications, useUnreadNotificationsCount, useMarkNotificationRead, useMarkAllNotificationsRead } from "../../hooks/use-notifications"
import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "../../lib/utils"

export function NotificationDropdown() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const { data: unreadCount = 0 } = useUnreadNotificationsCount()
    const { data: notificationsData, isLoading } = useNotifications(10)
    const markReadMutation = useMarkNotificationRead()
    const markAllReadMutation = useMarkAllNotificationsRead()

    const notifications = notificationsData?.items ?? []

    const handleNotificationClick = (notification: any) => {
        if (!notification.read_at) {
            markReadMutation.mutate(notification.id)
        }

        // Navigate based on data
        if (notification.data?.action_url) {
            navigate(notification.data.action_url)
            setOpen(false)
        }
    }

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation()
        markAllReadMutation.mutate()
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white ring-2 ring-slate-900">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-80 border-slate-200 bg-white text-slate-900 shadow-lg"
                align="end"
                forceMount
            >
                <DropdownMenuLabel className="font-normal text-slate-900 flex items-center justify-between">
                    <span className="font-medium">Notifikasi</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-0.5 text-xs text-primary hover:text-primary/90"
                            onClick={handleMarkAllRead}
                            disabled={markAllReadMutation.isPending}
                        >
                            Tandai semua dibaca
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200" />

                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Memuat...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            Tidak ada notifikasi baru
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50",
                                    !notification.read_at && "bg-blue-50/50"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex w-full justify-between gap-2">
                                    <span className={cn(
                                        "text-sm font-medium leading-none",
                                        !notification.read_at ? "text-slate-900" : "text-slate-600"
                                    )}>
                                        {notification.data.title || "Notifikasi"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: id })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    {notification.data.message}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="bg-slate-200" />
                <div className="p-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500" onClick={() => setOpen(false)}>
                        Tutup
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

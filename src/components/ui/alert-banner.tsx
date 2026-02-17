import { cn } from "../../lib/utils"
import { AlertTriangle, Info, ShieldAlert } from "lucide-react"

interface AlertBannerProps {
    variant: "danger" | "warning" | "info"
    children: React.ReactNode
    className?: string
}

const variantConfig = {
    danger: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: ShieldAlert,
    },
    warning: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        icon: AlertTriangle,
    },
    info: {
        bg: "bg-sky-50 border-sky-200",
        text: "text-sky-800",
        icon: Info,
    },
}

export function AlertBanner({ variant, children, className }: AlertBannerProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium",
                config.bg,
                config.text,
                className
            )}
        >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{children}</span>
        </div>
    )
}

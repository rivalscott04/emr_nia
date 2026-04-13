import { cn } from "../../lib/utils"
import { AlertTriangle, Info, ShieldAlert } from "lucide-react"

interface AlertBannerProps {
    variant: "danger" | "warning" | "info"
    children: React.ReactNode
    className?: string
}

const variantIcons = {
    danger: ShieldAlert,
    warning: AlertTriangle,
    info: Info,
} as const

export function AlertBanner({ variant, children, className }: AlertBannerProps) {
    const Icon = variantIcons[variant]

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-normal text-foreground",
                className
            )}
        >
            <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <span>{children}</span>
        </div>
    )
}

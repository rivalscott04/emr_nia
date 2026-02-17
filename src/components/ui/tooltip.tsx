import { cn } from "../../lib/utils"

/**
 * Wrapper yang menambahkan tooltip pada hover. Teks label muncul di samping (default: kanan).
 * Dipakai untuk icon-only agar user tahu menu apa tanpa bingung.
 */
export function TooltipTrigger({
    children,
    label,
    side = "right",
    className,
}: {
    children: React.ReactNode
    label: string
    side?: "right" | "left" | "top" | "bottom"
    className?: string
}) {
    const positionClasses = {
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    }

    return (
        <span className={cn("group/tooltip relative inline-flex", className)}>
            {children}
            <span
                role="tooltip"
                className={cn(
                    "pointer-events-none absolute z-[100] whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-slate-100 shadow-lg",
                    "opacity-0 transition-opacity duration-150 ease-out",
                    "group-hover/tooltip:opacity-100",
                    positionClasses[side]
                )}
            >
                {label}
            </span>
        </span>
    )
}

import { useRef, useState, useCallback } from "react"
import { cn } from "../../lib/utils"

/**
 * Wrapper yang menambahkan tooltip pada hover. Teks label muncul di samping (default: kanan).
 * Menggunakan fixed positioning agar tidak ter-clip oleh overflow parent.
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
    const triggerRef = useRef<HTMLSpanElement>(null)
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

    const show = useCallback(() => {
        const el = triggerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()

        let top: number
        let left: number

        switch (side) {
            case "right":
                top = rect.top + rect.height / 2
                left = rect.right + 8
                break
            case "left":
                top = rect.top + rect.height / 2
                left = rect.left - 8
                break
            case "top":
                top = rect.top - 8
                left = rect.left + rect.width / 2
                break
            case "bottom":
                top = rect.bottom + 8
                left = rect.left + rect.width / 2
                break
        }

        setCoords({ top, left })
    }, [side])

    const hide = useCallback(() => setCoords(null), [])

    const transformClasses = {
        right: "-translate-y-1/2",
        left: "-translate-x-full -translate-y-1/2",
        top: "-translate-x-1/2 -translate-y-full",
        bottom: "-translate-x-1/2",
    }

    return (
        <span
            ref={triggerRef}
            className={cn("relative inline-flex", className)}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {coords && (
                <span
                    role="tooltip"
                    className={cn(
                        "pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-slate-100 shadow-lg",
                        transformClasses[side]
                    )}
                    style={{ top: coords.top, left: coords.left }}
                >
                    {label}
                </span>
            )}
        </span>
    )
}

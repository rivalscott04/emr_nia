import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
    onConfirm: () => void
    variant?: "destructive" | "default"
}

/**
 * Themed confirmation dialog to replace browser confirm().
 * Supports destructive (delete) and default (info/action) styling.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title = "Konfirmasi",
    description,
    confirmLabel = "Ya",
    cancelLabel = "Batal",
    loading = false,
    onConfirm,
    variant = "destructive",
}: ConfirmDialogProps) {
    const isDestructive = variant === "destructive"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDestructive ? "bg-destructive/10" : "bg-primary/10"
                                }`}
                        >
                            {isDestructive ? (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            ) : (
                                <Info className="h-5 w-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-1">{description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={isDestructive ? "destructive" : "default"}
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                        disabled={loading}
                    >
                        {loading ? "Memproses..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


/**
 * Hook to manage ConfirmDialog state.
 * Usage:
 *   const { confirm, dialogProps } = useConfirmDialog()
 *   confirm({ description: "...", onConfirm: () => mutation.mutate(id) })
 *   <ConfirmDialog {...dialogProps} />
 */
export function useConfirmDialog() {
    const [state, setState] = useState<{
        open: boolean
        title?: string
        description: string
        confirmLabel?: string
        variant?: "destructive" | "default"
        onConfirm: () => void
    }>({ open: false, description: "", onConfirm: () => { } })

    const confirm = (opts: {
        title?: string
        description: string
        confirmLabel?: string
        variant?: "destructive" | "default"
        onConfirm: () => void
    }) => {
        setState({ ...opts, open: true })
    }

    const dialogProps: ConfirmDialogProps = {
        ...state,
        onOpenChange: (open) => setState((prev) => ({ ...prev, open })),
    }

    return { confirm, dialogProps }
}

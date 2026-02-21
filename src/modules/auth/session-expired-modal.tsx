import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { setOnUnauthorized } from "../../lib/api-client"
import { useAuth } from "./auth-context"

/**
 * Modal "Sesi habis" saat API mengembalikan 401 (token expired).
 * Mendaftarkan handler global di api-client; saat 401, tampilkan dialog lalu redirect ke login.
 */
export function SessionExpiredModal() {
    const [open, setOpen] = useState(false)
    const { logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        setOnUnauthorized(() => setOpen(true))
        return () => setOnUnauthorized(null)
    }, [])

    const handleOk = () => {
        setOpen(false)
        logout()
        navigate("/login", { replace: true })
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleOk()}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Sesi habis</DialogTitle>
                    <DialogDescription>
                        Sesi Anda telah berakhir. Silakan masuk kembali.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-2">
                    <Button onClick={handleOk}>OK</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

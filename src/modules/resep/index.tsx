import { Navigate } from "react-router-dom"
import { useAuth } from "../auth/auth-context"

/**
 * Rute legacy `/resep` pernah memuat data contoh. Sekarang dialihkan:
 * - staf farmasi → antrian API sungguhan
 * - lainnya → daftar Rekam Medis (penulisan/kirim resep per kunjungan)
 */
export default function ResepPage() {
    const { hasPermission } = useAuth()

    if (hasPermission("resep.process")) {
        return <Navigate to="/farmasi/resep" replace />
    }

    return <Navigate to="/rekam-medis" replace />
}

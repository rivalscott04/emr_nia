import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./auth-context"

export function RequireAuth() {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="p-6 text-sm text-muted-foreground">Memuat sesi...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}

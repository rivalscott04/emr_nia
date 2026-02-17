import { Navigate } from "react-router-dom"
import { useAuth } from "./auth-context"
import type { PermissionName } from "../../types/auth"

type RequirePermissionProps = {
    permission: PermissionName
    children: React.ReactNode
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
    const { hasPermission } = useAuth()
    if (!hasPermission(permission)) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

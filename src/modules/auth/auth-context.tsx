import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { AuthService } from "../../services/auth-service"
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../../lib/auth-storage"
import type { AuthUser, PermissionName, RoleName } from "../../types/auth"

/** Admin = admin administrasi (role admin_poli). */
type AuthContextValue = {
    user: AuthUser | null
    accessToken: string | null
    loading: boolean
    login: (login: string, password: string) => Promise<void>
    logout: () => Promise<void>
    hasPermission: (permission: PermissionName) => boolean
    hasRole: (role: RoleName) => boolean
    isDokter: boolean
    isSuperadmin: boolean
    /** Admin untuk administrasi (admin_poli). */
    isAdmin: boolean
    isAdminPoli: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const hydrate = async () => {
            const stored = getStoredAuth()
            if (!stored) {
                setLoading(false)
                return
            }

            setUser(stored.user)
            setAccessToken(stored.accessToken)

            try {
                const freshUser = await AuthService.me()
                setUser(freshUser)
                setStoredAuth({ accessToken: stored.accessToken, user: freshUser })
            } catch {
                clearStoredAuth()
                setUser(null)
                setAccessToken(null)
            } finally {
                setLoading(false)
            }
        }

        hydrate()
    }, [])

    const login = useCallback(async (loginValue: string, password: string) => {
        const response = await AuthService.login(loginValue, password)
        setUser(response.user)
        setAccessToken(response.access_token)
        setStoredAuth({ accessToken: response.access_token, user: response.user })
    }, [])

    const logout = useCallback(async () => {
        try {
            await AuthService.logout()
        } catch {
            // Ignore backend logout failure and clear local token.
        } finally {
            clearStoredAuth()
            setUser(null)
            setAccessToken(null)
        }
    }, [])

    const hasPermission = useCallback(
        (permission: PermissionName) => {
            if (!user) {
                return false
            }

            return user.permissions.includes(permission)
        },
        [user]
    )

    const hasRole = useCallback(
        (role: RoleName) => {
            if (!user) {
                return false
            }
            return user.roles.includes(role)
        },
        [user]
    )

    const isDokter = Boolean(user?.roles.includes("dokter") && !user?.roles.includes("superadmin") && !user?.roles.includes("admin_poli"))
    const isSuperadmin = Boolean(user?.roles.includes("superadmin"))
    const isAdminPoli = Boolean(user?.roles.includes("admin_poli"))
    const isAdmin = isAdminPoli

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            accessToken,
            loading,
            login,
            logout,
            hasPermission,
            hasRole,
            isDokter,
            isSuperadmin,
            isAdmin,
            isAdminPoli,
            isAuthenticated: Boolean(user && accessToken),
        }),
        [user, accessToken, loading, login, logout, hasPermission, hasRole, isDokter, isSuperadmin, isAdmin, isAdminPoli]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context
}

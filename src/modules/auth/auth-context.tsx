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
    impersonate: (token: string, newUser: AuthUser) => Promise<void>
    stopImpersonating: () => Promise<void>
    isImpersonating: boolean
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
            impersonate: async (token: string, newUser: AuthUser) => {
                // 1. Store Admin Auth
                if (accessToken && user) {
                    localStorage.setItem("admin_auth_backup", JSON.stringify({ accessToken, user }))
                }
                // 2. Set New Token
                setAccessToken(token)
                setUser(newUser)
                if (newUser) {
                    setStoredAuth({ accessToken: token, user: newUser })
                }
                window.location.href = "/dashboard" // Force reload to apply permissions
            },
            stopImpersonating: async () => {
                const backupRaw = localStorage.getItem("admin_auth_backup")
                if (!backupRaw) return

                try {
                    const backup = JSON.parse(backupRaw)
                    const { accessToken: adminToken, user: adminUser } = backup

                    setAccessToken(adminToken)
                    setStoredAuth({ accessToken: adminToken, user: adminUser })
                    localStorage.removeItem("admin_auth_backup")
                    window.location.href = "/superadmin/access"
                } catch {
                    // Fallback if parse fails
                    clearStoredAuth()
                    window.location.reload()
                }
            },
            isImpersonating: Boolean(localStorage.getItem("admin_auth_backup")),
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

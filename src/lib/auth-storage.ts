import type { AuthUser } from "../types/auth"

const AUTH_STORAGE_KEY = "emrnia.auth"

type PersistedAuth = {
    accessToken: string
    user: AuthUser
}

export function getStoredAuth(): PersistedAuth | null {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!raw) {
            return null
        }

        return JSON.parse(raw) as PersistedAuth
    } catch {
        return null
    }
}

export function setStoredAuth(auth: PersistedAuth): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getAccessToken(): string | null {
    return getStoredAuth()?.accessToken ?? null
}

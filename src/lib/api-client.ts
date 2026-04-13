import { getAccessToken } from "./auth-storage"

export class ApiError extends Error {
    readonly status: number
    readonly errors?: Record<string, string[]>

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.errors = errors
    }
}

type ApiEnvelope<T> = {
    success: boolean
    message: string
    data: T
    errors?: Record<string, string[]>
}

// Dev (`bun run dev`): selalu backend lokal :8000.
// Production (`bun run build`): URL dari `.env.production` → VITE_API_BASE_URL (di-inject di build.ts).
const rawBaked = import.meta.env.VITE_API_BASE_URL
const bakedUrl = typeof rawBaked === "string" ? rawBaked.trim() : ""
const useProductionApi = import.meta.env.PROD === true && bakedUrl.length > 0

let defaultHost = "127.0.0.1"
if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
        defaultHost = host
    }
}

export const API_BASE_URL = useProductionApi ? bakedUrl : `http://${defaultHost}:8000`

let onUnauthorized: (() => void) | null = null

/** Set global handler when API returns 401 (e.g. token expired). Used to show "Sesi habis" modal and redirect to login. */
export function setOnUnauthorized(handler: (() => void) | null): void {
    onUnauthorized = handler
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`
    const accessToken = getAccessToken()
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(init?.headers ?? {}),
        },
        ...init,
    })

    let payload: ApiEnvelope<T> | null = null
    try {
        payload = (await response.json()) as ApiEnvelope<T>
    } catch {
        payload = null
    }

    // Hanya tampilkan handler "Sesi habis" jika sebelumnya memang ada token tersimpan.
    // Dengan begitu, 401 dari endpoint publik seperti /auth/login tidak akan memicu modal.
    if (response.status === 401 && accessToken) {
        onUnauthorized?.()
    }

    if (!response.ok || !payload?.success) {
        const message = payload?.message || `Request gagal (${response.status})`
        throw new ApiError(message, response.status, payload?.errors)
    }

    return payload.data
}


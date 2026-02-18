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
const apiEnv = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL

// Default base URL dev-friendly:
// - Kalau VITE_API_BASE_URL ada, pakai itu
// - Kalau tidak, pakai hostname dari browser (localhost / 127.0.0.1) di port 8000
let defaultHost = "127.0.0.1"
if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
        defaultHost = host
    }
}

const API_BASE_URL = apiEnv ?? `http://${defaultHost}:8000`

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

    if (!response.ok || !payload?.success) {
        const message = payload?.message || `Request gagal (${response.status})`
        throw new ApiError(message, response.status, payload?.errors)
    }

    return payload.data
}


import { apiRequest } from "../lib/api-client"
import { getAccessToken } from "../lib/auth-storage"
import type { Pasien, PasienInput } from "../types/pasien"

const API_BASE_URL = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? (typeof window !== "undefined" && (window.location?.hostname === "localhost" || window.location?.hostname === "127.0.0.1") ? `http://${window.location.hostname}:8000` : "http://127.0.0.1:8000")

type ListResponse<T> = {
    items: T[]
    total: number
}

export const PasienService = {
    getAll: async (): Promise<Pasien[]> => {
        const data = await apiRequest<ListResponse<Pasien>>("/api/pasien?limit=100")
        return data.items
    },

    getById: async (id: string): Promise<Pasien | undefined> => {
        return apiRequest<Pasien>(`/api/pasien/${id}`)
    },

    create: async (data: PasienInput): Promise<Pasien> => {
        return apiRequest<Pasien>("/api/pasien", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    search: async (query: string): Promise<Pasien[]> => {
        const params = new URLSearchParams({ q: query, limit: "20" })
        const data = await apiRequest<ListResponse<Pasien>>(`/api/pasien/search?${params.toString()}`)
        return data.items
    },

    /** Update daftar alergi pasien (sumber data untuk tampilan di Rekam Medis) */
    updateAllergies: async (pasienId: string, allergies: string[]): Promise<Pasien | undefined> => {
        return apiRequest<Pasien>(`/api/pasien/${pasienId}/allergies`, {
            method: "PATCH",
            body: JSON.stringify({ allergies }),
        })
    },

    /**
     * Export pasien yang pernah ditangani dokter (CSV atau PDF) untuk keperluan pajak dll.
     * Hanya untuk role dokter. Isi menyertakan nama dokter. Mengunduh file langsung.
     */
    exportPasien: async (limit: number, format: "csv" | "pdf"): Promise<void> => {
        const token = getAccessToken()
        const params = new URLSearchParams({ limit: String(limit), format })
        const url = `${API_BASE_URL}/api/pasien/export?${params.toString()}`
        const res = await fetch(url, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) {
            const text = await res.text()
            let message = `Export gagal (${res.status})`
            try {
                const json = JSON.parse(text)
                if (json?.message) message = json.message
            } catch {
                if (text) message = text
            }
            throw new Error(message)
        }
        const blob = await res.blob()
        const disposition = res.headers.get("Content-Disposition")
        const match = disposition?.match(/filename="?([^";\n]+)"?/)
        const defaultExt = format === "pdf" ? "pdf" : "csv"
        const filename = match?.[1] ?? `export-pasien-${new Date().toISOString().slice(0, 10)}.${defaultExt}`
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
    },
}

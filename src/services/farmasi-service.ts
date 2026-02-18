import { apiRequest } from "../lib/api-client"
import type {
    ResepAntrianItem,
    ResepAntrianListResponse,
    ResepDetailFarmasi,
    ResepRiwayatListResponse,
} from "../types/farmasi"

const BASE = "/api/resep"

interface AntrianParams {
    status?: "Waiting" | "Processed" | "Done"
    tanggal?: string
    page?: number
    limit?: number
}

const statusToBackend = (s: "Waiting" | "Processed" | "Done") =>
    s === "Waiting" ? "Sent" : s

export const FarmasiService = {
    getAntrian(params?: AntrianParams): Promise<ResepAntrianListResponse> {
        const search = new URLSearchParams()
        if (params?.status) search.set("status", statusToBackend(params.status))
        if (params?.tanggal) search.set("tanggal", params.tanggal)
        if (params?.page) search.set("page", String(params.page))
        if (params?.limit) search.set("limit", String(params.limit))
        const query = search.toString()
        return apiRequest<ResepAntrianListResponse>(
            `${BASE}/antrian${query ? `?${query}` : ""}`
        )
    },

    getRiwayat(params?: { tanggal?: string; page?: number; limit?: number }): Promise<ResepRiwayatListResponse> {
        const search = new URLSearchParams()
        if (params?.tanggal) search.set("tanggal", params.tanggal)
        if (params?.page) search.set("page", String(params.page))
        if (params?.limit) search.set("limit", String(params.limit))
        const query = search.toString()
        return apiRequest<ResepRiwayatListResponse>(
            `${BASE}/riwayat${query ? `?${query}` : ""}`
        )
    },

    getDetail(id: string): Promise<ResepDetailFarmasi> {
        return apiRequest<ResepDetailFarmasi>(`${BASE}/${id}`)
    },

    updateStatus(id: string, status: "Processed" | "Done"): Promise<ResepDetailFarmasi> {
        return apiRequest<ResepDetailFarmasi>(`${BASE}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        })
    },
}

import { apiRequest } from "../lib/api-client"
import type { RekamMedisDetail, RekamMedisListItem, RekamMedisUpsertPayload, RekapKunjungan } from "../types/rekam-medis"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const RekamMedisService = {
    getAll: async (): Promise<RekamMedisListItem[]> => {
        const data = await apiRequest<ListResponse<RekamMedisListItem>>("/api/rekam-medis?limit=100")
        return data.items
    },

    getByKunjunganId: async (kunjunganId: string): Promise<RekamMedisDetail> => {
        return apiRequest<RekamMedisDetail>(`/api/rekam-medis/kunjungan/${kunjunganId}`)
    },

    /** Rekap tindakan & biaya untuk admin poli. Hanya tersedia bila rekam medis sudah Final. */
    getRekapByKunjunganId: async (kunjunganId: string): Promise<RekapKunjungan> => {
        return apiRequest<RekapKunjungan>(`/api/rekam-medis/kunjungan/${kunjunganId}/rekap`)
    },

    upsertByKunjunganId: async (kunjunganId: string, payload: RekamMedisUpsertPayload): Promise<RekamMedisDetail> => {
        return apiRequest<RekamMedisDetail>(`/api/rekam-medis/kunjungan/${kunjunganId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        })
    },

    finalizeByKunjunganId: async (kunjunganId: string): Promise<RekamMedisDetail> => {
        return apiRequest<RekamMedisDetail>(`/api/rekam-medis/kunjungan/${kunjunganId}/finalize`, {
            method: "POST",
        })
    },

    addendumByKunjunganId: async (kunjunganId: string, catatan: string, dokter?: string): Promise<void> => {
        await apiRequest(`/api/rekam-medis/kunjungan/${kunjunganId}/addendum`, {
            method: "POST",
            body: JSON.stringify({ catatan, dokter }),
        })
    },

    sendResepByKunjunganId: async (kunjunganId: string): Promise<RekamMedisDetail> => {
        return apiRequest<RekamMedisDetail>(`/api/rekam-medis/kunjungan/${kunjunganId}/resep/send`, {
            method: "POST",
        })
    },

    deleteByKunjunganId: async (kunjunganId: string): Promise<void> => {
        await apiRequest(`/api/rekam-medis/kunjungan/${kunjunganId}`, {
            method: "DELETE",
        })
    },
}


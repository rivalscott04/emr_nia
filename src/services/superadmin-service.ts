import { apiRequest } from "../lib/api-client"
import type { AuthUser } from "../types/auth"
import type {
    CreateUserPayload,
    MasterIcdCode,
    MasterPoli,
    RoleAccess,
    UpdateUserAccessPayload,
    UserAccessItem
} from "../types/superadmin"

type ListResponse<T> = {
    items: T[]
    total: number
}

export const SuperadminService = {
    getUsers: async (params?: { q?: string; role?: string; poli?: string; limit?: number }): Promise<ListResponse<UserAccessItem>> => {
        const search = new URLSearchParams()
        if (params?.q) search.set("q", params.q)
        if (params?.role) search.set("role", params.role)
        if (params?.poli) search.set("poli", params.poli)
        if (params?.limit) search.set("limit", String(params.limit))

        const query = search.toString()
        return apiRequest<ListResponse<UserAccessItem>>(`/api/superadmin/users${query ? `?${query}` : ""}`)
    },
    createUser: async (payload: CreateUserPayload): Promise<UserAccessItem> => {
        return apiRequest<UserAccessItem>("/api/superadmin/users", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },
    updateUser: async (id: number, payload: UpdateUserAccessPayload): Promise<UserAccessItem> => {
        return apiRequest<UserAccessItem>(`/api/superadmin/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },
    deleteUser: async (id: number): Promise<void> => {
        await apiRequest<null>(`/api/superadmin/users/${id}`, {
            method: "DELETE",
        })
    },
    getRoles: async (): Promise<{ roles: RoleAccess[]; available_permissions: string[] }> => {
        return apiRequest<{ roles: RoleAccess[]; available_permissions: string[] }>("/api/superadmin/roles")
    },
    createRole: async (payload: { name: string; permissions: string[] }): Promise<RoleAccess> => {
        return apiRequest<RoleAccess>("/api/superadmin/roles", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },
    updateRole: async (id: number, payload: { name: string; permissions: string[] }): Promise<RoleAccess> => {
        return apiRequest<RoleAccess>(`/api/superadmin/roles/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },
    deleteRole: async (id: number): Promise<void> => {
        await apiRequest<null>(`/api/superadmin/roles/${id}`, {
            method: "DELETE",
        })
    },
    getPolis: async (): Promise<MasterPoli[]> => {
        return apiRequest<MasterPoli[]>("/api/superadmin/polis")
    },
    createPoli: async (payload: { code: string; name: string; is_active: boolean; supports_obstetri?: boolean }): Promise<MasterPoli> => {
        return apiRequest<MasterPoli>("/api/superadmin/polis", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },
    updatePoli: async (id: number, payload: { code: string; name: string; is_active: boolean; supports_obstetri?: boolean }): Promise<MasterPoli> => {
        return apiRequest<MasterPoli>(`/api/superadmin/polis/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },
    deletePoli: async (id: number): Promise<void> => {
        await apiRequest<null>(`/api/superadmin/polis/${id}`, {
            method: "DELETE",
        })
    },
    getMasterIcd: async (params?: { q?: string; type?: "ICD-9" | "ICD-10"; limit?: number }): Promise<ListResponse<MasterIcdCode>> => {
        const search = new URLSearchParams()
        if (params?.q) search.set("q", params.q)
        if (params?.type) search.set("type", params.type)
        if (params?.limit) search.set("limit", String(params.limit))
        const query = search.toString()
        return apiRequest<ListResponse<MasterIcdCode>>(`/api/superadmin/master-icd${query ? `?${query}` : ""}`)
    },
    createMasterIcd: async (payload: { type: "ICD-9" | "ICD-10"; code: string; name: string; is_active: boolean }): Promise<MasterIcdCode> => {
        return apiRequest<MasterIcdCode>("/api/superadmin/master-icd", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    },
    updateMasterIcd: async (id: number, payload: { type: "ICD-9" | "ICD-10"; code: string; name: string; is_active: boolean }): Promise<MasterIcdCode> => {
        return apiRequest<MasterIcdCode>(`/api/superadmin/master-icd/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
        })
    },
    deleteMasterIcd: async (id: number): Promise<void> => {
        await apiRequest<null>(`/api/superadmin/master-icd/${id}`, {
            method: "DELETE",
        })
    },
    impersonate: async (userId: number): Promise<{ token: string; user: AuthUser; message: string }> => {
        return apiRequest<{ token: string; user: AuthUser; message: string }>(`/api/superadmin/impersonate/${userId}`, {
            method: "POST",
        })
    },
}

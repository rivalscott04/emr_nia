export type RoleName = "superadmin" | "admin_poli" | "dokter" | "apoteker"

export type PermissionName =
    | "dashboard.view"
    | "pasien.read"
    | "pasien.write"
    | "kunjungan.read"
    | "kunjungan.write"
    | "rekam_medis.read"
    | "rekam_medis.write"
    | "rekap_tindakan.read"
    | "master.manage"
    | "user_access.manage"
    | "role_poli.manage"
    | "master_icd.manage"
    | "obat_sync.manage"
    | "settings.manage"
    | "audit_log.read"
    | "resep.process"
    | "master_tindakan.manage"


export interface AuthUser {
    id: number
    name: string
    username?: string | null
    email: string
    dokter_id?: string | null
    roles: RoleName[]
    permissions: PermissionName[]
    poli_scopes: string[]
}

export interface LoginResponse {
    access_token: string
    token_type: "Bearer"
    expires_in: number
    user: AuthUser
}

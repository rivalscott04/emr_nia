export interface RoleAccess {
    id: number
    name: string
    permissions: string[]
}

export interface MasterPoli {
    id: number
    code: string
    name: string
    is_active: boolean
    /** Jika true, form kunjungan menampilkan data obstetri (HPHT, G-P-A). */
    supports_obstetri?: boolean
}

export interface MasterIcdCode {
    id: number
    type: "ICD-9" | "ICD-10"
    code: string
    name: string
    is_active: boolean
}

export interface UserAccessItem {
    id: number
    name: string
    email: string
    username?: string | null
    dokter_id?: string | null
    roles: string[]
    poli_scopes: string[]
    created_at?: string
}

export interface UpdateUserAccessPayload {
    name: string
    email: string
    username?: string | null
    role_names: string[]
    poli_scopes: string[]
    /** Hanya dikirim jika superadmin mengganti password user. */
    password?: string
    password_confirmation?: string
}

export interface CreateUserPayload extends UpdateUserAccessPayload {
    password: string
}

export interface ClinicProfile {
    nama: string | null
    telepon: string | null
    alamat: string | null
    updated_at?: string | null
}

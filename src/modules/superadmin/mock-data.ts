import type { AuditLogItem, SuperadminMetric, UserAccessItem } from "./types"

export const superadminMetrics: SuperadminMetric[] = [
    { title: "Total Pengguna Aktif", value: "36", description: "User dengan akses sistem aktif hari ini" },
    { title: "Role Terdaftar", value: "3", description: "Superadmin, Admin Poli, dan Dokter" },
    { title: "Poli Aktif", value: "8", description: "Poli yang siap menerima kunjungan" },
    { title: "Integrasi API", value: "99.8%", description: "Ketersediaan layanan backend 24 jam terakhir" },
    { title: "Aksi Audit Hari Ini", value: "124", description: "Perubahan data penting tercatat" },
]

export const userAccessData: UserAccessItem[] = [
    { id: 1, name: "Nia Rival", role: "superadmin", status: "active", lastLogin: "17 Feb 2026 08:05" },
    { id: 2, name: "Dedi Saputra", role: "admin_poli", status: "active", lastLogin: "17 Feb 2026 07:59" },
    { id: 3, name: "dr. Amanda Putri", role: "dokter", status: "warning", lastLogin: "16 Feb 2026 22:11" },
    { id: 4, name: "dr. Rio Mahendra", role: "dokter", status: "inactive", lastLogin: "14 Feb 2026 19:44" },
]

export const auditLogData: AuditLogItem[] = [
    {
        id: 1,
        actor: "Nia Rival",
        action: "Update Role",
        target: "User: dr. Rio Mahendra",
        timestamp: "17 Feb 2026 08:11",
        status: "active",
    },
    {
        id: 2,
        actor: "Nia Rival",
        action: "Enable Master Obat",
        target: "Kategori: Antibiotik",
        timestamp: "17 Feb 2026 08:01",
        status: "active",
    },
    {
        id: 3,
        actor: "Dedi Saputra",
        action: "Reset Password",
        target: "User: dr. Amanda Putri",
        timestamp: "16 Feb 2026 17:26",
        status: "warning",
    },
]

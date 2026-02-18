import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import type { MasterIcdCode, MasterPoli, RoleAccess, UserAccessItem } from "../../types/superadmin"
import type { AuditLogItem } from "../../types/audit-log"

export function buildUserAccessColumns(
    onEdit: (row: UserAccessItem) => void,
    onDelete: (row: UserAccessItem) => void,
    onImpersonate: (row: UserAccessItem) => void
): ColumnDef<UserAccessItem>[] {
    return [
        { accessorKey: "name", header: "Nama Pengguna" },
        { accessorKey: "email", header: "Email" },
        {
            accessorKey: "roles",
            header: "Role",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles.map((role) => (
                        <Badge key={role} variant="neutral" className="capitalize">
                            {role.replace("_", " ")}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "poli_scopes",
            header: "Scope Poli",
            cell: ({ row }) => (
                <span className="text-sm text-slate-600">
                    {row.original.poli_scopes.length > 0 ? row.original.poli_scopes.join(", ") : "-"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onImpersonate(row.original)} title="Impersonate">
                        👀
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>Ubah</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>Hapus</Button>
                </div>
            ),
        },
    ]
}

export function buildRoleColumns(
    onEdit: (row: RoleAccess) => void,
    onDelete: (row: RoleAccess) => void
): ColumnDef<RoleAccess>[] {
    return [
        { accessorKey: "name", header: "Nama Role", cell: ({ row }) => <span className="font-medium capitalize">{row.original.name.replace("_", " ")}</span> },
        {
            accessorKey: "permissions",
            header: "Permission",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.permissions.map((p) => (
                        <Badge key={p} variant="neutral" className="text-xs">{p}</Badge>
                    ))}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>Ubah</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>Hapus</Button>
                </div>
            ),
        },
    ]
}

export function buildPoliColumns(
    onEdit: (row: MasterPoli) => void,
    onDelete: (row: MasterPoli) => void
): ColumnDef<MasterPoli>[] {
    return [
        { accessorKey: "code", header: "Kode" },
        { accessorKey: "name", header: "Nama Poli" },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? "success" : "neutral"}>
                    {row.original.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>Ubah</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>Hapus</Button>
                </div>
            ),
        },
    ]
}

export function buildIcdColumns(
    onEdit: (row: MasterIcdCode) => void,
    onDelete: (row: MasterIcdCode) => void
): ColumnDef<MasterIcdCode>[] {
    return [
        {
            accessorKey: "type",
            header: "Tipe",
            cell: ({ row }) => <Badge variant="neutral">{row.original.type}</Badge>,
        },
        { accessorKey: "code", header: "Kode" },
        { accessorKey: "name", header: "Nama" },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? "success" : "neutral"}>
                    {row.original.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>Ubah</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>Hapus</Button>
                </div>
            ),
        },
    ]
}

export const auditLogColumns: ColumnDef<AuditLogItem>[] = [
    {
        id: "actor",
        accessorFn: (row) => row.actor?.name ?? row.actor?.email ?? "System",
        header: "Aktor",
    },
    {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
            const method = row.original.method
            const variant = method === "GET" ? "neutral" : method === "POST" ? "success" : method === "DELETE" ? "warning" : "neutral"
            return <Badge variant={variant}>{method}</Badge>
        },
    },
    { accessorKey: "path", header: "Endpoint" },
    {
        accessorKey: "status_code",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status_code ?? "-"}</span>,
    },
    {
        accessorKey: "created_at",
        header: "Waktu",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString("id-ID"),
    },
]

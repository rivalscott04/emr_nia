import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { PageHeader } from "../../components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { DataTable } from "../../components/ui/data-table"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { buildRoleColumns, buildPoliColumns } from "./column-def"
import { SuperadminService } from "../../services/superadmin-service"
import { toast } from "sonner"
import { ConfirmDialog, useConfirmDialog } from "../../components/ui/confirm-dialog"
import type { MasterPoli, RoleAccess } from "../../types/superadmin"

export default function SuperadminRolePoliPage() {
    const queryClient = useQueryClient()

    const { data: rolesData, isLoading: rolesLoading } = useQuery({
        queryKey: ["superadmin", "roles"],
        queryFn: SuperadminService.getRoles,
    })
    const roles = rolesData?.roles ?? []
    const availablePermissions = rolesData?.available_permissions ?? []

    const { data: polis = [], isLoading: polisLoading } = useQuery({
        queryKey: ["superadmin", "polis"],
        queryFn: SuperadminService.getPolis,
    })

    const [showCreateRole, setShowCreateRole] = useState(false)
    const [editRole, setEditRole] = useState<RoleAccess | null>(null)
    const [showCreatePoli, setShowCreatePoli] = useState(false)
    const [editPoli, setEditPoli] = useState<MasterPoli | null>(null)

    const createRoleMutation = useMutation({
        mutationFn: (payload: { name: string; permissions: string[] }) => SuperadminService.createRole(payload),
        onSuccess: () => { toast.success("Role berhasil dibuat."); setShowCreateRole(false); queryClient.invalidateQueries({ queryKey: ["superadmin", "roles"] }) },
        onError: () => toast.error("Gagal membuat role."),
    })
    const updateRoleMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: { name: string; permissions: string[] } }) => SuperadminService.updateRole(id, payload),
        onSuccess: () => { toast.success("Role berhasil diperbarui."); setEditRole(null); queryClient.invalidateQueries({ queryKey: ["superadmin", "roles"] }) },
        onError: () => toast.error("Gagal memperbarui role."),
    })
    const deleteRoleMutation = useMutation({
        mutationFn: (id: number) => SuperadminService.deleteRole(id),
        onSuccess: () => { toast.success("Role berhasil dihapus."); queryClient.invalidateQueries({ queryKey: ["superadmin", "roles"] }) },
        onError: () => toast.error("Gagal menghapus role."),
    })

    const createPoliMutation = useMutation({
        mutationFn: (payload: { code: string; name: string; is_active: boolean }) => SuperadminService.createPoli(payload),
        onSuccess: () => { toast.success("Poli berhasil dibuat."); setShowCreatePoli(false); queryClient.invalidateQueries({ queryKey: ["superadmin", "polis"] }) },
        onError: () => toast.error("Gagal membuat poli."),
    })
    const updatePoliMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: { code: string; name: string; is_active: boolean } }) => SuperadminService.updatePoli(id, payload),
        onSuccess: () => { toast.success("Poli berhasil diperbarui."); setEditPoli(null); queryClient.invalidateQueries({ queryKey: ["superadmin", "polis"] }) },
        onError: () => toast.error("Gagal memperbarui poli."),
    })
    const deletePoliMutation = useMutation({
        mutationFn: (id: number) => SuperadminService.deletePoli(id),
        onSuccess: () => { toast.success("Poli berhasil dihapus."); queryClient.invalidateQueries({ queryKey: ["superadmin", "polis"] }) },
        onError: () => toast.error("Gagal menghapus poli."),
    })

    const { confirm, dialogProps } = useConfirmDialog()

    const handleDeleteRole = (role: RoleAccess) => {
        confirm({
            description: `Hapus role "${role.name}"? Semua user dengan role ini akan kehilangan aksesnya.`,
            onConfirm: () => deleteRoleMutation.mutate(role.id),
        })
    }
    const handleDeletePoli = (poli: MasterPoli) => {
        confirm({
            description: `Hapus poli "${poli.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
            onConfirm: () => deletePoliMutation.mutate(poli.id),
        })
    }

    const roleColumns = useMemo(() => buildRoleColumns((r) => setEditRole(r), handleDeleteRole), [])
    const poliColumns = useMemo(() => buildPoliColumns((p) => setEditPoli(p), handleDeletePoli), [])

    return (
        <div className="space-y-6">
            <PageHeader title="Role & Poli" description="Kelola role otorisasi dan master poli klinik." />

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Daftar Role</CardTitle>
                    <Button size="sm" onClick={() => setShowCreateRole(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Role
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={roleColumns} data={roles} searchKey="name" isLoading={rolesLoading} />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Daftar Poli</CardTitle>
                    <Button size="sm" onClick={() => setShowCreatePoli(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Poli
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={poliColumns} data={polis} searchKey="name" isLoading={polisLoading} />
                </CardContent>
            </Card>

            <RoleFormDialog
                open={showCreateRole}
                onOpenChange={setShowCreateRole}
                availablePermissions={availablePermissions}
                loading={createRoleMutation.isPending}
                onSubmit={(p) => createRoleMutation.mutate(p)}
                title="Tambah Role Baru"
                description="Tentukan nama role dan permission yang dimiliki."
            />
            <RoleFormDialog
                open={Boolean(editRole)}
                onOpenChange={(open) => !open && setEditRole(null)}
                availablePermissions={availablePermissions}
                defaultName={editRole?.name ?? ""}
                defaultPermissions={editRole?.permissions ?? []}
                nameDisabled
                loading={updateRoleMutation.isPending}
                onSubmit={(p) => editRole && updateRoleMutation.mutate({ id: editRole.id, payload: p })}
                title="Ubah Role"
                description="Ubah akses permission saja. Nama role tidak dapat diubah."
                submitLabel="Simpan Perubahan"
            />

            <PoliFormDialog
                open={showCreatePoli}
                onOpenChange={setShowCreatePoli}
                loading={createPoliMutation.isPending}
                onSubmit={(p) => createPoliMutation.mutate(p)}
                title="Tambah Poli Baru"
                description="Masukkan kode dan nama poli."
            />
            <PoliFormDialog
                open={Boolean(editPoli)}
                onOpenChange={(open) => !open && setEditPoli(null)}
                defaultCode={editPoli?.code}
                defaultName={editPoli?.name}
                loading={updatePoliMutation.isPending}
                onSubmit={(p) => editPoli && updatePoliMutation.mutate({ id: editPoli.id, payload: p })}
                title="Ubah Poli"
                description={`Edit poli "${editPoli?.name ?? ""}".`}
                submitLabel="Simpan Perubahan"
            />

            <ConfirmDialog {...dialogProps} />
        </div>
    )
}

function RoleFormDialog({
    open,
    onOpenChange,
    availablePermissions,
    defaultName = "",
    defaultPermissions = [],
    nameDisabled = false,
    loading,
    onSubmit,
    title,
    description,
    submitLabel = "Tambah Role",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    availablePermissions: string[]
    defaultName?: string
    defaultPermissions?: string[]
    /** Saat true (mode edit), nama role tidak bisa diubah. */
    nameDisabled?: boolean
    loading: boolean
    onSubmit: (payload: { name: string; permissions: string[] }) => void
    title: string
    description: string
    submitLabel?: string
}) {
    const [name, setName] = useState(defaultName)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(defaultPermissions)

    const resetOnOpen = () => {
        setName(defaultName)
        setSelectedPermissions([...defaultPermissions])
    }

    useEffect(() => {
        if (open) {
            setName(defaultName)
            setSelectedPermissions([...defaultPermissions])
        }
    }, [open, defaultName, defaultPermissions])

    return (
        <Dialog open={open} onOpenChange={(v) => { if (v) resetOnOpen(); onOpenChange(v) }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Nama Role</Label>
                        <Input
                            placeholder="contoh: kasir_farmasi"
                            value={name}
                            onChange={(e) => !nameDisabled && setName(e.target.value)}
                            disabled={nameDisabled}
                            readOnly={nameDisabled}
                            className={nameDisabled ? "bg-muted cursor-not-allowed" : undefined}
                        />
                        {nameDisabled && (
                            <p className="text-xs text-muted-foreground">Nama role tidak dapat diubah.</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Permission</Label>
                        <p className="text-xs text-muted-foreground">
                            Centang izin yang boleh diakses oleh role ini.
                        </p>
                        <div className="max-h-64 overflow-y-auto rounded-md border p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {availablePermissions.map((perm) => {
                                const checked = selectedPermissions.includes(perm)
                                return (
                                    <label
                                        key={perm}
                                        className="flex cursor-pointer items-start gap-2 rounded-sm px-1 py-0.5 hover:bg-muted"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1 h-4 w-4"
                                            checked={checked}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPermissions((prev) =>
                                                        prev.includes(perm) ? prev : [...prev, perm],
                                                    )
                                                } else {
                                                    setSelectedPermissions((prev) => prev.filter((p) => p !== perm))
                                                }
                                            }}
                                        />
                                        <span className="text-xs leading-tight">
                                            <span className="block font-medium">
                                                {formatPermissionLabel(perm)}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground">
                                                {perm}
                                            </span>
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button
                        onClick={() => onSubmit({ name, permissions: selectedPermissions })}
                        disabled={loading || !name || selectedPermissions.length === 0}
                    >
                        {loading ? "Menyimpan..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function formatPermissionLabel(permission: string) {
    const [resourceRaw, actionRaw] = permission.split(".")

    const prettify = (text?: string) =>
        (text ?? "")
            .replace(/[_\-]+/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())

    const actionMap: Record<string, string> = {
        read: "Lihat",
        write: "Tambah / Ubah",
        manage: "Kelola",
        view: "Lihat",
    }

    const resource = prettify(resourceRaw)
    const actionKey = (actionRaw ?? "").toLowerCase()
    const action = actionMap[actionKey] ?? prettify(actionRaw)

    if (!resource && !action) return permission
    if (!action) return resource

    return `${resource} - ${action}`
}

function PoliFormDialog({
    open,
    onOpenChange,
    defaultCode = "",
    defaultName = "",
    loading,
    onSubmit,
    title,
    description,
    submitLabel = "Tambah Poli",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultCode?: string
    defaultName?: string
    loading: boolean
    onSubmit: (payload: { code: string; name: string; is_active: boolean }) => void
    title: string
    description: string
    submitLabel?: string
}) {
    const [code, setCode] = useState(defaultCode)
    const [name, setName] = useState(defaultName)

    const resetOnOpen = () => {
        setCode(defaultCode)
        setName(defaultName)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (v) resetOnOpen(); onOpenChange(v) }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Kode Poli</Label>
                        <Input placeholder="contoh: UMUM" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Nama Poli</Label>
                        <Input placeholder="contoh: Poli Umum" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button
                        onClick={() => onSubmit({ code, name, is_active: true })}
                        disabled={loading || !code || !name}
                    >
                        {loading ? "Menyimpan..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

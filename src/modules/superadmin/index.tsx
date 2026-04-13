import { useMemo, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { buildUserAccessColumns } from "./column-def"
import { SuperadminService } from "../../services/superadmin-service"
import { toast } from "sonner"
import { ConfirmDialog, useConfirmDialog } from "../../components/ui/confirm-dialog"
import type { CreateUserPayload, MasterPoli, RoleAccess, UpdateUserAccessPayload, UserAccessItem } from "../../types/superadmin"
import { useAuth } from "../auth/auth-context" // Add import

export default function SuperadminPage() {
    const queryClient = useQueryClient()

    const [userQuery, setUserQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [poliFilter, setPoliFilter] = useState("all")
    const [selectedUser, setSelectedUser] = useState<UserAccessItem | null>(null)
    const [editor, setEditor] = useState<UpdateUserAccessPayload | null>(null)
    const [editPassword, setEditPassword] = useState("")
    const [editPasswordConfirm, setEditPasswordConfirm] = useState("")
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const { data: rolesData } = useQuery({
        queryKey: ["superadmin", "roles"],
        queryFn: SuperadminService.getRoles,
    })
    const roles = rolesData?.roles ?? []

    const { data: polis = [] } = useQuery({
        queryKey: ["superadmin", "polis"],
        queryFn: SuperadminService.getPolis,
    })

    const { data: userResponse, isLoading: usersLoading } = useQuery({
        queryKey: ["superadmin", "users", userQuery, roleFilter, poliFilter],
        queryFn: () =>
            SuperadminService.getUsers({
                q: userQuery || undefined,
                role: roleFilter !== "all" ? roleFilter : undefined,
                poli: poliFilter !== "all" ? (polis.find((p) => String(p.id) === poliFilter)?.name ?? undefined) : undefined,
                limit: 100,
            }),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateUserAccessPayload }) =>
            SuperadminService.updateUser(id, payload),
        onSuccess: () => {
            toast.success("Akses user berhasil diperbarui.")
            setSelectedUser(null)
            setEditor(null)
            setEditPassword("")
            setEditPasswordConfirm("")
            queryClient.invalidateQueries({ queryKey: ["superadmin", "users"] })
        },
        onError: () => {
            toast.error("Gagal memperbarui akses user.")
        },
    })

    const createUserMutation = useMutation({
        mutationFn: (payload: CreateUserPayload) => SuperadminService.createUser(payload),
        onSuccess: () => {
            toast.success("User berhasil dibuat.")
            setShowCreateDialog(false)
            queryClient.invalidateQueries({ queryKey: ["superadmin", "users"] })
        },
        onError: () => toast.error("Gagal membuat user."),
    })

    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => SuperadminService.deleteUser(id),
        onSuccess: () => {
            toast.success("User berhasil dihapus.")
            queryClient.invalidateQueries({ queryKey: ["superadmin", "users"] })
        },
        onError: () => toast.error("Gagal menghapus user."),
    })

    const handleEditAccess = (user: UserAccessItem) => {
        setSelectedUser(user)
        setEditPassword("")
        setEditPasswordConfirm("")
        setEditor({
            name: user.name,
            email: user.email,
            username: user.username ?? "",
            role_names: user.roles.length > 0 ? user.roles : ["dokter"],
            poli_scopes: user.poli_scopes,
        })
    }

    const handleSaveAccess = () => {
        if (!selectedUser || !editor) return
        if (editPassword || editPasswordConfirm) {
            if (editPassword.length < 8) {
                toast.error("Password baru minimal 8 karakter.")
                return
            }
            if (editPassword !== editPasswordConfirm) {
                toast.error("Konfirmasi password tidak sama.")
                return
            }
        }
        const basePayload: UpdateUserAccessPayload = {
            ...editor,
            username: editor.username || null,
            poli_scopes: editor.poli_scopes.map((item) => item.trim()).filter(Boolean),
        }
        if (editPassword) {
            basePayload.password = editPassword
            basePayload.password_confirmation = editPasswordConfirm
        }
        updateMutation.mutate({
            id: selectedUser.id,
            payload: basePayload,
        })
    }

    const { confirm, dialogProps } = useConfirmDialog()
    const { impersonate } = useAuth() // Access auth context

    const handleDeleteUser = (user: UserAccessItem) => {
        confirm({
            description: `Hapus user ${user.name}? Akun ini tidak dapat digunakan lagi setelah dihapus.`,
            onConfirm: () => deleteUserMutation.mutate(user.id),
        })
    }

    const handleImpersonate = async (user: UserAccessItem) => {
        confirm({
            title: "Impersonate User",
            description: `Anda akan login sebagai ${user.name}. Lanjutkan?`,
            confirmLabel: "Ya, Login",
            variant: "default",
            onConfirm: async () => {
                try {
                    toast.loading("Switching account...")
                    const response = await SuperadminService.impersonate(user.id)
                    await impersonate(response.token, response.user)
                    toast.dismiss()
                    toast.success(response.message)
                } catch (error) {
                    toast.dismiss()
                    toast.error("Gagal melakukan impersonate.")
                }
            },
        })
    }

    const userColumns = useMemo(
        () => buildUserAccessColumns(handleEditAccess, handleDeleteUser, handleImpersonate),
        []
    )

    return (
        <div className="space-y-6">
            <PageHeader title="Akses User" description="Cari, kelola, dan atur akses pengguna sistem." />

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Daftar Pengguna</CardTitle>
                    <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah User
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <Input
                            placeholder="Cari nama / email / username..."
                            value={userQuery}
                            onChange={(event) => setUserQuery(event.target.value)}
                        />
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {role.name.replace("_", " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={poliFilter} onValueChange={setPoliFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua poli" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua poli</SelectItem>
                                {polis.map((poli) => (
                                    <SelectItem key={poli.id} value={String(poli.id)}>
                                        {poli.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DataTable
                        columns={userColumns}
                        data={userResponse?.items ?? []}
                        searchKey="name"
                        isLoading={usersLoading}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={Boolean(selectedUser && editor)}
                onOpenChange={(open) =>
                    !open && (setSelectedUser(null), setEditor(null), setEditPassword(""), setEditPasswordConfirm(""))
                }
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ubah Akses User</DialogTitle>
                        <DialogDescription>
                            Kelola role, scope poli, identitas, dan (opsional) password baru untuk pengguna terpilih.
                        </DialogDescription>
                    </DialogHeader>
                    {editor && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nama</Label>
                                <Input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={editor.email} onChange={(event) => setEditor({ ...editor, email: event.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input
                                    value={editor.username ?? ""}
                                    onChange={(event) => setEditor({ ...editor, username: event.target.value })}
                                />
                            </div>
                            {editor.role_names.includes("dokter") && (
                                <div className="space-y-2">
                                    <Label>Kode dokter</Label>
                                    <Input
                                        readOnly
                                        disabled
                                        className="bg-muted"
                                        value={selectedUser.dokter_id ?? ""}
                                        placeholder="Simpan untuk mendapatkan kode otomatis (D-01, D-02, …)"
                                        title="Dibuat otomatis oleh sistem; dipakai di kunjungan dan laporan."
                                    />
                                </div>
                            )}
                            <div className="space-y-2 md:col-span-2">
                                <Label>Role</Label>
                                <Select
                                    value={editor.role_names[0] ?? ""}
                                    onValueChange={(value) => setEditor({ ...editor, role_names: [value] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name.replace("_", " ")}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Scope Poli (pisahkan dengan koma)</Label>
                                <Input
                                    placeholder="Umum, Gigi, KIA"
                                    value={editor.poli_scopes.join(", ")}
                                    onChange={(event) =>
                                        setEditor({
                                            ...editor,
                                            poli_scopes: event.target.value
                                                .split(",")
                                                .map((item) => item.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2 rounded-md border border-dashed border-muted-foreground/25 bg-muted/30 p-4">
                                <p className="text-sm font-medium text-foreground">Password baru (opsional)</p>
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan jika tidak ingin mengganti password. Minimal 8 karakter jika diisi.
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password">Password baru</Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            value={editPassword}
                                            onChange={(e) => setEditPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-password-confirm">Ulangi password</Label>
                                        <Input
                                            id="edit-password-confirm"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            value={editPasswordConfirm}
                                            onChange={(e) => setEditPasswordConfirm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => (setSelectedUser(null), setEditor(null))}>
                            Batal
                        </Button>
                        <Button onClick={handleSaveAccess} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateUserDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                roles={roles}
                polis={polis}
                loading={createUserMutation.isPending}
                onSubmit={(payload) => createUserMutation.mutate(payload)}
            />

            <ConfirmDialog {...dialogProps} />
        </div>
    )
}

function CreateUserDialog({
    open,
    onOpenChange,
    roles,
    polis,
    loading,
    onSubmit,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    roles: RoleAccess[]
    polis: MasterPoli[]
    loading: boolean
    onSubmit: (payload: CreateUserPayload) => void
}) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("password123")
    const [roleName, setRoleName] = useState("dokter")
    const [poliScope, setPoliScope] = useState("__none__")

    const handleSubmit = () => {
        onSubmit({
            name,
            email,
            username: username || null,
            password,
            role_names: [roleName],
            poli_scopes: poliScope !== "__none__" ? [poliScope] : [],
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah User Baru</DialogTitle>
                    <DialogDescription>Isi data user. Setelah dibuat, user bisa langsung login.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nama</Label>
                            <Input placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input placeholder="email@klinik.id" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input placeholder="Opsional" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input placeholder="Password awal" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={roleName} onValueChange={setRoleName}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Scope Poli</Label>
                            <Select value={poliScope} onValueChange={setPoliScope}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Scope Poli" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Tanpa scope</SelectItem>
                                    {polis.map((p) => (
                                        <SelectItem key={p.id} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !name || !email || !password}>
                        {loading ? "Menyimpan..." : "Tambah User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

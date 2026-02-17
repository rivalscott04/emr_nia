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
import type { CreateUserPayload, MasterPoli, RoleAccess, UpdateUserAccessPayload, UserAccessItem } from "../../types/superadmin"

export default function SuperadminPage() {
    const queryClient = useQueryClient()

    const [userQuery, setUserQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [poliFilter, setPoliFilter] = useState("all")
    const [selectedUser, setSelectedUser] = useState<UserAccessItem | null>(null)
    const [editor, setEditor] = useState<UpdateUserAccessPayload | null>(null)
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
        setEditor({
            name: user.name,
            email: user.email,
            username: user.username ?? "",
            dokter_id: user.dokter_id ?? "",
            role_names: user.roles.length > 0 ? user.roles : ["dokter"],
            poli_scopes: user.poli_scopes,
        })
    }

    const handleSaveAccess = () => {
        if (!selectedUser || !editor) return
        updateMutation.mutate({
            id: selectedUser.id,
            payload: {
                ...editor,
                username: editor.username || null,
                dokter_id: editor.dokter_id || null,
                poli_scopes: editor.poli_scopes.map((item) => item.trim()).filter(Boolean),
            },
        })
    }

    const handleDeleteUser = (user: UserAccessItem) => {
        if (confirm(`Hapus user ${user.name}?`)) {
            deleteUserMutation.mutate(user.id)
        }
    }

    const userColumns = useMemo(() => buildUserAccessColumns(handleEditAccess, handleDeleteUser), [])

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

            <Dialog open={Boolean(selectedUser && editor)} onOpenChange={(open) => !open && (setSelectedUser(null), setEditor(null))}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Ubah Akses User</DialogTitle>
                        <DialogDescription>Kelola role, scope poli, dan identitas akses untuk pengguna terpilih.</DialogDescription>
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
                            <div className="space-y-2">
                                <Label>Dokter ID (opsional)</Label>
                                <Input
                                    placeholder="Contoh: D-01"
                                    value={editor.dokter_id ?? ""}
                                    onChange={(event) => setEditor({ ...editor, dokter_id: event.target.value })}
                                />
                            </div>
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
            dokter_id: null,
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

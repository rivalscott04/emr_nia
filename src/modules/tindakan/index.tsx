import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth/auth-context"
import { PageHeader } from "../../components/layout/page-header"
import { Button } from "../../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { TindakanService } from "../../services/tindakan-service"
import type { TindakanItem, TindakanCreatePayload, TindakanUpdatePayload } from "../../types/tindakan"
import { toast } from "sonner"
import { ConfirmDialog, useConfirmDialog } from "../../components/ui/confirm-dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { formatIdr } from "../../lib/locale-format"
import { LIST_LIMIT_MASTER } from "../../lib/list-limits"

function buildColumns(
    canManage: boolean,
    onEdit: (row: TindakanItem) => void,
    onDelete: (row: TindakanItem) => void
): ColumnDef<TindakanItem>[] {
    const cols: ColumnDef<TindakanItem>[] = [
        {
            accessorKey: "kode",
            header: "Kode",
            cell: ({ row }) => <span className="font-mono font-semibold">{row.getValue("kode")}</span>,
        },
        { accessorKey: "nama", header: "Nama Tindakan" },
        {
            accessorKey: "kategori",
            header: "Kategori",
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-normal">
                    {row.getValue("kategori")}
                </Badge>
            ),
        },
        {
            accessorKey: "tarif",
            header: "Tarif",
            cell: ({ row }) => formatIdr(Number(row.getValue("tarif"))),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default" className="bg-emerald-600">Aktif</Badge>
                ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                ),
        },
    ]
    if (canManage) {
        cols.push({
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(row.original)} title="Ubah">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)} title="Hapus">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        })
    }
    return cols
}

export default function TindakanPage() {
    const queryClient = useQueryClient()
    const { hasPermission } = useAuth()
    const canManage = hasPermission("master_tindakan.manage")

    const [search, setSearch] = useState("")
    const [kategoriFilter, setKategoriFilter] = useState("")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editing, setEditing] = useState<TindakanItem | null>(null)
    const [editForm, setEditForm] = useState<TindakanUpdatePayload | null>(null)

    const { data: categories = [] } = useQuery({
        queryKey: ["tindakan", "categories"],
        queryFn: () => TindakanService.getCategories(),
    })

    const { data: listResponse, isLoading } = useQuery({
        queryKey: ["tindakan", "list", search, kategoriFilter],
        queryFn: () =>
            TindakanService.getList({
                q: search || undefined,
                kategori: kategoriFilter || undefined,
                limit: LIST_LIMIT_MASTER,
                include_inactive: true,
            }),
    })

    const createMutation = useMutation({
        mutationFn: (payload: TindakanCreatePayload) => TindakanService.create(payload),
        onSuccess: () => {
            toast.success("Tindakan berhasil ditambahkan.")
            setShowCreateDialog(false)
            queryClient.invalidateQueries({ queryKey: ["tindakan"] })
        },
        onError: (e: Error) => toast.error(e.message || "Gagal menambahkan tindakan."),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: TindakanUpdatePayload }) =>
            TindakanService.update(id, payload),
        onSuccess: () => {
            toast.success("Tindakan berhasil diperbarui.")
            setEditing(null)
            setEditForm(null)
            queryClient.invalidateQueries({ queryKey: ["tindakan"] })
        },
        onError: (e: Error) => toast.error(e.message || "Gagal memperbarui tindakan."),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => TindakanService.delete(id),
        onSuccess: () => {
            toast.success("Tindakan berhasil dihapus.")
            queryClient.invalidateQueries({ queryKey: ["tindakan"] })
        },
        onError: (e: Error) => toast.error(e.message || "Gagal menghapus tindakan."),
    })

    const { confirm, dialogProps } = useConfirmDialog()

    const handleDelete = (row: TindakanItem) => {
        confirm({
            description: `Yakin menghapus tindakan "${row.nama}" (${row.kode})?`,
            onConfirm: () => deleteMutation.mutate(row.id),
        })
    }

    const handleEdit = (row: TindakanItem) => {
        setEditing(row)
        setEditForm({
            kode: row.kode,
            nama: row.nama,
            kategori: row.kategori,
            tarif: row.tarif,
            is_active: row.is_active,
        })
    }

    const handleSaveEdit = () => {
        if (!editing || !editForm) return
        updateMutation.mutate({ id: editing.id, payload: editForm })
    }

    const data = listResponse?.data ?? []
    const total = listResponse?.total ?? 0
    const columns = buildColumns(canManage, handleEdit, handleDelete)

    const allCategories = useMemo(
        () => [...categories].sort((a, b) => a.localeCompare(b, "id")),
        [categories]
    )

    return (
        <div className="space-y-6">
            <PageHeader
                title="Master Tindakan"
                description="Daftar referensi tindakan medis (ICD-9 CM atau kode internal) untuk tarif dan billing di klinik/rumah sakit."
                action={
                    canManage ? (
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Tindakan
                        </Button>
                    ) : undefined
                }
            />

            <div className="flex flex-wrap gap-4 items-center">
                <Input
                    placeholder="Cari kode atau nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <select
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                    <option value="">Semua kategori</option>
                    {allCategories.map((k) => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
            </div>

            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
            />

            {/* Create Dialog */}
            <CreateTindakanDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                categories={allCategories}
                loading={createMutation.isPending}
                onSubmit={(payload) => createMutation.mutate(payload)}
            />

            {/* Edit Dialog */}
            <Dialog open={Boolean(editing && editForm)} onOpenChange={(open) => !open && (setEditing(null), setEditForm(null))}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ubah Tindakan</DialogTitle>
                        <DialogDescription>Perbarui kode, nama, kategori, tarif, atau status aktif.</DialogDescription>
                    </DialogHeader>
                    {editForm && (
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Kode</Label>
                                <Input
                                    value={editForm.kode ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, kode: e.target.value })}
                                    placeholder="Contoh: 89.03"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nama Tindakan</Label>
                                <Input
                                    value={editForm.nama ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                                    placeholder="Nama tindakan"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Input
                                    value={editForm.kategori ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })}
                                    placeholder="Nama kategori / poli"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tarif (IDR)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={editForm.tarif ?? 0}
                                    onChange={(e) => setEditForm({ ...editForm, tarif: Number(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={editForm.is_active ?? true}
                                    onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: Boolean(checked) })}
                                />
                                <Label htmlFor="edit-active">Aktif</Label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => (setEditing(null), setEditForm(null))}>
                            Batal
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog {...dialogProps} />
        </div>
    )
}

function CreateTindakanDialog({
    open,
    onOpenChange,
    categories,
    loading,
    onSubmit,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: string[]
    loading: boolean
    onSubmit: (payload: TindakanCreatePayload) => void
}) {
    const [kode, setKode] = useState("")
    const [nama, setNama] = useState("")
    const [kategori, setKategori] = useState("")
    const [tarif, setTarif] = useState<number>(0)

    useEffect(() => {
        if (!open) return
        setKode("")
        setNama("")
        setKategori("")
        setTarif(0)
    }, [open])

    const handleSubmit = () => {
        if (!kode.trim() || !nama.trim()) {
            toast.error("Kode dan nama wajib diisi.")
            return
        }
        if (!kategori.trim()) {
            toast.error("Kategori wajib diisi (biasanya sama dengan nama poli).")
            return
        }
        onSubmit({
            kode: kode.trim(),
            nama: nama.trim(),
            kategori: kategori.trim(),
            tarif: Number(tarif) || 0,
            is_active: true,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Tindakan Baru</DialogTitle>
                    <DialogDescription>
                        Isi kode (ICD-9 CM atau kode internal), nama, kategori, dan tarif. Kode harus unik.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Kode</Label>
                        <Input
                            value={kode}
                            onChange={(e) => setKode(e.target.value)}
                            placeholder="Contoh: 89.03, 23.2"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Nama Tindakan</Label>
                        <Input
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Nama tindakan medis"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <Input
                            list="tindakan-create-kategori-dl"
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            placeholder="Ketik atau pilih dari saran (nama poli)"
                        />
                        <datalist id="tindakan-create-kategori-dl">
                            {categories.map((k) => (
                                <option key={k} value={k} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <Label>Tarif (IDR)</Label>
                        <Input
                            type="number"
                            min={0}
                            value={tarif || ""}
                            onChange={(e) => setTarif(Number(e.target.value) || 0)}
                            placeholder="0"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Menambah..." : "Tambah"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

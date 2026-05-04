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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { buildIcdColumns } from "./column-def"
import { SuperadminService } from "../../services/superadmin-service"
import { toast } from "sonner"
import { ConfirmDialog, useConfirmDialog } from "../../components/ui/confirm-dialog"
import { LIST_LIMIT_ICD } from "../../lib/list-limits"
import { formatIdInteger } from "../../lib/locale-format"
import type { MasterIcdCode } from "../../types/superadmin"

type IcdPayload = { type: "ICD-9" | "ICD-10"; code: string; name: string; is_active: boolean }

export default function SuperadminMasterIcdPage() {
    const queryClient = useQueryClient()

    const [icdType, setIcdType] = useState<"all" | "ICD-9" | "ICD-10">("all")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editItem, setEditItem] = useState<MasterIcdCode | null>(null)

    const { data: icdResponse, isLoading } = useQuery({
        queryKey: ["superadmin", "icd", icdType],
        queryFn: () =>
            SuperadminService.getMasterIcd({ type: icdType === "all" ? undefined : icdType, limit: LIST_LIMIT_ICD }),
    })

    const createMutation = useMutation({
        mutationFn: (payload: IcdPayload) => SuperadminService.createMasterIcd(payload),
        onSuccess: () => {
            toast.success("ICD berhasil ditambahkan.")
            setShowCreateDialog(false)
            queryClient.invalidateQueries({ queryKey: ["superadmin", "icd"] })
        },
        onError: () => toast.error("Gagal menambahkan ICD."),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: IcdPayload }) => SuperadminService.updateMasterIcd(id, payload),
        onSuccess: () => {
            toast.success("ICD berhasil diperbarui.")
            setEditItem(null)
            queryClient.invalidateQueries({ queryKey: ["superadmin", "icd"] })
        },
        onError: () => toast.error("Gagal memperbarui ICD."),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => SuperadminService.deleteMasterIcd(id),
        onSuccess: () => {
            toast.success("ICD berhasil dihapus.")
            queryClient.invalidateQueries({ queryKey: ["superadmin", "icd"] })
        },
        onError: () => toast.error("Gagal menghapus ICD."),
    })

    const { confirm, dialogProps } = useConfirmDialog()

    const handleDelete = (item: MasterIcdCode) => {
        confirm({
            description: `Hapus ICD ${item.code} - ${item.name}? Data yang sudah dihapus tidak dapat dikembalikan.`,
            onConfirm: () => deleteMutation.mutate(item.id),
        })
    }

    const columns = useMemo(() => buildIcdColumns((item) => setEditItem(item), handleDelete), [])

    return (
        <div className="space-y-6">
            <PageHeader title="Master ICD" description="Kelola master kode ICD-9 dan ICD-10 untuk form diagnosa." />

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">Daftar ICD</CardTitle>
                        {!isLoading && icdResponse && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                {formatIdInteger(icdResponse.total)} data
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={icdType} onValueChange={(v) => setIcdType(v as "all" | "ICD-9" | "ICD-10")}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Semua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="ICD-10">ICD-10</SelectItem>
                                <SelectItem value="ICD-9">ICD-9</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Tambah ICD
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={icdResponse?.items ?? []}
                        searchKey="code"
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            <IcdFormDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                defaultType={icdType === "all" ? "ICD-10" : icdType}
                loading={createMutation.isPending}
                onSubmit={(payload) => createMutation.mutate(payload)}
                title="Tambah ICD Baru"
                description="Masukkan data kode ICD baru."
            />

            <IcdFormDialog
                open={Boolean(editItem)}
                onOpenChange={(open) => !open && setEditItem(null)}
                defaultType={editItem?.type ?? (icdType === "all" ? "ICD-10" : icdType)}
                defaultCode={editItem?.code}
                defaultName={editItem?.name}
                defaultIsActive={editItem?.is_active}
                loading={updateMutation.isPending}
                onSubmit={(payload) => editItem && updateMutation.mutate({ id: editItem.id, payload })}
                title="Ubah ICD"
                description={`Edit data ICD ${editItem?.code ?? ""}.`}
                submitLabel="Simpan Perubahan"
            />

            <ConfirmDialog {...dialogProps} />
        </div>
    )
}

function IcdFormDialog({
    open,
    onOpenChange,
    defaultType,
    defaultCode = "",
    defaultName = "",
    defaultIsActive = true,
    loading,
    onSubmit,
    title,
    description,
    submitLabel = "Tambah ICD",
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultType: "ICD-9" | "ICD-10"
    defaultCode?: string
    defaultName?: string
    defaultIsActive?: boolean
    loading: boolean
    onSubmit: (payload: IcdPayload) => void
    title: string
    description: string
    submitLabel?: string
}) {
    const [type, setType] = useState(defaultType)
    const [code, setCode] = useState(defaultCode)
    const [name, setName] = useState(defaultName)
    const [isActive, setIsActive] = useState(defaultIsActive)

    // Sync state when dialog opens or props change (edit mode)
    useEffect(() => {
        if (open) {
            setType(defaultType)
            setCode(defaultCode)
            setName(defaultName)
            setIsActive(defaultIsActive)
        }
    }, [open, defaultType, defaultCode, defaultName, defaultIsActive])

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Tipe</Label>
                        <Select value={type} onValueChange={(v) => setType(v as "ICD-9" | "ICD-10")}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ICD-10">ICD-10</SelectItem>
                                <SelectItem value="ICD-9">ICD-9</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Kode</Label>
                        <Input placeholder="Contoh: A00.1" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input placeholder="Nama diagnosa / prosedur" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button
                        onClick={() => onSubmit({ type, code, name, is_active: isActive })}
                        disabled={loading || !code || !name}
                    >
                        {loading ? "Menyimpan..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { PageHeader } from "../../components/layout/page-header"
import { Eye, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { RekamMedisService } from "../../services/rekam-medis-service"
import type { RekamMedisListItem } from "../../types/rekam-medis"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { toast } from "sonner"
import { ApiError } from "../../lib/api-client"
import { useAuth } from "../auth/auth-context"
import { ConfirmDialog, useConfirmDialog } from "../../components/ui/confirm-dialog"

export default function RekamMedisListPage() {
    const queryClient = useQueryClient()
    const { hasPermission } = useAuth()

    const { data = [], isLoading } = useQuery({
        queryKey: ["rekam-medis-list"],
        queryFn: RekamMedisService.getAll,
    })

    const deleteMutation = useMutation({
        mutationFn: (kunjunganId: string) => RekamMedisService.deleteByKunjunganId(kunjunganId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rekam-medis-list"] })
            toast.success("Draft rekam medis berhasil dihapus")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal menghapus draft rekam medis"
            toast.error(message)
        },
    })

    const { confirm, dialogProps } = useConfirmDialog()

    const handleDeleteDraft = (rm: RekamMedisListItem) => {
        confirm({
            description: "Hapus draft rekam medis untuk kunjungan ini? Anda bisa buat lagi dari menu Kunjungan.",
            onConfirm: () => deleteMutation.mutate(rm.kunjungan_id),
        })
    }

    const canWrite = hasPermission("rekam_medis.write")

    const columns: ColumnDef<RekamMedisListItem>[] = [
        {
            accessorKey: "tanggal",
            header: "Tanggal",
        },
        {
            accessorKey: "no_rm",
            header: "No. RM",
        },
        {
            accessorKey: "pasien_nama",
            header: "Nama Pasien",
        },
        {
            accessorKey: "diagnosa_utama",
            header: "Diagnosa Utama",
        },
        {
            accessorKey: "dokter",
            header: "Dokter",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.status === "Final" ? "success" : "neutral"}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const rm = row.original
                const isDraft = rm.status === "Draft"
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Menu aksi">
                                <MoreHorizontal className="h-4 w-4" aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link to={`/rekam-medis/${rm.kunjungan_id}`}>
                                    <Eye className="mr-2 h-4 w-4" aria-hidden />
                                    Lihat
                                </Link>
                            </DropdownMenuItem>
                            {isDraft && (
                                <DropdownMenuItem asChild>
                                    <Link to={`/rekam-medis/${rm.kunjungan_id}`}>
                                        <Pencil className="mr-2 h-4 w-4" aria-hidden />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {canWrite && isDraft && (
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        handleDeleteDraft(rm)
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                                    Hapus Draft
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Riwayat Rekam Medis"
                description="Daftar riwayat pemeriksaan pasien."
                action={
                    <Button asChild>
                        <Link to="/kunjungan">
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            Buat Rekam Medis
                        </Link>
                    </Button>
                }
            />

            <DataTable columns={columns} data={data} searchKey="pasien_nama" isLoading={isLoading} />

            <ConfirmDialog {...dialogProps} />
        </div>
    )
}

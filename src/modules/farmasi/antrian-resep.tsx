import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "../../components/layout/page-header"
import { DataTable } from "../../components/ui/data-table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog"
import { FarmasiService } from "../../services/farmasi-service"
import type { ResepAntrianItem, ResepDetailFarmasi, ResepStatusFarmasi } from "../../types/farmasi"
import { toast } from "sonner"
import { Printer } from "lucide-react"
import { printResep } from "./print-resep"

const statusVariant: Record<ResepStatusFarmasi, "warning" | "info" | "success"> = {
    Waiting: "warning",
    Processed: "info",
    Done: "success",
}

const statusLabel: Record<ResepStatusFarmasi, string> = {
    Waiting: "Menunggu",
    Processed: "Diproses",
    Done: "Selesai",
}

function formatWaktu(waktu: string | null | undefined): string {
    if (!waktu) return "—"
    return waktu
}

export default function AntrianResepPage() {
    const queryClient = useQueryClient()
    const [statusFilter, setStatusFilter] = useState<ResepStatusFarmasi | "">("")
    const [tanggalFilter, setTanggalFilter] = useState("")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ["farmasi", "antrian", statusFilter || undefined, tanggalFilter || undefined],
        queryFn: () =>
            FarmasiService.getAntrian({
                status: statusFilter || undefined,
                tanggal: tanggalFilter || undefined,
                limit: 50,
            }),
    })

    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ["farmasi", "resep-detail", selectedId],
        queryFn: () => FarmasiService.getDetail(selectedId!),
        enabled: !!selectedId,
    })

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "Processed" | "Done" }) =>
            FarmasiService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["farmasi", "antrian"] })
            queryClient.invalidateQueries({ queryKey: ["farmasi", "resep-detail", selectedId ?? ""] })
            toast.success("Status resep diperbarui.")
        },
        onError: (err: Error) => {
            toast.error(err.message || "Gagal memperbarui status.")
        },
    })

    const items = data?.data ?? []
    const columns: ColumnDef<ResepAntrianItem>[] = [
        {
            accessorKey: "waktu",
            header: "Waktu",
            cell: ({ row }) => formatWaktu(row.original.waktu),
        },
        { accessorKey: "no_resep", header: "No. Resep" },
        { accessorKey: "pasien", header: "Pasien" },
        { accessorKey: "dokter", header: "Dokter" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={statusVariant[row.original.status]}>
                    {statusLabel[row.original.status]}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(row.original.id)
                    }}
                >
                    Lihat / Proses
                </Button>
            ),
        },
    ]

    const handleProses = (status: "Processed" | "Done") => {
        if (!selectedId) return
        updateStatusMutation.mutate({ id: selectedId, status })
    }

    const canProses = detail && (detail.status === "Waiting" || detail.status === "Processed")
    const loading = updateStatusMutation.isPending

    return (
        <div className="space-y-6">
            <PageHeader
                title="Antrian Resep"
                description="Resep yang dikirim dari poli. Proses dan tandai selesai setelah obat diserahkan."
            />

            <div className="flex flex-wrap items-center gap-4">
                <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter((e.target.value || "") as ResepStatusFarmasi | "")}
                >
                    <option value="">Semua status</option>
                    <option value="Waiting">Menunggu</option>
                    <option value="Processed">Diproses</option>
                    <option value="Done">Selesai</option>
                </select>
                <input
                    type="date"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={tanggalFilter}
                    onChange={(e) => setTanggalFilter(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={items}
                searchKey="pasien"
                isLoading={isLoading}
                onRowClick={(row) => setSelectedId(row.id)}
            />

            <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <DialogTitle className="pr-8">Detail Resep {detail?.no_resep ?? selectedId}</DialogTitle>
                        {detail && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => printResep(detail)}
                                title="Cetak Resep"
                                className="shrink-0 -mr-2 -mt-1"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        )}
                    </DialogHeader>
                    {detailLoading && !detail ? (
                        <p className="text-sm text-muted-foreground">Memuat...</p>
                    ) : detail ? (
                        <ResepDetailContent detail={detail} />
                    ) : null}
                    {detail && canProses && (
                        <DialogFooter className="gap-2 sm:gap-2">
                            {detail.status === "Waiting" && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleProses("Processed")}
                                    disabled={loading}
                                >
                                    Tandai Diproses
                                </Button>
                            )}
                            <Button
                                onClick={() => handleProses("Done")}
                                disabled={loading}
                            >
                                Tandai Selesai (Diserahkan)
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ResepDetailContent({ detail }: { detail: ResepDetailFarmasi }) {
    const hasAlergi = detail.pasien.allergies && detail.pasien.allergies.length > 0
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-slate-900">{detail.pasien.nama}</p>
                <p className="text-muted-foreground">No. RM: {detail.pasien.no_rm}</p>
                {hasAlergi && (
                    <p className="mt-2 text-warning font-medium">
                        Alergi: {detail.pasien.allergies.join(", ")}
                    </p>
                )}
            </div>
            <p className="text-sm text-muted-foreground">Dokter: {detail.dokter}</p>
            <div>
                <p className="mb-2 text-sm font-medium text-slate-900">Item Resep</p>
                <ul className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                    {detail.items.map((item, i) => (
                        <li key={item.id ?? i} className="text-sm">
                            <span className="font-medium">{item.nama_obat}</span>
                            {" — "}
                            {item.jumlah}, aturan: {item.aturan_pakai}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

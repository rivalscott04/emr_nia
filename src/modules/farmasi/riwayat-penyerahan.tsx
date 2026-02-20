import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "../../components/layout/page-header"
import { DataTable } from "../../components/ui/data-table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { FarmasiService } from "../../services/farmasi-service"
import type { ResepAntrianItem, ResepDetailFarmasi } from "../../types/farmasi"
import { Button } from "../../components/ui/button"
import { Printer } from "lucide-react"
import { printResep } from "./print-resep"

function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return "—"
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(iso))
}

export default function RiwayatPenyerahanPage() {
    const [tanggalFilter, setTanggalFilter] = useState("")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ["farmasi", "riwayat", tanggalFilter || undefined],
        queryFn: () =>
            FarmasiService.getRiwayat({
                tanggal: tanggalFilter || undefined,
                limit: 50,
            }),
    })

    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ["farmasi", "resep-detail", selectedId],
        queryFn: () => FarmasiService.getDetail(selectedId!),
        enabled: !!selectedId,
    })

    const items = data?.data ?? []
    const columns: ColumnDef<ResepAntrianItem>[] = [
        { accessorKey: "waktu", header: "Waktu" },
        { accessorKey: "no_resep", header: "No. Resep" },
        { accessorKey: "pasien", header: "Pasien" },
        { accessorKey: "dokter", header: "Dokter" },
        {
            accessorKey: "farmasi_done_at",
            header: "Waktu Selesai",
            cell: ({ row }) => formatDateTime(row.original.farmasi_done_at ?? undefined),
        },
        {
            accessorKey: "farmasi_done_by",
            header: "Diserahkan oleh",
            cell: ({ row }) => row.original.farmasi_done_by ?? "—",
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Riwayat Penyerahan"
                description="Daftar resep yang sudah diserahkan ke pasien."
            />

            <div className="flex flex-wrap items-center gap-4">
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
            {detail.farmasi_done_at && (
                <p className="text-sm text-muted-foreground">
                    Diserahkan: {formatDateTime(detail.farmasi_done_at)} oleh {detail.farmasi_done_by ?? "—"}
                </p>
            )}
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

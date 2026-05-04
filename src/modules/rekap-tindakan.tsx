import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { KunjunganService } from "../services/kunjungan-service"
import { RekamMedisService } from "../services/rekam-medis-service"
import { DataTable } from "../components/ui/data-table"
import { Button } from "../components/ui/button"
import { PageHeader } from "../components/layout/page-header"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Kunjungan } from "../types/kunjungan"
import { ApiError } from "../lib/api-client"
import { formatIdr } from "../lib/locale-format"
import { LIST_LIMIT_MASTER } from "../lib/list-limits"

function is404(e: unknown): boolean {
    return e instanceof ApiError && e.status === 404
}

export default function RekapTindakanPage() {
    const [rekapModalOpen, setRekapModalOpen] = useState(false)
    const [selectedKunjungan, setSelectedKunjungan] = useState<Kunjungan | null>(null)

    const { data, isLoading } = useQuery({
        queryKey: ["kunjungan", { status: "COMPLETED" }],
        queryFn: () => KunjunganService.getList({ status: "COMPLETED", limit: LIST_LIMIT_MASTER }),
    })
    const kunjungan = data?.items ?? []

    const { data: rekap, isLoading: rekapLoading, isError: rekapError } = useQuery({
        queryKey: ["rekam-medis", "rekap", selectedKunjungan?.id],
        queryFn: () => RekamMedisService.getRekapByKunjunganId(selectedKunjungan!.id),
        enabled: rekapModalOpen && !!selectedKunjungan?.id,
        retry: (_, error) => !is404(error),
    })

    function openRekap(k: Kunjungan) {
        setSelectedKunjungan(k)
        setRekapModalOpen(true)
    }

    function closeRekap() {
        setRekapModalOpen(false)
        setSelectedKunjungan(null)
    }

    const columns: ColumnDef<Kunjungan>[] = [
        {
            accessorKey: "tanggal",
            header: "Tanggal",
            cell: ({ row }) => new Date(row.getValue("tanggal")).toLocaleString("id-ID"),
        },
        { accessorKey: "pasien_nama", header: "Pasien" },
        { accessorKey: "poli", header: "Poli" },
        { accessorKey: "dokter_nama", header: "Dokter" },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const k = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Menu aksi">
                                <MoreHorizontal className="h-4 w-4" aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openRekap(k)}>
                                Lihat Rekap
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/kunjungan/${k.id}`}>Lihat Detail</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                title="Rekap Tindakan & Biaya"
                description="Daftar kunjungan selesai. Klik Lihat Rekap untuk melihat tindakan dan perkiraan biaya (untuk billing admin poli)."
            />

            <DataTable columns={columns} data={kunjungan} searchKey="pasien_nama" isLoading={isLoading} />

            <Dialog open={rekapModalOpen} onOpenChange={(open) => !open && closeRekap()}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Rekap Tindakan & Biaya</DialogTitle>
                        <DialogDescription>
                            {selectedKunjungan ? (
                                <>
                                    {selectedKunjungan.pasien_nama} · {selectedKunjungan.poli} ·{" "}
                                    {selectedKunjungan.tanggal
                                        ? new Date(selectedKunjungan.tanggal).toLocaleString("id-ID")
                                        : ""}
                                </>
                            ) : (
                                ""
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        {rekapLoading && <p className="text-sm text-muted-foreground">Memuat rekap…</p>}
                        {rekapError && (
                            <p className="text-sm text-muted-foreground">
                                Rekap belum tersedia (rekam medis belum difinalisasi).
                            </p>
                        )}
                        {rekap && !rekapLoading && !rekapError && (
                            <>
                                {rekap.tindakan.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Tidak ada tindakan tercatat.</p>
                                ) : (
                                    <div className="rounded-md border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left font-medium p-2 w-8">No</th>
                                                    <th className="text-left font-medium p-2">Kode</th>
                                                    <th className="text-left font-medium p-2">Nama Tindakan</th>
                                                    <th className="text-right font-medium p-2">Tarif</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rekap.tindakan.map((item, idx) => (
                                                    <tr key={`${item.code}-${idx}`} className="border-b last:border-0">
                                                        <td className="p-2">{idx + 1}</td>
                                                        <td className="p-2 font-mono text-muted-foreground">{item.code}</td>
                                                        <td className="p-2">{item.name}</td>
                                                        <td className="p-2 text-right tabular-nums">
                                                            {item.tarif > 0 ? formatIdr(item.tarif) : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="flex justify-end items-center gap-2 border-t bg-muted/30 px-3 py-2">
                                            <span className="text-sm font-medium">Total Biaya:</span>
                                            <span className="font-semibold tabular-nums">
                                                {formatIdr(rekap.total_biaya)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

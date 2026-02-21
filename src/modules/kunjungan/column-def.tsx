import type { ColumnDef } from "@tanstack/react-table"
import type { Kunjungan, KunjunganStatus } from "../../types/kunjungan"
import { KUNJUNGAN_STATUS_LABELS } from "../../types/kunjungan"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { MoreHorizontal, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Link } from "react-router-dom"

const statusBadgeVariant: Record<KunjunganStatus, "default" | "secondary" | "success" | "destructive" | "info"> = {
    OPEN: "default",
    SEDANG_DIPERIKSA: "info",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

export type KunjunganColumnsOptions = {
    onStatusChange: (id: string, status: KunjunganStatus) => void
    canChangeStatus: boolean
}

export function getColumns(opts: KunjunganColumnsOptions): ColumnDef<Kunjungan>[] {
    const { onStatusChange, canChangeStatus } = opts

    return [
        {
            accessorKey: "tanggal",
            header: "Tanggal",
            cell: ({ row }) => new Date(row.getValue("tanggal")).toLocaleString("id-ID"),
        },
        {
            accessorKey: "pasien_nama",
            header: "Pasien",
        },
        {
            accessorKey: "poli",
            header: "Poli",
        },
        {
            accessorKey: "kunjungan_ke",
            header: "Ke",
            cell: ({ row }) => {
                const ke = row.original.kunjungan_ke
                return ke != null ? `Ke-${ke}` : "—"
            },
        },
        {
            accessorKey: "dokter_nama",
            header: "Dokter",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const kunjungan = row.original
                const status = row.getValue("status") as KunjunganStatus
                const label = status ? KUNJUNGAN_STATUS_LABELS[status] ?? status : "-"
                const variant = status ? statusBadgeVariant[status] ?? "default" : "default"
                const canChange = canChangeStatus && status !== "COMPLETED" && status !== "CANCELLED"

                if (canChange) {
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto py-1 px-0 gap-1 hover:bg-transparent">
                                    <Badge variant={variant} className="cursor-pointer font-normal">
                                        {label}
                                    </Badge>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Ubah status</DropdownMenuLabel>
                                {status === "OPEN" && (
                                    <DropdownMenuItem onClick={() => onStatusChange(kunjungan.id, "SEDANG_DIPERIKSA")}>
                                        Panggil / Masuk Ruangan
                                    </DropdownMenuItem>
                                )}
                                {status === "SEDANG_DIPERIKSA" && (
                                    <DropdownMenuItem onClick={() => onStatusChange(kunjungan.id, "COMPLETED")}>
                                        Selesai Periksa
                                    </DropdownMenuItem>
                                )}
                                {(status === "OPEN" || status === "SEDANG_DIPERIKSA") && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => onStatusChange(kunjungan.id, "CANCELLED")}
                                        >
                                            Batalkan Kunjungan
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }
                return (
                    <Badge variant={variant}>
                        {label}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const kunjungan = row.original
                const status = kunjungan.status

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
                                <Link to={`/kunjungan/${kunjungan.id}`}>Lihat Detail</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/rekam-medis/${kunjungan.id}`}>Isi Rekam Medis</Link>
                            </DropdownMenuItem>
                            {canChangeStatus && status !== "COMPLETED" && status !== "CANCELLED" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Ubah status</DropdownMenuLabel>
                                    {status === "OPEN" && (
                                        <DropdownMenuItem onClick={() => onStatusChange(kunjungan.id, "SEDANG_DIPERIKSA")}>
                                            Panggil / Masuk Ruangan
                                        </DropdownMenuItem>
                                    )}
                                    {status === "SEDANG_DIPERIKSA" && (
                                        <DropdownMenuItem onClick={() => onStatusChange(kunjungan.id, "COMPLETED")}>
                                            Selesai Periksa
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => onStatusChange(kunjungan.id, "CANCELLED")}
                                    >
                                        Batalkan Kunjungan
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}

/** Columns tanpa callback (badge & menu ubah status tidak aktif). Untuk fallback. */
export const columns: ColumnDef<Kunjungan>[] = getColumns({
    onStatusChange: () => {},
    canChangeStatus: false,
})

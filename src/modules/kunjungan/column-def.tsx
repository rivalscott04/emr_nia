import type { ColumnDef } from "@tanstack/react-table"
import type { Kunjungan } from "../../types/kunjungan"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Link } from "react-router-dom"

export const columns: ColumnDef<Kunjungan>[] = [
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
        accessorKey: "dokter_nama",
        header: "Dokter",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "COMPLETED" ? "success" : status === "CANCELLED" ? "destructive" : "default"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const kunjungan = row.original

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
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

import type { ColumnDef } from "@tanstack/react-table"
import type { Pasien } from "../../types/pasien"
import { Button } from "../../components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Link } from "react-router-dom"
import { useAuth } from "../../modules/auth/auth-context"

export const columns: ColumnDef<Pasien>[] = [
    {
        accessorKey: "no_rm",
        header: "No. RM",
    },
    {
        accessorKey: "nik",
        header: "NIK",
    },
    {
        accessorKey: "nama",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nama
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "jenis_kelamin",
        header: "L/P",
        cell: ({ row }) => row.getValue("jenis_kelamin") === "L" ? "Laki-laki" : "Perempuan",
    },
    {
        accessorKey: "tanggal_lahir",
        header: "Tgl Lahir",
        cell: ({ row }) => {
            const date = new Date(row.getValue("tanggal_lahir"))
            return new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium"
            }).format(date)
        }
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const pasien = row.original
            return <PasienActionsCell pasien={pasien} />
        },
    },
]

function PasienActionsCell({ pasien }: { pasien: Pasien }) {
    const { hasPermission } = useAuth()
    const canCreateKunjungan = hasPermission("kunjungan.write")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Menu aksi">
                    <MoreHorizontal className="h-4 w-4" aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(pasien.nik)}
                >
                    Copy NIK
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to={`/pasien/${pasien.id}`}>Lihat Detail</Link>
                </DropdownMenuItem>
                {canCreateKunjungan && (
                    <DropdownMenuItem asChild>
                        <Link to={`/kunjungan/create?pasienId=${pasien.id}`}>Buat Kunjungan</Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

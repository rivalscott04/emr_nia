import { useQuery } from "@tanstack/react-query"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "../../components/ui/badge"
import { PageHeader } from "../../components/layout/page-header"
import { Eye } from "lucide-react"
import { Link } from "react-router-dom"
import { RekamMedisService } from "../../services/rekam-medis-service"
import type { RekamMedisListItem } from "../../types/rekam-medis"

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
            <Badge variant={row.original.status === 'Final' ? 'success' : 'neutral'}>
                {row.original.status}
            </Badge>
        )
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const rm = row.original
            return (
                <Link
                    to={`/rekam-medis/${rm.kunjungan_id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                    aria-label="Lihat detail"
                >
                    <Eye className="h-4 w-4" aria-hidden />
                </Link>
            )
        },
    },
]

export default function RekamMedisListPage() {
    const { data = [], isLoading } = useQuery({
        queryKey: ["rekam-medis-list"],
        queryFn: RekamMedisService.getAll,
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Riwayat Rekam Medis"
                description="Daftar riwayat pemeriksaan pasien."
            />

            <DataTable columns={columns} data={data} searchKey="pasien_nama" isLoading={isLoading} />
        </div>
    )
}

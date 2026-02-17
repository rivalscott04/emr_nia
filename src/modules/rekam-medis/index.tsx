import { useQuery } from "@tanstack/react-query"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { PageHeader } from "../../components/layout/page-header"
import { TooltipTrigger } from "../../components/ui/tooltip"
import { Eye } from "lucide-react"
import { Link } from "react-router-dom"

interface MedicalRecord {
    id: string
    tanggal: string
    pasien_nama: string
    no_rm: string
    diagnosa_utama: string
    dokter: string
    status: "Final" | "Draft"
}

const MOCK_DATA: MedicalRecord[] = [
    {
        id: "RM-2024-001",
        tanggal: "2024-02-17",
        pasien_nama: "Budi Santoso",
        no_rm: "00-12-34",
        diagnosa_utama: "I10 - Essential (primary) hypertension",
        dokter: "dr. Andi",
        status: "Final",
    },
    {
        id: "RM-2024-002",
        tanggal: "2024-02-17",
        pasien_nama: "Siti Aminah",
        no_rm: "00-12-35",
        diagnosa_utama: "J06.9 - Acute upper respiratory infection",
        dokter: "dr. Siti",
        status: "Draft",
    },
]

const columns: ColumnDef<MedicalRecord>[] = [
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
                <TooltipTrigger label="Lihat detail rekam medis" side="left">
                    <Button variant="ghost" size="icon" asChild aria-label="Lihat detail">
                        <Link to={`/rekam-medis/${rm.id.replace('RM-', 'K-')}`}>
                            <Eye className="h-4 w-4" aria-hidden />
                        </Link>
                    </Button>
                </TooltipTrigger>
            )
        },
    },
]

export default function RekamMedisListPage() {
    // Simulate API fetch
    const { data = MOCK_DATA, isLoading } = useQuery({
        queryKey: ["rekam-medis-list"],
        queryFn: () => Promise.resolve(MOCK_DATA),
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Riwayat Rekam Medis"
                description="Daftar riwayat pemeriksaan pasien."
            />

            <DataTable columns={columns} data={data} searchKey="pasien_nama" />
        </div>
    )
}

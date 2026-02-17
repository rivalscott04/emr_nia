import { useQuery } from "@tanstack/react-query"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"

interface ResepQueue {
    id: string
    waktu: string
    no_resep: string
    pasien: string
    dokter: string
    status: "Waiting" | "Processed" | "Done"
}

const MOCK_QUEUE: ResepQueue[] = [
    { id: "1", waktu: "10:30", no_resep: "R-001", pasien: "Budi Santoso", dokter: "dr. Andi", status: "Waiting" },
    { id: "2", waktu: "10:15", no_resep: "R-002", pasien: "Siti Aminah", dokter: "dr. Siti", status: "Processed" },
    { id: "3", waktu: "09:45", no_resep: "R-003", pasien: "Joko", dokter: "dr. Andi", status: "Done" },
]

const columns: ColumnDef<ResepQueue>[] = [
    { accessorKey: "waktu", header: "Waktu" },
    { accessorKey: "no_resep", header: "No. Resep" },
    { accessorKey: "pasien", header: "Pasien" },
    { accessorKey: "dokter", header: "Dokter" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <Badge variant={status === 'Waiting' ? 'warning' : status === 'Processed' ? 'info' : 'success'}>
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <Button size="sm" variant="outline">Proses</Button>
        )
    }
]

export default function ResepPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Farmasi / E-Resep</h1>
                    <p className="text-muted-foreground">Antrian resep masuk dari poli.</p>
                </div>
            </div>
            <DataTable columns={columns} data={MOCK_QUEUE} searchKey="pasien" />
        </div>
    )
}

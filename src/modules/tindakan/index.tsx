import { useQuery } from "@tanstack/react-query"
import { DataTable } from "../../components/ui/data-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

interface Tindakan {
    kode: string
    nama: string
    kategori: string
    tarif: number
}

const MOCK_TINDAKAN: Tindakan[] = [
    { kode: "89.03", nama: "Consultation", kategori: "Umum", tarif: 50000 },
    { kode: "23.2", nama: "Restoration of tooth", kategori: "Gigi", tarif: 150000 },
    { kode: "96.5", nama: "Debridement of wound", kategori: "Bedah Minor", tarif: 100000 },
]

const columns: ColumnDef<Tindakan>[] = [
    {
        accessorKey: "kode",
        header: "Kode ICD-9",
        cell: ({ row }) => <span className="font-mono font-bold">{row.getValue("kode")}</span>
    },
    {
        accessorKey: "nama",
        header: "Nama Tindakan",
    },
    {
        accessorKey: "kategori",
        header: "Kategori",
    },
    {
        accessorKey: "tarif",
        header: "Tarif",
        cell: ({ row }) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(row.getValue("tarif"))
    },
]

export default function TindakanPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Master Tindakan</h1>
                    <p className="text-muted-foreground">Daftar referensi tindakan medis (ICD-9 CM).</p>
                </div>
                <Button>Tambah Tindakan</Button>
            </div>
            <DataTable columns={columns} data={MOCK_TINDAKAN} searchKey="nama" />
        </div>
    )
}

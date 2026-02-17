import { useQuery } from "@tanstack/react-query"
import { KunjunganService } from "../../services/kunjungan-service"
import { DataTable } from "../../components/ui/data-table"
import { columns } from "./column-def"
import { Button } from "../../components/ui/button"
import { PageHeader } from "../../components/layout/page-header"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function KunjunganPage() {
    const { data: kunjungan = [], isLoading } = useQuery({
        queryKey: ["kunjungan"],
        queryFn: KunjunganService.getAll,
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Data Kunjungan"
                description="Monitor antrian dan kunjungan pasien."
                action={
                    <Button asChild>
                        <Link to="/kunjungan/create">
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            <span>Buat Kunjungan Baru</span>
                        </Link>
                    </Button>
                }
            />

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <DataTable columns={columns} data={kunjungan} searchKey="pasien_nama" />
            )}
        </div>
    )
}

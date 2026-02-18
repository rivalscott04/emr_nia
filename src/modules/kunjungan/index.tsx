import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { KunjunganService } from "../../services/kunjungan-service"
import { DataTable } from "../../components/ui/data-table"
import { columns } from "./column-def"
import { Button } from "../../components/ui/button"
import { PageHeader } from "../../components/layout/page-header"
import { Plus } from "lucide-react"
import { useAuth } from "../auth/auth-context"

export default function KunjunganPage() {
    const { hasPermission } = useAuth()
    const { data: kunjungan = [], isLoading } = useQuery({
        queryKey: ["kunjungan"],
        queryFn: KunjunganService.getAll,
    })
    const canCreateKunjungan = hasPermission("kunjungan.write")

    return (
        <div className="space-y-6">
            <PageHeader
                title="Data Kunjungan"
                description={canCreateKunjungan ? "Monitor antrian dan kunjungan pasien." : "Daftar kunjungan yang ditujukan kepada Anda."}
                action={canCreateKunjungan ? (
                    <Button asChild>
                        <Link to="/kunjungan/create">
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            <span>Buat Kunjungan Baru</span>
                        </Link>
                    </Button>
                ) : undefined}
            />

            <DataTable columns={columns} data={kunjungan} searchKey="pasien_nama" isLoading={isLoading} />
        </div>
    )
}

import { useQuery } from "@tanstack/react-query"
import { PasienService } from "../../services/pasien-service"
import { DataTable } from "../../components/ui/data-table"
import { columns } from "./column-def"
import { Button } from "../../components/ui/button"
import { PageHeader } from "../../components/layout/page-header"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export default function PasienPage() {
    const { data: pasien = [], isLoading } = useQuery({
        queryKey: ["pasien"],
        queryFn: PasienService.getAll,
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Data Pasien"
                description="Kelola data pasien dan rekam medis."
                action={
                    <Button asChild>
                        <Link to="/pasien/new">
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            <span>Tambah Pasien</span>
                        </Link>
                    </Button>
                }
            />

            <DataTable columns={columns} data={pasien} searchKey="nama" isLoading={isLoading} />
        </div>
    )
}

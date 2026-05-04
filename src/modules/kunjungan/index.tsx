import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { KunjunganService } from "../../services/kunjungan-service"
import { DataTable } from "../../components/ui/data-table"
import { getColumns } from "./column-def"
import { Button } from "../../components/ui/button"
import { PageHeader } from "../../components/layout/page-header"
import { Plus } from "lucide-react"
import { useAuth } from "../auth/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Label } from "../../components/ui/label"
import type { KunjunganStatus } from "../../types/kunjungan"
import { toast } from "sonner"
import { ApiError } from "../../lib/api-client"
import { LIST_LIMIT_MASTER } from "../../lib/list-limits"

const STATUS_OPTIONS: { value: "all" | KunjunganStatus; label: string }[] = [
    { value: "all", label: "Semua status" },
    { value: "OPEN", label: "Menunggu" },
    { value: "SEDANG_DIPERIKSA", label: "Sedang Diperiksa" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "CANCELLED", label: "Dibatalkan" },
]

export default function KunjunganPage() {
    const queryClient = useQueryClient()
    const { hasPermission, isDokter } = useAuth()
    const [statusFilter, setStatusFilter] = useState<"all" | KunjunganStatus>(isDokter ? "SEDANG_DIPERIKSA" : "all")
    const [dokterFilter, setDokterFilter] = useState<string>("all")
    const [poliFilter, setPoliFilter] = useState<string>("all")

    const { data: dokterOptions = [] } = useQuery({
        queryKey: ["kunjungan", "dokter-options"],
        queryFn: () => KunjunganService.getDokterOptions(),
    })
    const { data: poliOptions = [] } = useQuery({
        queryKey: ["kunjungan", "poli-options"],
        queryFn: () => KunjunganService.getPoliOptions(),
    })

    const listParams = useMemo(() => ({
        status: statusFilter === "all" ? undefined : statusFilter,
        dokter_id: dokterFilter === "all" ? undefined : dokterFilter,
        poli: poliFilter === "all" ? undefined : poliFilter,
        limit: LIST_LIMIT_MASTER,
    }), [statusFilter, dokterFilter, poliFilter])

    const { data, isLoading } = useQuery({
        queryKey: ["kunjungan", listParams],
        queryFn: () => KunjunganService.getList(listParams),
    })
    const kunjungan = data?.items ?? []
    const canCreateKunjungan = hasPermission("kunjungan.write")
    const canChangeStatus = hasPermission("kunjungan.write")

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: KunjunganStatus }) => KunjunganService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kunjungan"] })
            toast.success("Status kunjungan diperbarui")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal memperbarui status"
            toast.error(message)
        },
    })

    const columns = useMemo(
        () => getColumns({
            onStatusChange: (id, status) => updateStatusMutation.mutate({ id, status }),
            canChangeStatus,
        }),
        [canChangeStatus, updateStatusMutation.mutate]
    )

    return (
        <div className="space-y-6">
            <PageHeader
                title="Data Kunjungan"
                description={canCreateKunjungan ? "Monitor antrian dan kunjungan pasien." : "Daftar kunjungan yang sedang/sudah diperiksa. Filter status untuk fokus ke pasien di ruangan."}
                action={canCreateKunjungan ? (
                    <Button asChild>
                        <Link to="/kunjungan/create">
                            <Plus className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                            <span>Buat Kunjungan Baru</span>
                        </Link>
                    </Button>
                ) : undefined}
            />

            <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2 min-w-[180px]">
                    <Label className="text-sm">Status</Label>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as "all" | KunjunganStatus)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 min-w-[200px]">
                    <Label className="text-sm">Dokter</Label>
                    <Select
                        value={dokterFilter}
                        onValueChange={setDokterFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua dokter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua dokter</SelectItem>
                            {dokterOptions.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                    {d.nama} ({d.poli})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 min-w-[160px]">
                    <Label className="text-sm">Poli</Label>
                    <Select
                        value={poliFilter}
                        onValueChange={setPoliFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua poli" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua poli</SelectItem>
                            {poliOptions.map((p) => (
                                <SelectItem key={p.id ?? p.code} value={p.name}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable columns={columns} data={kunjungan} searchKey="pasien_nama" isLoading={isLoading} />
        </div>
    )
}

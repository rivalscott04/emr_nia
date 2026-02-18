import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KunjunganService } from "../../services/kunjungan-service"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, FileText, User, Calendar, Stethoscope, Building2 } from "lucide-react"
import { DetailPageSkeleton } from "../../components/layout/page-loading"
import { AlertBanner } from "../../components/ui/alert-banner"
import type { KunjunganStatus } from "../../types/kunjungan"
import { useAuth } from "../auth/auth-context"
import { toast } from "sonner"
import { ApiError } from "../../lib/api-client"

const statusVariant: Record<KunjunganStatus, "default" | "success" | "destructive"> = {
    OPEN: "default",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

export default function KunjunganDetailPage() {
    const { id } = useParams<{ id: string }>()
    const queryClient = useQueryClient()
    const { hasPermission } = useAuth()

    const { data: kunjungan, isLoading, isError } = useQuery({
        queryKey: ["kunjungan", id],
        queryFn: () => KunjunganService.getById(id!),
        enabled: !!id,
    })

    const updateStatusMutation = useMutation({
        mutationFn: (status: KunjunganStatus) => KunjunganService.updateStatus(id!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kunjungan", id] })
            queryClient.invalidateQueries({ queryKey: ["kunjungan"] })
            toast.success("Status kunjungan diperbarui")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal memperbarui status"
            toast.error(message)
        },
    })

    if (isLoading) return <DetailPageSkeleton />
    if (isError || !kunjungan) {
        return (
            <AlertBanner variant="danger">
                Data kunjungan tidak ditemukan atau gagal dimuat.
                <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link to="/kunjungan">Kembali ke Daftar Kunjungan</Link>
                </Button>
            </AlertBanner>
        )
    }

    const canWrite = hasPermission("kunjungan.write")
    const canWriteRekamMedis = hasPermission("rekam_medis.write")

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Kembali">
                        <Link to="/kunjungan"><ArrowLeft className="h-4 w-4" aria-hidden /></Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Detail Kunjungan</h1>
                        <p className="text-sm text-muted-foreground truncate">
                            {kunjungan.pasien_nama} · {kunjungan.poli} · {kunjungan.tanggal ? new Date(kunjungan.tanggal).toLocaleString("id-ID") : "-"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[kunjungan.status]} className="text-sm px-3 py-1">
                        {kunjungan.status}
                    </Badge>
                    {canWriteRekamMedis && (
                        <Button asChild>
                            <Link to={`/rekam-medis/${kunjungan.id}`}>
                                <FileText className="mr-2 h-4 w-4" aria-hidden />
                                Isi Rekam Medis
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 space-y-6">
                    <CardHeader>
                        <CardTitle className="text-base">Informasi Kunjungan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</p>
                                    <p className="text-sm">
                                        {kunjungan.tanggal ? new Date(kunjungan.tanggal).toLocaleString("id-ID") : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Poli</p>
                                    <p className="text-sm">{kunjungan.poli || "-"}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Stethoscope className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dokter</p>
                                    <p className="text-sm">{kunjungan.dokter_nama || "-"}</p>
                                </div>
                            </div>
                        </div>
                        {kunjungan.keluhan_utama && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Keluhan Utama</p>
                                <p className="text-sm rounded-md bg-muted/50 p-3">{kunjungan.keluhan_utama}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Pasien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{kunjungan.pasien_nama}</p>
                            <Button variant="outline" size="sm" asChild className="w-full mt-2">
                                <Link to={`/pasien/${kunjungan.pasien_id}`}>Lihat Profil Pasien</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {canWrite && kunjungan.status === "OPEN" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ubah Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => updateStatusMutation.mutate("CANCELLED")}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    Batalkan Kunjungan
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PasienService } from "../../services/pasien-service"
import { KunjunganService } from "../../services/kunjungan-service"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { ArrowLeft, Clock, Plus, X } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { DetailPageSkeleton } from "../../components/layout/page-loading"
import { useAuth } from "../auth/auth-context"
import { KUNJUNGAN_STATUS_LABELS } from "../../types/kunjungan"
import type { KunjunganStatus } from "../../types/kunjungan"

export default function PasienDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { hasPermission } = useAuth()
    const queryClient = useQueryClient()
    const [alergiInput, setAlergiInput] = useState("")

    const { data: pasien, isLoading } = useQuery({
        queryKey: ["pasien", id],
        queryFn: () => PasienService.getById(id!),
        enabled: !!id,
    })

    const { data: riwayatData, isLoading: riwayatLoading } = useQuery({
        queryKey: ["kunjungan", "pasien", id],
        queryFn: () => KunjunganService.getList({ pasien_id: id!, limit: 50 }),
        enabled: !!id,
    })
    const riwayatKunjungan = riwayatData?.items ?? []

    const updateAllergiesMutation = useMutation({
        mutationFn: (allergies: string[]) => PasienService.updateAllergies(id!, allergies),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pasien", id] }),
    })

    const allergies = pasien?.allergies ?? []

    const handleTambahAlergi = () => {
        const nama = alergiInput.trim()
        if (!nama || updateAllergiesMutation.isPending) return
        if (allergies.some((a) => a.toLowerCase() === nama.toLowerCase())) {
            setAlergiInput("")
            return
        }
        updateAllergiesMutation.mutate([...allergies, nama], { onSuccess: () => setAlergiInput("") })
    }

    const handleHapusAlergi = (nama: string) => {
        updateAllergiesMutation.mutate(allergies.filter((a) => a !== nama))
    }

    if (isLoading) return <DetailPageSkeleton />
    if (!pasien) return <div>Pasien tidak ditemukan</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/pasien"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{pasien.nama}</h1>
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                            <span>{pasien.no_rm}</span>
                            <span>•</span>
                            <span>{pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                            <span>•</span>
                            <span>{new Date().getFullYear() - new Date(pasien.tanggal_lahir).getFullYear()} Tahun</span>
                        </div>
                    </div>
                </div>
                {hasPermission("kunjungan.write") && (
                    <Button asChild>
                        <Link to={`/kunjungan/create?pasienId=${pasien.id}`}>Buat Kunjungan Baru</Link>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar / Info Pasien */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Info Pasien</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground">NIK</p>
                            <p>{pasien.nik}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Tgl Lahir</p>
                            <p>{pasien.tanggal_lahir}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Alamat</p>
                            <p>{pasien.alamat}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">No HP</p>
                            <p>{pasien.no_hp}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Golongan Darah</p>
                            <p>{pasien.golongan_darah ?? "-"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Pekerjaan</p>
                            <p>{pasien.pekerjaan ?? "-"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Status Pernikahan</p>
                            <p>{pasien.status_pernikahan ?? "-"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Nama Ibu Kandung</p>
                            <p>{pasien.nama_ibu_kandung ?? "-"}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Nama Suami</p>
                            <p>{pasien.nama_suami ?? "-"}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content / Tab Riwayat */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="riwayat">
                        <TabsList>
                            <TabsTrigger value="riwayat">Riwayat Kunjungan</TabsTrigger>
                            <TabsTrigger value="alergi">Alergi & Obat</TabsTrigger>
                            <TabsTrigger value="berkas">Berkas Lain</TabsTrigger>
                        </TabsList>
                        <TabsContent value="riwayat" className="space-y-4 mt-4">
                            {riwayatLoading ? (
                                <p className="text-sm text-muted-foreground">Memuat riwayat kunjungan...</p>
                            ) : riwayatKunjungan.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada riwayat kunjungan.</p>
                            ) : (
                                <div className="space-y-3">
                                    {riwayatKunjungan.map((k) => (
                                        <Card key={k.id} className="overflow-hidden">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                            {k.poli}
                                                            {k.kunjungan_ke != null && (
                                                                <span className="text-muted-foreground font-normal">
                                                                    (Kunjungan ke-{k.kunjungan_ke})
                                                                </span>
                                                            )}
                                                        </CardTitle>
                                                        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2 flex-wrap">
                                                            <Clock className="h-3 w-3 shrink-0" />
                                                            <span>
                                                                {k.tanggal ? new Date(k.tanggal).toLocaleString("id-ID") : "-"}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{k.dokter_nama}</span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            k.status === "COMPLETED"
                                                                ? "success"
                                                                : k.status === "CANCELLED"
                                                                  ? "destructive"
                                                                  : "secondary"
                                                        }
                                                        className="shrink-0"
                                                    >
                                                        {KUNJUNGAN_STATUS_LABELS[k.status as KunjunganStatus] ?? k.status}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="text-sm space-y-2">
                                                {(k.berat_badan != null ||
                                                    k.tinggi_badan != null ||
                                                    (k.td_sistole != null && k.td_diastole != null)) && (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                        {k.td_sistole != null && k.td_diastole != null && (
                                                            <div>
                                                                <p className="font-medium text-xs text-muted-foreground">
                                                                    Tensi
                                                                </p>
                                                                <p>
                                                                    {k.td_sistole}/{k.td_diastole} mmHg
                                                                </p>
                                                            </div>
                                                        )}
                                                        {k.berat_badan != null && (
                                                            <div>
                                                                <p className="font-medium text-xs text-muted-foreground">
                                                                    BB
                                                                </p>
                                                                <p>{k.berat_badan} kg</p>
                                                            </div>
                                                        )}
                                                        {k.tinggi_badan != null && (
                                                            <div>
                                                                <p className="font-medium text-xs text-muted-foreground">
                                                                    TB
                                                                </p>
                                                                <p>{k.tinggi_badan} cm</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {k.keluhan_utama && (
                                                    <div>
                                                        <p className="font-medium text-xs text-muted-foreground">
                                                            Keluhan
                                                        </p>
                                                        <p className="line-clamp-2">{k.keluhan_utama}</p>
                                                    </div>
                                                )}
                                                <Button variant="outline" size="sm" asChild className="mt-1">
                                                    <Link to={`/kunjungan/${k.id}`}>Lihat Detail Kunjungan</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="alergi">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Alergi (Obat / Bahan)</CardTitle>
                                    <CardDescription>
                                        Data alergi diisi di sini dan akan tampil serta dipakai di Rekam Medis (banner peringatan & validasi resep).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nama obat atau bahan (mis. Amoxicillin)"
                                            value={alergiInput}
                                            onChange={(e) => setAlergiInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleTambahAlergi())}
                                            disabled={updateAllergiesMutation.isPending}
                                            className="max-w-xs"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleTambahAlergi}
                                            disabled={!alergiInput.trim() || updateAllergiesMutation.isPending}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Tambah
                                        </Button>
                                    </div>
                                    {allergies.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Tidak ada data alergi tercatat.</p>
                                    ) : (
                                        <ul className="flex flex-wrap gap-2">
                                            {allergies.map((a) => (
                                                <li key={a}>
                                                    <Badge variant="secondary" className="pr-1 gap-1">
                                                        {a}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleHapusAlergi(a)}
                                                            disabled={updateAllergiesMutation.isPending}
                                                            className="rounded-full hover:bg-muted p-0.5"
                                                            aria-label={`Hapus alergi ${a}`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

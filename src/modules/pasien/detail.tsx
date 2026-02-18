import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PasienService } from "../../services/pasien-service"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { ArrowLeft, Clock, Plus, X } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { DetailPageSkeleton } from "../../components/layout/page-loading"
import { useAuth } from "../auth/auth-context"

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
                            {/* Mock Riwayat Items */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">Pemeriksaan Umum</CardTitle>
                                            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                                                <Clock className="h-3 w-3" />
                                                <span>12 Feb 2024, 09:30</span>
                                                <span>•</span>
                                                <span>dr. Umum</span>
                                            </div>
                                        </div>
                                        <Badge variant="success">Selesai</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground">Diagnosa</p>
                                            <p>I10 - Hipertensi Esensial</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground">Tindakan</p>
                                            <p>Konsultasi, Cek Tensi</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">Poli Gigi</CardTitle>
                                            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                                                <Clock className="h-3 w-3" />
                                                <span>10 Jan 2024, 10:15</span>
                                                <span>•</span>
                                                <span>drg. Siti</span>
                                            </div>
                                        </div>
                                        <Badge variant="success">Selesai</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm">
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground">Diagnosa</p>
                                            <p>K04 - Pulpitis</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs text-muted-foreground">Tindakan</p>
                                            <p>Tambal Gigi</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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

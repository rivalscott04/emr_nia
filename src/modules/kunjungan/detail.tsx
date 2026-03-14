import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { KunjunganService } from "../../services/kunjungan-service"
import { RekamMedisService } from "../../services/rekam-medis-service"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { ArrowLeft, FileText, User, Calendar, Stethoscope, Building2, Activity, Pencil, X, Baby, Receipt } from "lucide-react"
import { DetailPageSkeleton } from "../../components/layout/page-loading"
import { AlertBanner } from "../../components/ui/alert-banner"
import type { KunjunganStatus } from "../../types/kunjungan"
import { KUNJUNGAN_STATUS_LABELS } from "../../types/kunjungan"
import { useAuth } from "../auth/auth-context"
import { toast } from "sonner"
import { ApiError } from "../../lib/api-client"

function is404(e: unknown): boolean {
    return e instanceof ApiError && e.status === 404
}

const statusVariant: Record<KunjunganStatus, "default" | "info" | "success" | "destructive"> = {
    OPEN: "default",
    SEDANG_DIPERIKSA: "info",
    COMPLETED: "success",
    CANCELLED: "destructive",
}

function toDateInputValue(value?: string | null): string {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    const pad = (n: number) => String(n).padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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

    const { data: rekap, isLoading: rekapLoading, isError: rekapError } = useQuery({
        queryKey: ["rekam-medis", "rekap", id],
        queryFn: () => RekamMedisService.getRekapByKunjunganId(id!),
        enabled: !!id && kunjungan?.status === "COMPLETED",
        retry: (_, error) => !is404(error),
    })

    const [editingTTV, setEditingTTV] = useState(false)
    const [ttvDraft, setTtvDraft] = useState({
        td_sistole: "" as string | number,
        td_diastole: "" as string | number,
        berat_badan: "" as string | number,
        tinggi_badan: "" as string | number,
    })
    const [editingObstetri, setEditingObstetri] = useState(false)
    const [obstetriDraft, setObstetriDraft] = useState({
        hpht: "",
        htp: "",
        gravida: "" as string | number,
        para: "" as string | number,
        form_hidup: "" as string | number,
        abortus: "" as string | number,
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

    const updateTTVMutation = useMutation({
        mutationFn: (payload: { td_sistole?: number | null; td_diastole?: number | null; berat_badan?: number | null; tinggi_badan?: number | null }) =>
            KunjunganService.update(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kunjungan", id] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", id] })
            setEditingTTV(false)
            toast.success("TTV kunjungan disimpan")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal menyimpan TTV"
            toast.error(message)
        },
    })

    const updateObstetriMutation = useMutation({
        mutationFn: (payload: { hpht?: string | null; htp?: string | null; gravida?: number | null; para?: number | null; form_hidup?: number | null; abortus?: number | null }) =>
            KunjunganService.update(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kunjungan", id] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", id] })
            setEditingObstetri(false)
            toast.success("Data obstetri disimpan")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal menyimpan data obstetri"
            toast.error(message)
        },
    })

    function openEditTTV() {
        setTtvDraft({
            td_sistole: kunjungan?.td_sistole ?? "",
            td_diastole: kunjungan?.td_diastole ?? "",
            berat_badan: kunjungan?.berat_badan ?? "",
            tinggi_badan: kunjungan?.tinggi_badan ?? "",
        })
        setEditingTTV(true)
    }

    function saveTTV() {
        updateTTVMutation.mutate({
            td_sistole: ttvDraft.td_sistole === "" ? null : Number(ttvDraft.td_sistole),
            td_diastole: ttvDraft.td_diastole === "" ? null : Number(ttvDraft.td_diastole),
            berat_badan: ttvDraft.berat_badan === "" ? null : Number(ttvDraft.berat_badan),
            tinggi_badan: ttvDraft.tinggi_badan === "" ? null : Number(ttvDraft.tinggi_badan),
        })
    }

    const isObstetriPoli = Boolean(kunjungan?.supports_obstetri)
    const hasObstetriData = isObstetriPoli && (
        kunjungan?.hpht != null ||
        kunjungan?.htp != null ||
        kunjungan?.gravida != null ||
        kunjungan?.para != null ||
        kunjungan?.form_hidup != null ||
        kunjungan?.abortus != null
    )

    function openEditObstetri() {
        setObstetriDraft({
            hpht: kunjungan?.hpht ?? "",
            htp: toDateInputValue(kunjungan?.htp),
            gravida: kunjungan?.gravida ?? "",
            para: kunjungan?.para ?? "",
            form_hidup: kunjungan?.form_hidup ?? "",
            abortus: kunjungan?.abortus ?? "",
        })
        setEditingObstetri(true)
    }

    function saveObstetri() {
        updateObstetriMutation.mutate({
            hpht: obstetriDraft.hpht === "" ? null : obstetriDraft.hpht,
            htp: obstetriDraft.htp === "" ? null : obstetriDraft.htp,
            gravida: obstetriDraft.gravida === "" ? null : Number(obstetriDraft.gravida),
            para: obstetriDraft.para === "" ? null : Number(obstetriDraft.para),
            form_hidup: obstetriDraft.form_hidup === "" ? null : Number(obstetriDraft.form_hidup),
            abortus: obstetriDraft.abortus === "" ? null : Number(obstetriDraft.abortus),
        })
    }

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
                            {kunjungan.pasien_nama} · {kunjungan.poli}
                            {kunjungan.kunjungan_ke != null ? ` · Kunjungan ke-${kunjungan.kunjungan_ke}` : ""} · {kunjungan.tanggal ? new Date(kunjungan.tanggal).toLocaleString("id-ID") : "-"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge variant={statusVariant[kunjungan.status]} className="text-sm px-3 py-1">
                        {KUNJUNGAN_STATUS_LABELS[kunjungan.status]}
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

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                TTV (Tanda Tanda Vital)
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Ditampilkan di Objektif rekam medis.</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {!editingTTV ? (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">TD</span>
                                            <p className="font-medium">{kunjungan.td_sistole != null && kunjungan.td_diastole != null ? `${kunjungan.td_sistole}/${kunjungan.td_diastole} mmHg` : "—"}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Berat</span>
                                            <p className="font-medium">{kunjungan.berat_badan != null ? `${kunjungan.berat_badan} kg` : "—"}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Tinggi</span>
                                            <p className="font-medium">{kunjungan.tinggi_badan != null ? `${kunjungan.tinggi_badan} cm` : "—"}</p>
                                        </div>
                                    </div>
                                    {canWrite && (kunjungan.status === "OPEN" || kunjungan.status === "SEDANG_DIPERIKSA") && (
                                        <Button variant="outline" size="sm" className="w-full" onClick={openEditTTV}>
                                            <Pencil className="h-3.5 w-3.5 mr-2" />
                                            Isi / Edit TTV
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">TD Sistole (mmHg)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={300}
                                                value={ttvDraft.td_sistole}
                                                onChange={(e) => setTtvDraft((p) => ({ ...p, td_sistole: e.target.value === "" ? "" : e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">TD Diastole (mmHg)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={200}
                                                value={ttvDraft.td_diastole}
                                                onChange={(e) => setTtvDraft((p) => ({ ...p, td_diastole: e.target.value === "" ? "" : e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Berat (kg)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.1}
                                                value={ttvDraft.berat_badan}
                                                onChange={(e) => setTtvDraft((p) => ({ ...p, berat_badan: e.target.value === "" ? "" : e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground">Tinggi (cm)</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.1}
                                                value={ttvDraft.tinggi_badan}
                                                onChange={(e) => setTtvDraft((p) => ({ ...p, tinggi_badan: e.target.value === "" ? "" : e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingTTV(false)} disabled={updateTTVMutation.isPending}>
                                            <X className="h-3.5 w-3.5 mr-1" /> Batal
                                        </Button>
                                        <Button size="sm" onClick={saveTTV} disabled={updateTTVMutation.isPending}>
                                            Simpan TTV
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {isObstetriPoli && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Baby className="h-4 w-4" />
                                    Data Obstetri
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">HPHT, HTP, Gravida-Partus-Abortus, Form Hidup. Ditampilkan karena poli ini memakai data obstetri. Diisi oleh admin poli.</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {!editingObstetri ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">HPHT</span>
                                                <p className="font-medium">{kunjungan.hpht ? new Date(kunjungan.hpht).toLocaleDateString("id-ID") : "—"}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">HTP</span>
                                                <p className="font-medium">{kunjungan.htp ? new Date(kunjungan.htp).toLocaleDateString("id-ID") : "—"}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Gravida (Kehamilan ke-)</span>
                                                <p className="font-medium">{kunjungan.gravida != null ? kunjungan.gravida : "—"}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Partus (Jumlah persalinan)</span>
                                                <p className="font-medium">{kunjungan.para != null ? kunjungan.para : "—"}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Form Hidup</span>
                                                <p className="font-medium">{kunjungan.form_hidup != null ? kunjungan.form_hidup : "—"}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Abortus (Riwayat keguguran)</span>
                                                <p className="font-medium">{kunjungan.abortus != null ? kunjungan.abortus : "—"}</p>
                                            </div>
                                        </div>
                                        {canWrite && (kunjungan.status === "OPEN" || kunjungan.status === "SEDANG_DIPERIKSA") && (
                                            <Button variant="outline" size="sm" className="w-full" onClick={openEditObstetri}>
                                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                                {hasObstetriData ? "Edit Data Obstetri" : "Isi Data Obstetri"}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">HPHT</label>
                                                <Input
                                                    type="date"
                                                    value={obstetriDraft.hpht}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, hpht: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">HTP</label>
                                                <Input
                                                    type="date"
                                                    value={obstetriDraft.htp}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, htp: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Gravida</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={obstetriDraft.gravida}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, gravida: e.target.value === "" ? "" : e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Partus</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={obstetriDraft.para}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, para: e.target.value === "" ? "" : e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Hidup</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={obstetriDraft.form_hidup}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, form_hidup: e.target.value === "" ? "" : e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-muted-foreground">Abortus</label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={obstetriDraft.abortus}
                                                    onChange={(e) => setObstetriDraft((p) => ({ ...p, abortus: e.target.value === "" ? "" : e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setEditingObstetri(false)} disabled={updateObstetriMutation.isPending}>
                                                <X className="h-3.5 w-3.5 mr-1" /> Batal
                                            </Button>
                                            <Button size="sm" onClick={saveObstetri} disabled={updateObstetriMutation.isPending}>
                                                Simpan Data Obstetri
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {canWrite && kunjungan.status !== "COMPLETED" && kunjungan.status !== "CANCELLED" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ubah Status (Admin Poli)</CardTitle>
                                <p className="text-xs text-muted-foreground">Tandai pasien masuk ruangan agar dokter bisa memfilter daftar.</p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {kunjungan.status === "OPEN" && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => updateStatusMutation.mutate("SEDANG_DIPERIKSA")}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        Panggil / Masuk Ruangan
                                    </Button>
                                )}
                                {kunjungan.status === "SEDANG_DIPERIKSA" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => updateStatusMutation.mutate("COMPLETED")}
                                        disabled={updateStatusMutation.isPending}
                                    >
                                        Selesai Periksa
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                                    onClick={() => updateStatusMutation.mutate("CANCELLED")}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    Batalkan Kunjungan
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {kunjungan.status === "COMPLETED" && (hasPermission("rekam_medis.read") || hasPermission("rekap_tindakan.read")) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Receipt className="h-4 w-4" />
                                    Rekap Tindakan & Biaya
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Daftar tindakan yang dicatat dokter dan perkiraan biaya (tarif dari master tindakan). Untuk billing/admin poli.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {rekapLoading && (
                                    <p className="text-sm text-muted-foreground">Memuat rekap…</p>
                                )}
                                {rekapError && (
                                    <p className="text-sm text-muted-foreground">Rekap belum tersedia (rekam medis belum difinalisasi).</p>
                                )}
                                {rekap && !rekapLoading && !rekapError && (
                                    <>
                                        {rekap.tindakan.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">Tidak ada tindakan tercatat.</p>
                                        ) : (
                                            <div className="rounded-md border overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-muted/50">
                                                            <th className="text-left font-medium p-2 w-8">No</th>
                                                            <th className="text-left font-medium p-2">Kode</th>
                                                            <th className="text-left font-medium p-2">Nama Tindakan</th>
                                                            <th className="text-right font-medium p-2">Tarif</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rekap.tindakan.map((item, idx) => (
                                                            <tr key={`${item.code}-${idx}`} className="border-b last:border-0">
                                                                <td className="p-2">{idx + 1}</td>
                                                                <td className="p-2 font-mono text-muted-foreground">{item.code}</td>
                                                                <td className="p-2">{item.name}</td>
                                                                <td className="p-2 text-right tabular-nums">
                                                                    {item.tarif > 0
                                                                        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.tarif)
                                                                        : "—"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="flex justify-end items-center gap-2 border-t bg-muted/30 px-3 py-2">
                                                    <span className="text-sm font-medium">Total Biaya:</span>
                                                    <span className="font-semibold tabular-nums">
                                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rekap.total_biaya)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

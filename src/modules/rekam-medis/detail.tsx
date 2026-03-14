import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { AlertBanner } from "../../components/ui/alert-banner"
import { ArrowLeft, CheckCircle2, FileText, Activity, Stethoscope, Pill, Lock, Plus, Save, XCircle, Scissors, PenLine, Printer } from "lucide-react"
import { SOAPForm } from "./components/soap-form"
import { DiagnosaForm } from "./components/diagnosa-form"
import { TindakanForm } from "./components/tindakan-form.tsx"
import { ResepForm } from "./components/resep-form"
import { GambarPemeriksaanCanvas } from "./components/gambar-pemeriksaan-canvas"
import { printLampiranPemeriksaan } from "./print-lampiran-pemeriksaan"
import { useRekamMedisStore } from "../../store/rekam-medis-store"
import { Textarea } from "../../components/ui/textarea"
import { RekamMedisService } from "../../services/rekam-medis-service"
import { ApiError } from "../../lib/api-client"
import { getAccessToken } from "../../lib/auth-storage"
import { DetailPageSkeleton } from "../../components/layout/page-loading"

export default function RekamMedisPage() {
    const { kunjunganId } = useParams<{ kunjunganId: string }>()
    const queryClient = useQueryClient()
    const {
        patient,
        recordStatus,
        resepStatus,
        soap,
        ttv,
        diagnosaList,
        tindakanList,
        resepList,
        addendums,
        lampiranGambar,
        updateLampiranGambar,
        canFinalize,
        hydrateFromApi,
        resetStore,
    } = useRekamMedisStore()

    const [finalizationErrors, setFinalizationErrors] = useState<string[]>([])
    const [addendumText, setAddendumText] = useState("")
    const [printImageWidth, setPrintImageWidth] = useState<string>("100%")

    const isLocked = recordStatus === "Final"

    const { data: rekamMedisData, isLoading, isError } = useQuery({
        queryKey: ["rekam-medis", kunjunganId],
        queryFn: () => RekamMedisService.getByKunjunganId(kunjunganId!),
        enabled: !!kunjunganId,
        retry: false,
    })

    useEffect(() => {
        if (rekamMedisData) hydrateFromApi(rekamMedisData)
    }, [rekamMedisData, hydrateFromApi])

    useEffect(() => {
        if (!rekamMedisData?.lampiran_gambar_url || lampiranGambar) return
        const token = getAccessToken()
        if (!token) return
        fetch(rekamMedisData.lampiran_gambar_url!, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("Gagal mengambil gambar"))))
            .then((blob) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                })
            })
            .then(updateLampiranGambar)
            .catch(() => {})
    }, [rekamMedisData?.lampiran_gambar_url, lampiranGambar, updateLampiranGambar])

    useEffect(() => {
        if (isError) resetStore()
    }, [isError, resetStore])

    const createFromScratchMutation = useMutation({
        mutationFn: async () => {
            if (!kunjunganId) throw new Error("Kunjungan tidak valid")
            return RekamMedisService.upsertByKunjunganId(kunjunganId, {
                soap: { subjective: "", objective: "", assessment: "", plan: "", instruksi: "" },
                ttv: { sistole: null, diastole: null, nadi: null, rr: null, suhu: null, spo2: null, berat_badan: null, tinggi_badan: null },
                diagnosa: [],
                resep: [],
            })
        },
        onSuccess: (data) => {
            hydrateFromApi(data)
            queryClient.invalidateQueries({ queryKey: ["rekam-medis-list"] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", kunjunganId] })
            toast.success("Rekam medis siap diisi")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal membuat rekam medis"
            toast.error(message)
        },
    })

    const upsertMutation = useMutation({
        mutationFn: async () => {
            if (!kunjunganId) throw new Error("Kunjungan tidak valid")
            return RekamMedisService.upsertByKunjunganId(kunjunganId, {
                soap,
                ttv,
                diagnosa: [
                    ...diagnosaList.map((item, idx) => ({
                        code: item.code,
                        name: item.name,
                        type: "ICD-10" as const,
                        is_utama: item.is_utama ?? idx === 0,
                    })),
                    ...tindakanList.map((item) => ({
                        code: item.code,
                        name: item.name,
                        type: "ICD-9" as const,
                    })),
                ],
                resep: resepList.map((item) => ({
                    nama_obat: item.nama_obat,
                    jumlah: item.jumlah,
                    aturan_pakai: item.aturan_pakai,
                })),
                lampiran_gambar: lampiranGambar ?? null,
            })
        },
        onSuccess: (data) => {
            hydrateFromApi(data)
            queryClient.invalidateQueries({ queryKey: ["rekam-medis-list"] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", kunjunganId] })
            toast.success("Draft rekam medis berhasil disimpan")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal menyimpan draft rekam medis"
            toast.error(message)
        },
    })

    const finalizeMutation = useMutation({
        mutationFn: async () => {
            if (!kunjunganId) throw new Error("Kunjungan tidak valid")
            return RekamMedisService.finalizeByKunjunganId(kunjunganId)
        },
        onSuccess: (data) => {
            hydrateFromApi(data)
            queryClient.invalidateQueries({ queryKey: ["rekam-medis-list"] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", kunjunganId] })
            toast.success("Rekam medis berhasil difinalisasi")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal finalisasi rekam medis"
            toast.error(message)
        },
    })

    const addendumMutation = useMutation({
        mutationFn: async (catatan: string) => {
            if (!kunjunganId) throw new Error("Kunjungan tidak valid")
            await RekamMedisService.addendumByKunjunganId(kunjunganId, catatan)
            return RekamMedisService.getByKunjunganId(kunjunganId)
        },
        onSuccess: (data) => {
            hydrateFromApi(data)
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", kunjunganId] })
            toast.success("Addendum berhasil ditambahkan")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal menambah addendum"
            toast.error(message)
        },
    })

    const sendResepMutation = useMutation({
        mutationFn: async () => {
            if (!kunjunganId) throw new Error("Kunjungan tidak valid")
            return RekamMedisService.sendResepByKunjunganId(kunjunganId)
        },
        onSuccess: (data) => {
            hydrateFromApi(data)
            queryClient.invalidateQueries({ queryKey: ["rekam-medis", kunjunganId] })
            queryClient.invalidateQueries({ queryKey: ["rekam-medis-list"] })
            toast.success("Resep berhasil dikirim ke farmasi")
        },
        onError: (error) => {
            const message = error instanceof ApiError ? error.message : "Gagal kirim resep"
            toast.error(message)
        },
    })

    const handleFinalize = () => {
        const { ok, errors } = canFinalize()
        if (!ok) {
            setFinalizationErrors(errors)
            return
        }
        setFinalizationErrors([])
        upsertMutation.mutate(undefined, {
            onSuccess: () => finalizeMutation.mutate(),
        })
    }

    const handleAddAddendum = () => {
        const trimmed = addendumText.trim()
        if (!trimmed) return
        addendumMutation.mutate(trimmed)
        setAddendumText("")
    }

    if (isLoading) {
        return <DetailPageSkeleton />
    }

    if (isError) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" size="icon" asChild aria-label="Kembali">
                    <Link to="/rekam-medis"><ArrowLeft className="h-4 w-4" aria-hidden /></Link>
                </Button>
                <AlertBanner variant="warning">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span>Belum ada rekam medis untuk kunjungan ini. Buat baru lalu isi SOAP, TTV, diagnosa, dan resep.</span>
                        <Button
                            onClick={() => createFromScratchMutation.mutate()}
                            disabled={createFromScratchMutation.isPending}
                        >
                            {createFromScratchMutation.isPending ? "Membuat..." : "Buat Rekam Medis"}
                        </Button>
                    </div>
                </AlertBanner>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Button variant="ghost" size="icon" asChild aria-label="Kembali">
                        <Link to="/kunjungan"><ArrowLeft className="h-4 w-4" aria-hidden /></Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold tracking-tight md:text-2xl">Rekam Medis</h1>
                        <p className="text-sm text-muted-foreground truncate">Kunjungan #{kunjunganId}</p>
                    </div>
                </div>
                <Badge variant={isLocked ? "success" : "neutral"} className="text-sm px-3 py-1 shrink-0 self-start sm:self-center">
                    {isLocked ? (
                        <><Lock className="mr-1 h-3.5 w-3.5" /> Final</>
                    ) : (
                        "Draft"
                    )}
                </Badge>
            </div>

            {/* Allergy Alert Banner — sumber: data pasien (Profil Pasien, tab Alergi & Obat) */}
            {patient.allergies.length > 0 && (
                <AlertBanner variant="danger">
                    <div>
                        <span className="font-semibold">ALERGI: </span>
                        {patient.allergies.join(", ")}
                        <span className="block text-xs font-normal opacity-90 mt-1">
                            Data alergi dikelola di Profil Pasien.
                            {patient.id ? (
                                <> <Link to={`/pasien/${patient.id}`} className="underline hover:no-underline">Kelola di sini (tab Alergi & Obat)</Link></>
                            ) : (
                                <> Buka menu Pasien → pilih pasien → tab &quot;Alergi & Obat&quot;</>
                            )}
                        </span>
                    </div>
                </AlertBanner>
            )}

            {/* Finalization Errors */}
            {finalizationErrors.length > 0 && (
                <AlertBanner variant="warning">
                    Tidak dapat finalisasi: {finalizationErrors.join("; ")}
                </AlertBanner>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left — Form Area (70%) */}
                <div className="lg:col-span-3 space-y-6">
                    <Tabs defaultValue="soap" className="space-y-6">
                        <TabsList className="bg-background border w-full justify-start h-12 p-1">
                            <TabsTrigger value="soap" className="flex-1 max-w-[150px] gap-2">
                                <FileText className="h-4 w-4" /> SOAP
                            </TabsTrigger>
                            <TabsTrigger value="diagnosa" className="flex-1 max-w-[150px] gap-2">
                                <Stethoscope className="h-4 w-4" /> Diagnosa
                            </TabsTrigger>
                            <TabsTrigger value="tindakan" className="flex-1 max-w-[150px] gap-2">
                                <Scissors className="h-4 w-4" /> Tindakan
                            </TabsTrigger>
                            <TabsTrigger value="resep" className="flex-1 max-w-[150px] gap-2">
                                <Pill className="h-4 w-4" /> Resep
                            </TabsTrigger>
                            <TabsTrigger value="gambar" className="flex-1 max-w-[150px] gap-2">
                                <PenLine className="h-4 w-4" /> Gambar
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="soap">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Catatan Pemeriksaan (SOAP)</h2>
                                <p className="text-sm text-muted-foreground">Subjektif, Objektif, Assessment, Plan.</p>
                            </div>
                            <SOAPForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="diagnosa">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Diagnosa (ICD-10)</h2>
                                <p className="text-sm text-muted-foreground">Pencarian dan input diagnosa.</p>
                            </div>
                            <DiagnosaForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="tindakan">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Tindakan / Prosedur (ICD-9)</h2>
                                <p className="text-sm text-muted-foreground">Pencarian dan input tindakan yang dilakukan.</p>
                            </div>
                            <TindakanForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="resep">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">E-Resep</h2>
                                <p className="text-sm text-muted-foreground">Input resep obat untuk pasien.</p>
                            </div>
                            <ResepForm disabled={isLocked} onSendResep={() => sendResepMutation.mutate()} />
                        </TabsContent>

                        <TabsContent value="gambar">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Gambar / Sketsa Pemeriksaan</h2>
                                <p className="text-sm text-muted-foreground">Gambar di canvas lalu simpan draft agar tersimpan ke server. Bisa dicetak sebagai lampiran arsip atau untuk pasien (dibawa pulang).</p>
                            </div>
                            <Card>
                                <CardContent className="pt-6">
                                    <GambarPemeriksaanCanvas
                                        disabled={isLocked}
                                        initialDataUrl={lampiranGambar}
                                        onExport={(dataUrl) => updateLampiranGambar(dataUrl)}
                                    />
                                    {lampiranGambar && (
                                        <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Ukuran gambar saat cetak:</span>
                                            <select
                                                value={printImageWidth}
                                                onChange={(e) => setPrintImageWidth(e.target.value)}
                                                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                                            >
                                                <option value="100%">Sesuai kertas (100%)</option>
                                                <option value="12cm">12 cm</option>
                                                <option value="15cm">15 cm</option>
                                                <option value="17cm">17 cm</option>
                                            </select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    printLampiranPemeriksaan({
                                                        imageDataUrl: lampiranGambar!,
                                                        pasienNama: patient.nama,
                                                        noRm: patient.no_rm,
                                                        imageWidth: printImageWidth,
                                                    })
                                                }
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                Cetak lampiran
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                    printLampiranPemeriksaan({
                                                        imageDataUrl: lampiranGambar!,
                                                        pasienNama: patient.nama,
                                                        noRm: patient.no_rm,
                                                        imageWidth: printImageWidth,
                                                        variant: "untuk_pasien",
                                                    })
                                                }
                                            >
                                                <Printer className="mr-2 h-4 w-4" />
                                                Cetak untuk pasien
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Finalize / Addendum Section */}
                    {!isLocked ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold">Simpan & Finalisasi</h3>
                                        <p className="text-sm text-muted-foreground">Simpan draft kapan saja. Setelah finalisasi, data tidak dapat diubah lagi.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => upsertMutation.mutate()}
                                            disabled={upsertMutation.isPending}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Simpan Draft
                                        </Button>
                                        <Button
                                            onClick={handleFinalize}
                                            variant="default"
                                            size="lg"
                                            disabled={finalizeMutation.isPending || upsertMutation.isPending}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Finalisasi
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Addendum</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Rekam medis telah difinalisasi. Gunakan addendum untuk menambahkan catatan tanpa mengubah data asli.
                                </p>

                                {/* Existing addendums */}
                                {addendums.length > 0 && (
                                    <div className="space-y-3">
                                        {addendums.map((a) => (
                                            <div key={a.id} className="border rounded-lg p-3 bg-slate-50 text-sm space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-700">{a.dokter}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(a.timestamp).toLocaleString("id-ID")}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600">{a.catatan}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New addendum input */}
                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Tulis catatan addendum..."
                                        value={addendumText}
                                        onChange={(e) => setAddendumText(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button onClick={handleAddAddendum} disabled={!addendumText.trim() || addendumMutation.isPending} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Addendum
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar — Sticky (30%) */}
                <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                    {/* Patient Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Info Pasien</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="font-medium text-slate-900">{patient.nama}</div>
                            <div className="text-muted-foreground">{patient.umur} - {patient.jenis_kelamin}</div>
                            <div className="text-muted-foreground">No. RM: {patient.no_rm}</div>
                            {patient.allergies.length > 0 && (
                                <div className="pt-2 border-t">
                                    <span className="text-xs font-semibold text-red-600 uppercase">Alergi:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {patient.allergies.map((a) => (
                                            <span key={a} className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {patient.id ? (
                                            <Link to={`/pasien/${patient.id}`} className="underline hover:no-underline">Kelola di Profil Pasien</Link>
                                        ) : (
                                            "Dikelola di Profil Pasien"
                                        )}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Real-time Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Ringkasan Pemeriksaan</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            {/* SOAP Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">SOAP</span>
                                    {soap.subjective && soap.objective && soap.assessment && soap.plan ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-label="Belum lengkap" />
                                    )}
                                </div>
                                {soap.subjective && (
                                    <p className="text-xs text-muted-foreground pl-5 line-clamp-2">
                                        S: {soap.subjective}
                                    </p>
                                )}
                                {soap.assessment && (
                                    <p className="text-xs text-muted-foreground pl-5 line-clamp-1">
                                        A: {soap.assessment}
                                    </p>
                                )}
                            </div>

                            {/* TTV Summary — dari kunjungan (TD, BB, TB saja) */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">TTV</span>
                                    {(ttv.sistole != null && ttv.diastole != null) || ttv.berat_badan != null || ttv.tinggi_badan != null ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-label="Belum ada" />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground pl-5">
                                    <span>TD: {ttv.sistole != null && ttv.diastole != null ? `${ttv.sistole}/${ttv.diastole}` : "-"}</span>
                                    {ttv.berat_badan != null && <span>BB: {ttv.berat_badan} kg</span>}
                                    {ttv.tinggi_badan != null && <span>TB: {ttv.tinggi_badan} cm</span>}
                                </div>
                            </div>

                            {/* Diagnosa Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">Diagnosa</span>
                                    {diagnosaList.length > 0 ? (
                                        <span className="ml-auto text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                                            {diagnosaList.length}
                                        </span>
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-label="Belum ada" />
                                    )}
                                </div>
                                {diagnosaList.length > 0 && (
                                    <div className="pl-5 space-y-0.5">
                                        {diagnosaList.slice(0, 3).map((d, i) => (
                                            <p key={d.code} className="text-xs text-muted-foreground">
                                                {i === 0 && <span className="text-blue-600 font-medium">● </span>}
                                                {d.code} — {d.name}
                                            </p>
                                        ))}
                                        {diagnosaList.length > 3 && (
                                            <p className="text-xs text-muted-foreground">+{diagnosaList.length - 3} lainnya</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Tindakan Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">Tindakan</span>
                                    {tindakanList.length > 0 ? (
                                        <span className="ml-auto text-xs bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 font-medium">
                                            {tindakanList.length}
                                        </span>
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-label="Belum ada" />
                                    )}
                                </div>
                                {tindakanList.length > 0 && (
                                    <div className="pl-5 space-y-0.5">
                                        {tindakanList.slice(0, 3).map((t) => (
                                            <p key={t.code} className="text-xs text-muted-foreground">
                                                {t.code} — {t.name}
                                            </p>
                                        ))}
                                        {tindakanList.length > 3 && (
                                            <p className="text-xs text-muted-foreground">+{tindakanList.length - 3} lainnya</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Resep Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">Resep</span>
                                    {resepStatus !== "Draft" ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" aria-label={resepStatus} />
                                    ) : resepList.length > 0 ? (
                                        <span className="ml-auto text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                                            {resepList.length} obat
                                        </span>
                                    ) : (
                                        <XCircle className="h-3.5 w-3.5 text-muted-foreground ml-auto" aria-label="Belum ada" />
                                    )}
                                </div>
                                {resepList.length > 0 && (
                                    <div className="pl-5 space-y-0.5">
                                        {resepList.slice(0, 3).map((r) => (
                                            <p key={r.id} className="text-xs text-muted-foreground">
                                                {r.nama_obat} — {r.jumlah}
                                            </p>
                                        ))}
                                        {resepList.length > 3 && (
                                            <p className="text-xs text-muted-foreground">+{resepList.length - 3} lainnya</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

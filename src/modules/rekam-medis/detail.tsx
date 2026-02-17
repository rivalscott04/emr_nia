import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { AlertBanner } from "../../components/ui/alert-banner"
import { TooltipTrigger } from "../../components/ui/tooltip"
import { ArrowLeft, CheckCircle2, FileText, Activity, Stethoscope, Pill, Lock, Plus } from "lucide-react"
import { TTVForm } from "./components/ttv-form"
import { SOAPForm } from "./components/soap-form"
import { DiagnosaForm } from "./components/diagnosa-form"
import { ResepForm } from "./components/resep-form"
import { useRekamMedisStore } from "../../store/rekam-medis-store"
import { Textarea } from "../../components/ui/textarea"

export default function RekamMedisPage() {
    const { kunjunganId } = useParams<{ kunjunganId: string }>()
    const {
        patient,
        recordStatus,
        soap,
        ttv,
        diagnosaList,
        resepList,
        addendums,
        canFinalize,
        finalizeRecord,
        addAddendum,
    } = useRekamMedisStore()

    const [finalizationErrors, setFinalizationErrors] = useState<string[]>([])
    const [addendumText, setAddendumText] = useState("")

    const isLocked = recordStatus === "Final"

    const handleFinalize = () => {
        const { ok, errors } = canFinalize()
        if (!ok) {
            setFinalizationErrors(errors)
            return
        }
        setFinalizationErrors([])
        finalizeRecord()
    }

    const handleAddAddendum = () => {
        if (!addendumText.trim()) return
        addAddendum(addendumText.trim())
        setAddendumText("")
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <TooltipTrigger label="Kembali ke daftar kunjungan" side="bottom">
                        <Button variant="ghost" size="icon" asChild aria-label="Kembali">
                            <Link to="/kunjungan"><ArrowLeft className="h-4 w-4" aria-hidden /></Link>
                        </Button>
                    </TooltipTrigger>
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
                            <TabsTrigger value="ttv" className="flex-1 max-w-[150px] gap-2">
                                <Activity className="h-4 w-4" /> TTV
                            </TabsTrigger>
                            <TabsTrigger value="diagnosa" className="flex-1 max-w-[150px] gap-2">
                                <Stethoscope className="h-4 w-4" /> Diagnosa
                            </TabsTrigger>
                            <TabsTrigger value="resep" className="flex-1 max-w-[150px] gap-2">
                                <Pill className="h-4 w-4" /> Resep
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="soap">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Catatan Pemeriksaan (SOAP)</h2>
                                <p className="text-sm text-muted-foreground">Subjektif, Objektif, Assessment, Plan.</p>
                            </div>
                            <SOAPForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="ttv">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Tanda Tanda Vital</h2>
                                <p className="text-sm text-muted-foreground">Isi data vital sign pasien.</p>
                            </div>
                            <TTVForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="diagnosa">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">Diagnosa ICD-10</h2>
                                <p className="text-sm text-muted-foreground">Pencarian dan input diagnosa.</p>
                            </div>
                            <DiagnosaForm disabled={isLocked} />
                        </TabsContent>

                        <TabsContent value="resep">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">E-Resep</h2>
                                <p className="text-sm text-muted-foreground">Input resep obat untuk pasien.</p>
                            </div>
                            <ResepForm disabled={isLocked} />
                        </TabsContent>
                    </Tabs>

                    {/* Finalize / Addendum Section */}
                    {!isLocked ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold">Finalisasi Rekam Medis</h3>
                                        <p className="text-sm text-muted-foreground">Setelah finalisasi, data tidak dapat diubah lagi.</p>
                                    </div>
                                    <Button onClick={handleFinalize} variant="default" size="lg">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Finalisasi
                                    </Button>
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
                                        <Button onClick={handleAddAddendum} disabled={!addendumText.trim()} size="sm">
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
                                        <span className="ml-auto text-xs text-muted-foreground">Belum lengkap</span>
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

                            {/* TTV Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">TTV</span>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground pl-5">
                                    <span>TD: {ttv.sistole}/{ttv.diastole}</span>
                                    <span>Nadi: {ttv.nadi}</span>
                                    <span>Suhu: {ttv.suhu}°C</span>
                                    <span>SpO2: {ttv.spo2}%</span>
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
                                        <span className="ml-auto text-xs text-muted-foreground">Belum ada</span>
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

                            {/* Resep Summary */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="font-medium text-slate-700">Resep</span>
                                    {resepList.length > 0 ? (
                                        <span className="ml-auto text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                                            {resepList.length} obat
                                        </span>
                                    ) : (
                                        <span className="ml-auto text-xs text-muted-foreground">Belum ada</span>
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

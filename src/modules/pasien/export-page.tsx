import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { PageHeader } from "../../components/layout/page-header"
import { useAuth } from "../auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { PasienService } from "../../services/pasien-service"

const EXPORT_LIMIT_OPTIONS = [
    { value: "10", label: "10 pasien" },
    { value: "25", label: "25 pasien" },
    { value: "50", label: "50 pasien" },
    { value: "100", label: "100 pasien" },
    { value: "200", label: "200 pasien" },
    { value: "500", label: "500 pasien" },
    { value: "1000", label: "1.000 pasien" },
    { value: "10000", label: "Semua (maks. 10.000)" },
] as const

const FORMAT_OPTIONS = [
    { value: "csv", label: "CSV (Excel / Google Sheets)" },
    { value: "pdf", label: "PDF" },
] as const

export default function ExportPasienPage() {
    const navigate = useNavigate()
    const { isDokter } = useAuth()
    const [limit, setLimit] = useState<string>("100")
    const [format, setFormat] = useState<"csv" | "pdf">("csv")

    useEffect(() => {
        if (!isDokter) {
            navigate("/dashboard", { replace: true })
        }
    }, [isDokter, navigate])

    const exportMutation = useMutation({
        mutationFn: ({ count, fmt }: { count: number; fmt: "csv" | "pdf" }) =>
            PasienService.exportPasien(count, fmt),
        onSuccess: (_, { fmt }) => {
            toast.success(
                fmt === "pdf"
                    ? "Export berhasil. File PDF telah diunduh."
                    : "Export berhasil. File CSV telah diunduh."
            )
        },
        onError: (err: Error) => {
            toast.error(err.message || "Export gagal. Coba lagi.")
        },
    })

    const handleExport = () => {
        const count = Math.min(10000, Math.max(1, parseInt(limit, 10) || 100))
        exportMutation.mutate({ count, fmt: format })
    }

    if (!isDokter) {
        return null
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Export Pasien"
                description="Unduh daftar pasien yang pernah Anda tangani (untuk keperluan pajak atau arsip). Data menyertakan nama dokter."
            />

            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {format === "pdf" ? (
                            <FileText className="h-5 w-5 text-slate-600" aria-hidden />
                        ) : (
                            <FileSpreadsheet className="h-5 w-5 text-slate-600" aria-hidden />
                        )}
                        Export ke {format.toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                        Pilih format dan jumlah pasien. Data diurutkan dari kunjungan terbaru dan mencantumkan nama dokter.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="export-format">Format</Label>
                        <Select value={format} onValueChange={(v) => setFormat(v as "csv" | "pdf")}>
                            <SelectTrigger id="export-format" className="w-full">
                                <SelectValue placeholder="Pilih format" />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="export-limit">Jumlah pasien</Label>
                        <Select value={limit} onValueChange={setLimit}>
                            <SelectTrigger id="export-limit" className="w-full">
                                <SelectValue placeholder="Pilih jumlah" />
                            </SelectTrigger>
                            <SelectContent>
                                {EXPORT_LIMIT_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="w-full sm:w-auto"
                    >
                        {exportMutation.isPending ? (
                            "Memproses..."
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                                Unduh {format === "pdf" ? "PDF" : "CSV"}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

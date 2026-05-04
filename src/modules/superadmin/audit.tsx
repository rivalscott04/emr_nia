import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "../../components/layout/page-header"
import { AlertBanner } from "../../components/ui/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { DataTable } from "../../components/ui/data-table"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { AuditLogService } from "../../services/audit-log-service"
import { LIST_LIMIT_MASTER } from "../../lib/list-limits"
import { auditLogColumns } from "./column-def"

export default function SuperadminAuditPage() {
    const [auditQuery, setAuditQuery] = useState("")
    const [auditMethod, setAuditMethod] = useState("all")
    const [auditStatusCode, setAuditStatusCode] = useState("")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const { data: auditResponse, isLoading: auditLoading } = useQuery({
        queryKey: ["audit", "logs", auditQuery, auditMethod, auditStatusCode, dateFrom, dateTo],
        queryFn: () =>
            AuditLogService.getAll({
                q: auditQuery || undefined,
                method: auditMethod !== "all" ? auditMethod : undefined,
                status_code: auditStatusCode || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                limit: LIST_LIMIT_MASTER,
            }),
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Buku Catatan Aktivitas Sistem"
                description="Catatan siapa melakukan apa, di bagian mana, dan hasilnya. Hanya untuk melihat, tidak bisa mengubah data."
            />

            <AlertBanner variant="info">
                Gunakan filter di bawah untuk mencari aktivitas tertentu. Data di sini hanya untuk dibaca.
            </AlertBanner>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Daftar Aktivitas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-5">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="audit-search">Cari nama pengguna atau lokasi</Label>
                            <Input
                                id="audit-search"
                                placeholder="Contoh: rekam medis, kunjungan, Super Admin"
                                value={auditQuery}
                                onChange={(event) => setAuditQuery(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis tindakan</Label>
                            <Select value={auditMethod} onValueChange={setAuditMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="GET">Melihat data</SelectItem>
                                    <SelectItem value="POST">Menambah data baru</SelectItem>
                                    <SelectItem value="PUT">Mengubah data</SelectItem>
                                    <SelectItem value="PATCH">Mengubah data (sebagian)</SelectItem>
                                    <SelectItem value="DELETE">Menghapus data</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-code">Hasil (opsional)</Label>
                            <Input
                                id="status-code"
                                placeholder="Contoh: 200 = berhasil, 500 = gagal"
                                value={auditStatusCode}
                                onChange={(event) => setAuditStatusCode(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-from">Dari tanggal</Label>
                            <Input id="date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-to">Sampai tanggal</Label>
                            <Input id="date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                        </div>
                    </div>
                    <DataTable
                        columns={auditLogColumns}
                        data={auditResponse?.items ?? []}
                        searchKey="path"
                        isLoading={auditLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}


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
                limit: 100,
            }),
    })

    return (
        <div className="space-y-6">
            <PageHeader
                title="Audit Log"
                description="Audit aktivitas API dan sistem. Halaman ini hanya untuk pemantauan, tanpa konfigurasi lain."
            />

            <AlertBanner variant="info">
                Gunakan filter untuk investigasi insiden. Data di sini read-only, tidak ada aksi tulis.
            </AlertBanner>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Audit Aktivitas Sistem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-5">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="audit-search">Cari Aktor/Endpoint</Label>
                            <Input
                                id="audit-search"
                                placeholder="Contoh: superadmin/users"
                                value={auditQuery}
                                onChange={(event) => setAuditQuery(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Method</Label>
                            <Select value={auditMethod} onValueChange={setAuditMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status-code">Status Code</Label>
                            <Input
                                id="status-code"
                                placeholder="200 / 403 / 500"
                                value={auditStatusCode}
                                onChange={(event) => setAuditStatusCode(event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-from">Dari Tanggal</Label>
                            <Input id="date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date-to">Sampai Tanggal</Label>
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


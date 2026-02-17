import { useState } from "react"
import { PageHeader } from "../../components/layout/page-header"
import { AlertBanner } from "../../components/ui/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { DataTable } from "../../components/ui/data-table"

type SyncHistoryItem = {
    id: number
    started_at: string
    finished_at?: string
    status: "success" | "failed" | "running"
    message?: string
}

// NOTE:
// Halaman ini fokus UI dulu. Integrasi ke backend Laravel:
// - GET  /api/superadmin/obat-sync       -> list history
// - POST /api/superadmin/obat-sync       -> trigger sync baru
// Silakan sambungkan ke endpoint tersebut di service terpisah nanti.

const columns = [
    {
        header: "Waktu Mulai",
        accessorKey: "started_at",
    },
    {
        header: "Waktu Selesai",
        accessorKey: "finished_at",
    },
    {
        header: "Status",
        accessorKey: "status",
    },
    {
        header: "Keterangan",
        accessorKey: "message",
    },
] as const

export default function SuperadminSyncObatPage() {
    const [isSyncing, setIsSyncing] = useState(false)
    const [history] = useState<SyncHistoryItem[]>([])

    const handleSyncClick = () => {
        // Placeholder: ganti dengan pemanggilan service sync obat ketika backend siap.
        setIsSyncing(true)
        setTimeout(() => {
            setIsSyncing(false)
        }, 1500)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sync Obat"
                description="Sinkronisasi master obat berdasarkan kode dari sistem sumber (SIMRS / farmasi)."
            />

            <AlertBanner variant="warning">
                Jalankan sync hanya saat dibutuhkan, misalnya setelah update data obat di sistem sumber. Pastikan user sedang tidak aktif
                menginput resep saat proses sync besar.
            </AlertBanner>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl">Kontrol Sync Obat</CardTitle>
                    <Button onClick={handleSyncClick} disabled={isSyncing}>
                        {isSyncing ? "Sedang sync..." : "Sync sekarang"}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Sync akan menarik daftar obat dari sistem sumber berdasarkan kode, lalu meng‑update / menambah master obat di EMR.
                        Konflik kode atau error mapping sebaiknya direkam di log backend.
                    </p>
                    <DataTable columns={columns as any} data={history} searchKey="message" />
                    {history.length === 0 && (
                        <p className="text-sm text-muted-foreground">Belum ada riwayat sync obat.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


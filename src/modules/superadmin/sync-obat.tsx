import { useState, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "../../components/layout/page-header"
import { AlertBanner } from "../../components/ui/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { DataTable } from "../../components/ui/data-table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Loader2 } from "lucide-react"
import { ObatSyncService, type ObatSyncLogItem, type TriggerObatSyncCredentials } from "../../services/obat-sync-service"
import { toast } from "sonner"

function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return "—"
    const d = new Date(iso)
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(d)
}

function StatusBadge({ status }: { status: string }) {
    const variant =
        status === "success"
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
            : status === "failed"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variant}`}
        >
            {status === "success" ? "Sukses" : status === "failed" ? "Gagal" : "Berjalan"}
        </span>
    )
}

const columns: ColumnDef<ObatSyncLogItem>[] = [
    {
        accessorKey: "started_at",
        header: "Waktu Mulai",
        cell: ({ row }) => formatDateTime(row.getValue("started_at") as string),
    },
    {
        accessorKey: "finished_at",
        header: "Waktu Selesai",
        cell: ({ row }) => formatDateTime(row.getValue("finished_at") as string | null),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />,
    },
    {
        accessorKey: "message",
        header: "Keterangan",
        cell: ({ row }) => (
            <span className="max-w-[320px] truncate block" title={row.getValue("message") as string}>
                {(row.getValue("message") as string) || "—"}
            </span>
        ),
    },
]

export default function SuperadminSyncObatPage() {
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const { data: history = [], isLoading } = useQuery({
        queryKey: ["superadmin", "obat-sync"],
        queryFn: ObatSyncService.getLogs,
    })

    const refetchLogs = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["superadmin", "obat-sync"] })
    }, [queryClient])

    const handleSyncClick = () => {
        setUsername("")
        setPassword("")
        setModalOpen(true)
    }

    const handleModalSubmit = async () => {
        const credentials: TriggerObatSyncCredentials = {}
        if (username.trim()) credentials.username = username.trim()
        if (password) credentials.password = password

        setIsSyncing(true)
        try {
            await ObatSyncService.triggerSync(credentials)
            toast.success("Sync obat selesai. Data telah diperbarui.")
            setModalOpen(false)
            refetchLogs()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Sync gagal. Periksa kredensial atau log backend."
            toast.error(message)
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sync Obat"
                description="Sinkronisasi master obat berdasarkan kode dari sistem sumber (SIMRS / farmasi)."
            />

            <AlertBanner variant="warning">
                Jalankan sync hanya saat dibutuhkan, misalnya setelah update data obat di sistem sumber. Pastikan user
                sedang tidak aktif menginput resep saat proses sync besar.
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
                        Sync akan menarik daftar obat dari sistem sumber berdasarkan kode, lalu meng‑update / menambah
                        master obat di EMR. Konflik kode atau error mapping sebaiknya direkam di log backend.
                    </p>

                    <div>
                        <h3 className="mb-2 text-sm font-medium">Riwayat Sync Obat</h3>
                        <DataTable
                            columns={columns}
                            data={history}
                            searchKey="message"
                            isLoading={isLoading}
                        />
                        {!isLoading && history.length === 0 && (
                            <p className="mt-2 text-sm text-muted-foreground">Belum ada riwayat sync obat.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Kredensial API Eksternal</DialogTitle>
                        <DialogDescription>
                            Masukkan username dan password untuk login ke sistem sumber (SIMRS / farmasi). Data hanya
                            digunakan untuk sekali proses sync dan tidak disimpan. Kosongkan jika backend sudah
                            dikonfigurasi token di env.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sync-username">Username</Label>
                            <Input
                                id="sync-username"
                                type="text"
                                placeholder="Username API"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isSyncing}
                                autoComplete="username"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sync-password">Password</Label>
                            <Input
                                id="sync-password"
                                type="password"
                                placeholder="Password API"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSyncing}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSyncing}>
                            Batal
                        </Button>
                        <Button onClick={handleModalSubmit} disabled={isSyncing}>
                            {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                            {isSyncing ? "Sedang sync..." : "Login & Sync"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

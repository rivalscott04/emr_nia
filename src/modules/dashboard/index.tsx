import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Users, Calendar, Activity, Pill } from "lucide-react"
import { DashboardService } from "../../services/dashboard-service"
import type { DashboardSummary } from "../../types/dashboard"

function formatKunjunganComparison(current: number, previous: number): string {
    if (previous === 0 && current === 0) {
        return "Belum ada kunjungan yang tercatat."
    }

    if (previous === 0) {
        return "Tidak ada data pembanding dari hari sebelumnya."
    }

    const diff = current - previous
    const absDiff = Math.abs(diff)
    const percent = Math.round((absDiff / previous) * 100)

    if (diff > 0) {
        return `Naik ${absDiff} kunjungan dari kemarin (~${percent}%).`
    }

    if (diff < 0) {
        return `Turun ${absDiff} kunjungan dari kemarin (~${percent}%).`
    }

    return "Jumlah kunjungan sama dengan kemarin."
}

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery<DashboardSummary>({
        queryKey: ["dashboard", "summary"],
        queryFn: DashboardService.getSummary,
    })

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard tidak dapat dimuat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Terjadi kendala saat mengambil data ringkasan. Silakan coba beberapa saat lagi atau hubungi
                            admin jika masalah berlanjut.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const stats = data?.stats

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pasien Hari Ini
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : stats?.total_pasien_hari_ini ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pasien unik yang tercatat dalam kunjungan hari ini.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Kunjungan
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : stats?.total_kunjungan ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isLoading || !stats
                                ? "Menghitung perbandingan dengan hari sebelumnya…"
                                : formatKunjunganComparison(
                                      stats.total_kunjungan,
                                      stats.total_kunjungan_kemarin ?? 0
                                  )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Resep Keluar
                        </CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : stats?.resep_keluar ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Resep yang dikirim ke farmasi hari ini.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tindakan Medis
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : stats?.tindakan_medis ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total tindakan yang tercatat pada sistem. Angka ini akan terisi penuh saat modul tindakan
                            diaktifkan.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top Diagnosa (30 hari terakhir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Memuat ringkasan diagnosa…
                            </p>
                        ) : !data || data.top_diagnosa.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada diagnosa tercatat pada periode ini.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {data.top_diagnosa.map((item, i) => (
                                    <div key={item.code + i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {item.name} ({item.code})
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">{item.count} kasus</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Obat (30 hari terakhir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Memuat ringkasan obat…
                            </p>
                        ) : !data || data.top_obat.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada obat yang diresepkan pada periode ini.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {data.top_obat.map((item, i) => (
                                    <div key={item.name + i} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{item.name}</p>
                                        </div>
                                        <div className="ml-auto font-medium">{item.count} resep</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Users, Calendar, Activity, Pill, ChevronRight } from "lucide-react"
import { useAuth } from "../auth/auth-context"
import { DashboardService } from "../../services/dashboard-service"
import { KunjunganService } from "../../services/kunjungan-service"
import { LIST_LIMIT_RECENT } from "../../lib/list-limits"
import type { DashboardSummary } from "../../types/dashboard"
import { formatIdInteger } from "../../lib/locale-format"

const CHART_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"]

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
        return `Naik ${formatIdInteger(absDiff)} kunjungan dari kemarin (~${percent}%).`
    }

    if (diff < 0) {
        return `Turun ${formatIdInteger(absDiff)} kunjungan dari kemarin (~${percent}%).`
    }

    return "Jumlah kunjungan sama dengan kemarin."
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10)
}

export default function DashboardPage() {
    const { isDokter } = useAuth()
    const { data, isLoading, error } = useQuery<DashboardSummary>({
        queryKey: ["dashboard", "summary"],
        queryFn: DashboardService.getSummary,
    })
    const { data: kunjunganHariIni, isLoading: loadingKunjungan } = useQuery({
        queryKey: ["kunjungan", "hari-ini", todayISO()],
        queryFn: () => KunjunganService.getList({ tanggal: todayISO(), limit: LIST_LIMIT_RECENT }),
        enabled: isDokter,
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
                            {isDokter ? "Pasien Saya Hari Ini" : "Total Pasien Hari Ini"}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : formatIdInteger(stats?.total_pasien_hari_ini ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isDokter
                                ? "Pasien unik dalam kunjungan Anda hari ini."
                                : "Pasien unik yang tercatat dalam kunjungan hari ini."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isDokter ? "Kunjungan Saya Hari Ini" : "Total Kunjungan"}
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : formatIdInteger(stats?.total_kunjungan ?? 0)}
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
                            {isDokter ? "Resep Saya Keluar" : "Resep Keluar"}
                        </CardTitle>
                        <Pill className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : formatIdInteger(stats?.resep_keluar ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isDokter
                                ? "Resep Anda yang dikirim ke farmasi hari ini."
                                : "Resep yang dikirim ke farmasi hari ini."}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isDokter ? "Tindakan Saya" : "Tindakan Medis"}
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? "…" : formatIdInteger(stats?.tindakan_medis ?? 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total tindakan yang tercatat pada sistem. Angka ini akan terisi penuh saat modul tindakan
                            diaktifkan.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {isDokter && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Kunjungan 7 Hari Terakhir</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? "…" : formatIdInteger(stats?.total_kunjungan_minggu_ini ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total kunjungan Anda dalam 7 hari terakhir.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Kunjungan Hari Ini</CardTitle>
                            {kunjunganHariIni && kunjunganHariIni.total > 5 && (
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/kunjungan">
                                        Lihat semua <ChevronRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loadingKunjungan ? (
                                <p className="text-sm text-muted-foreground">Memuat…</p>
                            ) : !kunjunganHariIni || kunjunganHariIni.items.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada kunjungan hari ini.
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {kunjunganHariIni.items.map((k) => (
                                        <li key={k.id}>
                                            <Link
                                                to={`/rekam-medis/${k.id}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                {k.pasien_nama}
                                            </Link>
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                {k.keluhan_utama || "–"}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {!isDokter && (
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
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.top_diagnosa.map((d) => ({
                                            label: d.code,
                                            count: d.count,
                                            name: d.name,
                                        }))}
                                        layout="vertical"
                                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                                    >
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <YAxis type="category" dataKey="label" width={56} tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(value) => [
                                                value != null ? `${formatIdInteger(Number(value))} kasus` : "0 kasus",
                                                "Jumlah",
                                            ]}
                                            labelFormatter={(_, payload) =>
                                                payload[0]?.payload?.name
                                                    ? `${payload[0].payload.name} (${payload[0].payload.label})`
                                                    : payload[0]?.payload?.label
                                            }
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                            {data.top_diagnosa.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
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
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.top_obat.map((d) => ({
                                            label: d.name.length > 14 ? `${d.name.slice(0, 14)}…` : d.name,
                                            count: d.count,
                                            name: d.name,
                                        }))}
                                        layout="vertical"
                                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                                    >
                                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(value) => [
                                                value != null ? `${formatIdInteger(Number(value))} resep` : "0 resep",
                                                "Jumlah",
                                            ]}
                                            labelFormatter={(_, payload) =>
                                                (payload[0]?.payload?.name as string) ?? payload[0]?.payload?.label
                                            }
                                        />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                                            {data.top_obat.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            )}
        </div>
    )
}


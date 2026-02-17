import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Users, Calendar, Activity, Pill } from "lucide-react"

const stats = [
    {
        title: "Total Pasien Hari Ini",
        value: "12",
        icon: Users,
        description: "+2 dari kemarin",
    },
    {
        title: "Total Kunjungan",
        value: "45",
        icon: Calendar,
        description: "+10% dari minggu lalu",
    },
    {
        title: "Resep Keluar",
        value: "32",
        icon: Pill,
        description: "85% tebus obat",
    },
    {
        title: "Tindakan Medis",
        value: "8",
        icon: Activity,
        description: "Mayoritas pemeriksaan umum",
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top Diagnosa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Hipertensi Esensial (I10)", count: 45 },
                                { name: "ISPA (J06.9)", count: 32 },
                                { name: "Diabetes Mellitus (E11)", count: 28 },
                                { name: "Dispepsia (K30)", count: 15 },
                                { name: "Myalgia (M79.1)", count: 12 },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{item.count} Kasus</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Obat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: "Paracetamol 500mg", count: 120 },
                                { name: "Amoxicillin 500mg", count: 85 },
                                { name: "Captopril 25mg", count: 60 },
                                { name: "Omeprazole 20mg", count: 45 },
                                { name: "Cetirizine 10mg", count: 40 },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.name}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{item.count} Pcs</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

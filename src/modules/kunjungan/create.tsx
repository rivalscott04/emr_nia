import { useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form"
import { Combobox } from "../../components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { useNavigate, useSearchParams } from "react-router-dom"
import { KunjunganService } from "../../services/kunjungan-service"
import { PasienService } from "../../services/pasien-service"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "../../components/ui/skeleton"

const formSchema = z.object({
    pasien_id: z.string().min(1, "Pilih pasien"),
    dokter_id: z.string().min(1, "Pilih dokter"),
    poli: z.string().min(1, "Pilih poli"),
    keluhan_utama: z.string().min(5, "Keluhan utama harus diisi"),
    td_sistole: z.union([z.coerce.number().min(0).max(300), z.nan(), z.literal(""), z.undefined()]).refine((v) => v !== "" && v !== undefined && !Number.isNaN(Number(v)), { message: "TD Sistole harus diisi" }).transform((v) => Number(v)),
    td_diastole: z.union([z.coerce.number().min(0).max(200), z.nan(), z.literal(""), z.undefined()]).refine((v) => v !== "" && v !== undefined && !Number.isNaN(Number(v)), { message: "TD Diastole harus diisi" }).transform((v) => Number(v)),
    berat_badan: z.union([z.coerce.number().min(0).max(500), z.nan(), z.literal(""), z.undefined()]).refine((v) => v !== "" && v !== undefined && !Number.isNaN(Number(v)), { message: "Berat badan harus diisi" }).transform((v) => Number(v)),
    tinggi_badan: z.union([z.coerce.number().min(0).max(300), z.nan(), z.literal(""), z.undefined()]).refine((v) => v !== "" && v !== undefined && !Number.isNaN(Number(v)), { message: "Tinggi badan harus diisi" }).transform((v) => Number(v)),
    hpht: z.string().optional().transform((v) => (v === "" ? undefined : v)),
    gravida: z.union([z.coerce.number().min(0).max(20), z.nan(), z.literal("")]).optional().transform((v) => (v === "" || Number.isNaN(v) ? undefined : v)),
    para: z.union([z.coerce.number().min(0).max(20), z.nan(), z.literal("")]).optional().transform((v) => (v === "" || Number.isNaN(v) ? undefined : v)),
    abortus: z.union([z.coerce.number().min(0).max(20), z.nan(), z.literal("")]).optional().transform((v) => (v === "" || Number.isNaN(v) ? undefined : v)),
})

export default function KunjunganCreatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const pasienIdParam = searchParams.get("pasienId")
    const [loading, setLoading] = useState(false)
    const { data: pasienOptions = [], isLoading: isPasienOptionsLoading } = useQuery({
        queryKey: ["pasien", "options"],
        queryFn: PasienService.getAll,
    })
    const { data: dokterOptions = [], isLoading: isDokterOptionsLoading } = useQuery({
        queryKey: ["kunjungan", "dokter-options"],
        queryFn: KunjunganService.getDokterOptions,
    })
    const { data: poliOptions = [], isLoading: isPoliOptionsLoading } = useQuery({
        queryKey: ["kunjungan", "poli-options"],
        queryFn: KunjunganService.getPoliOptions,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pasien_id: pasienIdParam || "",
            dokter_id: "",
            poli: "",
            keluhan_utama: "",
            td_sistole: undefined,
            td_diastole: undefined,
            berat_badan: undefined,
            tinggi_badan: undefined,
            hpht: "",
            gravida: undefined,
            para: undefined,
            abortus: undefined,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await KunjunganService.create(values)
            toast.success("Kunjungan berhasil dibuat")
            navigate("/kunjungan")
        } catch (error) {
            console.error(error)
            toast.error("Gagal membuat kunjungan")
        } finally {
            setLoading(false)
        }
    }

    const selectedPoli = poliOptions.find((p) => p.name === form.watch("poli"))
    const showObstetri = Boolean(selectedPoli?.supports_obstetri)

    if (isPasienOptionsLoading || isDokterOptionsLoading || isPoliOptionsLoading) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-64 max-w-full" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full md:col-span-2" />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Kembali">
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Buat Kunjungan Baru</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Kunjungan</CardTitle>
                    <CardDescription>Pilih pasien dan tujuan poli.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="pasien_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pasien</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={pasienOptions.map((p) => ({
                                                        value: p.id,
                                                        label: `${p.nama} (${p.no_rm})`,
                                                    }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Pilih Pasien"
                                                    disabled={!!pasienIdParam}
                                                    emptyMessage="Tidak ada pasien."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="poli"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Poli Tujuan</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    form.setValue("dokter_id", "")
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Poli" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {poliOptions.map((p) => (
                                                        <SelectItem key={p.id} value={p.name}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dokter_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dokter Pemeriksa</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={dokterOptions
                                                        .filter((d) => d.poli === form.watch("poli"))
                                                        .map((d) => ({ value: d.id, label: d.nama }))}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder={form.watch("poli") ? "Pilih Dokter" : "Pilih Poli dulu"}
                                                    disabled={!form.watch("poli")}
                                                    emptyMessage="Tidak ada dokter."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="keluhan_utama"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Keluhan Utama</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Contoh: Demam sejak 3 hari lalu..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {showObstetri && (
                                <div className="border-t pt-6 space-y-4">
                                    <h3 className="text-sm font-medium">Data Obstetri</h3>
                                    <p className="text-xs text-muted-foreground">Poli ini memakai data obstetri. HPHT = Hari Pertama Haid Terakhir. G-P-A: Gravida (kehamilan ke-), Para (persalinan hidup), Abortus (riwayat keguguran). Diisi oleh admin poli.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="hpht"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>HPHT</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gravida"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gravida (Kehamilan ke-)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={0} max={20} placeholder="—" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="para"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Para (Jumlah persalinan hidup)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={0} max={20} placeholder="—" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="abortus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Abortus (Riwayat keguguran)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min={0} max={20} placeholder="—" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-6 space-y-4">
                                <h3 className="text-sm font-medium">TTV (Tanda Tanda Vital)</h3>
                                <p className="text-xs text-muted-foreground">Wajib diisi. Data ini akan ditampilkan di Objektif rekam medis.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="td_sistole"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>TD Sistole (mmHg)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} max={300} placeholder="—" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="td_diastole"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>TD Diastole (mmHg)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} max={200} placeholder="—" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="berat_badan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Berat Badan (kg)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} step={0.1} placeholder="—" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tinggi_badan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tinggi Badan (cm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} step={0.1} placeholder="—" {...field} value={field.value ?? ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate(-1)}>Batal</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Menyimpan..." : "Buat Kunjungan"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

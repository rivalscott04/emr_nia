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
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { useNavigate, useSearchParams } from "react-router-dom"
import { KunjunganService } from "../../services/kunjungan-service"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { TooltipTrigger } from "../../components/ui/tooltip"
import { ArrowLeft } from "lucide-react"

const formSchema = z.object({
    pasien_id: z.string().min(1, "Pilih pasien"),
    dokter_id: z.string().min(1, "Pilih dokter"),
    poli: z.string().min(1, "Pilih poli"),
    keluhan_utama: z.string().min(5, "Keluhan utama harus diisi"),
})

export default function KunjunganCreatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const pasienIdParam = searchParams.get("pasienId")
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pasien_id: pasienIdParam || "",
            dokter_id: "",
            poli: "",
            keluhan_utama: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await KunjunganService.create(values)
            navigate("/kunjungan")
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                    <TooltipTrigger label="Kembali ke daftar kunjungan" side="bottom">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Kembali">
                            <ArrowLeft className="h-4 w-4" aria-hidden />
                        </Button>
                    </TooltipTrigger>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!pasienIdParam}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Pasien" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {/* Mock Data */}
                                                    <SelectItem value="1">Budi Santoso</SelectItem>
                                                    <SelectItem value="2">Siti Aminah</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Poli" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Umum">Poli Umum</SelectItem>
                                                    <SelectItem value="Gigi">Poli Gigi</SelectItem>
                                                    <SelectItem value="KIA">Poli KIA</SelectItem>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Dokter" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="D-01">dr. Andi</SelectItem>
                                                    <SelectItem value="D-02">drg. Siti</SelectItem>
                                                </SelectContent>
                                            </Select>
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

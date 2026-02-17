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
import { useNavigate } from "react-router-dom"
import { PasienService } from "../../services/pasien-service"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { TooltipTrigger } from "../../components/ui/tooltip"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    nik: z.string()
        .length(16, "NIK harus tepat 16 digit")
        .regex(/^\d+$/, "NIK harus berupa angka"),
    nama: z.string().min(2, "Nama terlalu pendek"),
    tanggal_lahir: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Tanggal lahir tidak valid",
    }),
    jenis_kelamin: z.enum(["L", "P"]),
    alamat: z.string().min(5, "Alamat terlalu pendek"),
    no_hp: z.string()
        .min(8, "Nomor HP minimal 8 digit")
        .max(13, "Nomor HP maksimal 13 digit")
        .regex(/^\d+$/, "Nomor HP harus berupa angka")
        .startsWith("08", "Nomor HP harus diawali 08"),
})

export default function PasienCreatePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            nik: "",
            nama: "",
            tanggal_lahir: "",
            alamat: "",
            no_hp: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            await PasienService.create(values)
            toast.success("Data pasien berhasil disimpan")
            navigate("/pasien")
        } catch (error) {
            console.error(error)
            toast.error("Gagal menyimpan data pasien")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                    <TooltipTrigger label="Kembali ke daftar pasien" side="bottom">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Kembali">
                            <ArrowLeft className="h-4 w-4" aria-hidden />
                        </Button>
                    </TooltipTrigger>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tambah Pasien Baru</h1>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Pribadi</CardTitle>
                    <CardDescription>Isi data pasien dengan lengkap dan valid.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="nik"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NIK</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="16 digit NIK"
                                                    maxLength={16}
                                                    {...field}
                                                    onChange={(e) => {
                                                        // Hanya terima angka dan batasi 16 karakter
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Lengkap</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nama sesuai KTP" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="jenis_kelamin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jenis Kelamin</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="L">Laki-laki</SelectItem>
                                                    <SelectItem value="P">Perempuan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tanggal_lahir"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Lahir</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="no_hp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nomor HP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="08..."
                                                    maxLength={13}
                                                    {...field}
                                                    onChange={(e) => {
                                                        // Hanya terima angka dan batasi 13 karakter
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 13)
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="alamat"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Alamat Lengkap</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Jl..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => navigate(-1)}>Batal</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Menyimpan..." : "Simpan Data Pasien"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

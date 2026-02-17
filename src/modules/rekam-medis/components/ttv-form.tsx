import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../../../components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { useEffect, useState } from "react"
import { Save, Lock } from "lucide-react"
import { useRekamMedisStore } from "../../../store/rekam-medis-store"

const formSchema = z.object({
    sistole: z.coerce.number().min(0).max(300),
    diastole: z.coerce.number().min(0).max(200),
    nadi: z.coerce.number().min(0).max(300),
    rr: z.coerce.number().min(0).max(100),
    suhu: z.coerce.number().min(30).max(45),
    spo2: z.coerce.number().min(0).max(100),
    berat_badan: z.coerce.number().min(0).max(500),
    tinggi_badan: z.coerce.number().min(0).max(300),
})

interface TTVFormProps {
    disabled?: boolean
}

export function TTVForm({ disabled = false }: TTVFormProps) {
    const [loading, setLoading] = useState(false)
    const { ttv, updateTTV } = useRekamMedisStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: ttv,
    })

    // Sync form changes to store
    useEffect(() => {
        const subscription = form.watch((values) => {
            updateTTV(values as Partial<z.infer<typeof formSchema>>)
        })
        return () => subscription.unsubscribe()
    }, [form, updateTTV])

    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        updateTTV(values)
        console.log(values)
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <Card>
            <CardContent className="pt-6">
                {disabled && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <Lock className="h-4 w-4" />
                        Rekam medis telah difinalisasi. Data tidak dapat diubah.
                    </div>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="sistole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TD Sistole (mmHg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="diastole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TD Diastole (mmHg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nadi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nadi (x/mnt)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rr"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>RR (x/mnt)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="suhu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Suhu (°C)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="spo2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SpO2 (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
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
                                        <FormLabel>Berat (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" disabled={disabled} {...field} />
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
                                        <FormLabel>Tinggi (cm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" disabled={disabled} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {!disabled && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} size="sm">
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? "Menyimpan" : "Simpan TTV"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

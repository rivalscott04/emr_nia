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
import { Textarea } from "../../../components/ui/textarea"
import { Card, CardContent } from "../../../components/ui/card"
import { useEffect, useState } from "react"
import { Save, Lock } from "lucide-react"
import { useRekamMedisStore } from "../../../store/rekam-medis-store"

const formSchema = z.object({
    subjective: z.string().min(1, "Subjective harus diisi"),
    objective: z.string().min(1, "Objective harus diisi"),
    assessment: z.string().min(1, "Assessment harus diisi"),
    plan: z.string().min(1, "Plan harus diisi"),
    instruksi: z.string().optional(),
})

interface SOAPFormProps {
    disabled?: boolean
}

export function SOAPForm({ disabled = false }: SOAPFormProps) {
    const [loading, setLoading] = useState(false)
    const { soap, updateSOAP } = useRekamMedisStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: soap,
    })

    // Sync form changes to store
    useEffect(() => {
        const subscription = form.watch((values) => {
            updateSOAP(values as Partial<z.infer<typeof formSchema>>)
        })
        return () => subscription.unsubscribe()
    }, [form, updateSOAP])

    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        updateSOAP(values)
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="subjective"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-base font-semibold text-primary">Subjective (S)</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Textarea placeholder="Keluhan pasien, riwayat penyakit..." className="min-h-[100px]" disabled={disabled} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="objective"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-primary">Objective (O)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Hasil pemeriksaan fisik..." className="min-h-[100px]" disabled={disabled} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assessment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-primary">Assessment (A)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Diagnosa kerja..." className="min-h-[80px]" disabled={disabled} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="plan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-primary">Plan (P)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Rencana terapi/tindakan..." className="min-h-[80px]" disabled={disabled} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="instruksi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-slate-700">Instruksi Khusus</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Instruksi tambahan untuk perawat/farmasi (opsional)..." className="min-h-[60px]" disabled={disabled} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!disabled && (
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} size="lg">
                                    <Save className="mr-2 h-4 w-4" />
                                    {loading ? "Menyimpan" : "Simpan SOAP"}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

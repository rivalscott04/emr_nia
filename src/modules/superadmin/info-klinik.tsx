import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PageHeader } from "../../components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { SuperadminService } from "../../services/superadmin-service"
import { toast } from "sonner"

function formatUpdatedAt(iso: string | null | undefined): string {
    if (!iso) return ""
    try {
        return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
    } catch {
        return ""
    }
}

export default function SuperadminInfoKlinikPage() {
    const queryClient = useQueryClient()
    const [nama, setNama] = useState("")
    const [telepon, setTelepon] = useState("")
    const [alamat, setAlamat] = useState("")

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["superadmin", "clinic-profile"],
        queryFn: SuperadminService.getClinicProfile,
    })

    useEffect(() => {
        if (!data) return
        setNama(data.nama ?? "")
        setTelepon(data.telepon ?? "")
        setAlamat(data.alamat ?? "")
    }, [data])

    const saveMutation = useMutation({
        mutationFn: () =>
            SuperadminService.updateClinicProfile({
                nama: nama.trim() || null,
                telepon: telepon.trim() || null,
                alamat: alamat.trim() || null,
            }),
        onSuccess: (saved) => {
            queryClient.setQueryData(["superadmin", "clinic-profile"], saved)
            toast.success("Profil klinik disimpan.")
        },
        onError: (e: Error) => {
            toast.error(e.message || "Gagal menyimpan profil klinik.")
        },
    })

    const dirty =
        data != null &&
        (nama !== (data.nama ?? "") || telepon !== (data.telepon ?? "") || alamat !== (data.alamat ?? ""))

    return (
        <div className="space-y-6">
            <PageHeader
                title="Info Klinik"
                description="Data profil klinik yang akan tampil di kop surat, resep, dan dokumen cetak."
            />

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Informasi Klinik</CardTitle>
                    {data?.updated_at && (
                        <p className="text-sm text-muted-foreground">
                            Terakhir diperbarui: {formatUpdatedAt(data.updated_at)}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {isError && (
                        <p className="text-sm text-destructive">
                            {(error as Error).message || "Tidak dapat memuat data klinik."}
                        </p>
                    )}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-nama">Nama Klinik</Label>
                            <Input
                                id="clinic-nama"
                                placeholder="Nama klinik"
                                autoComplete="organization"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clinic-telp">No. Telepon</Label>
                            <Input
                                id="clinic-telp"
                                type="tel"
                                placeholder="Nomor telepon"
                                autoComplete="tel"
                                value={telepon}
                                onChange={(e) => setTelepon(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clinic-alamat">Alamat</Label>
                        <Input
                            id="clinic-alamat"
                            placeholder="Alamat lengkap"
                            autoComplete="street-address"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            onClick={() => saveMutation.mutate()}
                            disabled={isLoading || saveMutation.isPending || !dirty}
                        >
                            {saveMutation.isPending ? "Menyimpan…" : "Simpan Perubahan"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

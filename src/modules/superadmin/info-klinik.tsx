import { PageHeader } from "../../components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"

export default function SuperadminInfoKlinikPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Info Klinik"
                description="Data profil klinik yang akan tampil di kop surat, resep, dan dokumen cetak."
            />

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Informasi Klinik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nama Klinik</Label>
                            <Input defaultValue="Klinik Pratama Sehat" />
                        </div>
                        <div className="space-y-2">
                            <Label>No. Telepon</Label>
                            <Input defaultValue="021-5556677" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Alamat</Label>
                        <Input defaultValue="Jl. Sudirman No. 123, Jakarta" />
                    </div>
                    <div className="flex justify-end">
                        <Button>Simpan Perubahan</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground">Konfigurasi sistem klinik.</p>
            </div>

            <Tabs defaultValue="klinik">
                <TabsList>
                    <TabsTrigger value="klinik">Info Klinik</TabsTrigger>
                    <TabsTrigger value="users">Manajemen User</TabsTrigger>
                </TabsList>
                <TabsContent value="klinik" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Klinik</CardTitle>
                            <CardDescription>Data profil klinik yang akan tampil di kop surat/resep.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Nama Klinik</Label>
                                <Input defaultValue="Klinik Pratama Sehat" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Alamat</Label>
                                <Input defaultValue="Jl. Sudirman No. 123, Jakarta" />
                            </div>
                            <div className="grid gap-2">
                                <Label>No. Telepon</Label>
                                <Input defaultValue="021-5556677" />
                            </div>
                            <Button>Simpan Perubahan</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manajemen User</CardTitle>
                            <CardDescription>Daftar pengguna sistem.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 border rounded-md bg-muted/50 text-center text-muted-foreground">
                                Fitur manajemen user akan segera hadir.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

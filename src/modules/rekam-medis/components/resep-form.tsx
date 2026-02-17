import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { AlertBanner } from "../../../components/ui/alert-banner"
import { Plus, Trash2, Lock, Send } from "lucide-react"
import { Label } from "../../../components/ui/label"
import { useRekamMedisStore } from "../../../store/rekam-medis-store"

interface ResepFormProps {
    disabled?: boolean
}

export function ResepForm({ disabled = false }: ResepFormProps) {
    const {
        resepList,
        resepStatus,
        addResepItem,
        removeResepItem,
        sendResep,
        checkAllergy,
    } = useRekamMedisStore()

    const [newItem, setNewItem] = useState({
        nama_obat: "",
        jumlah: "",
        aturan_pakai: "",
    })
    const [allergyWarning, setAllergyWarning] = useState<string | null>(null)

    const isLocked = disabled || resepStatus === "Sent" || resepStatus === "Dispensed"

    const handleDrugNameChange = (value: string) => {
        setNewItem({ ...newItem, nama_obat: value })
        // Check allergy in real-time
        const warning = checkAllergy(value)
        setAllergyWarning(warning)
    }

    const addItem = () => {
        if (!newItem.nama_obat || !newItem.jumlah) return

        // Final allergy check
        const warning = checkAllergy(newItem.nama_obat)
        if (warning) {
            setAllergyWarning(warning)
            return // Block add
        }

        addResepItem({
            ...newItem,
            id: Math.random().toString(36).slice(2),
        })
        setNewItem({ nama_obat: "", jumlah: "", aturan_pakai: "" })
        setAllergyWarning(null)
    }

    const handleSendResep = () => {
        if (resepList.length === 0) return
        sendResep()
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {isLocked && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <Lock className="h-4 w-4" />
                        {resepStatus === "Sent"
                            ? "Resep telah dikirim ke farmasi. Data tidak dapat diubah."
                            : resepStatus === "Dispensed"
                                ? "Resep telah didispensasi."
                                : "Rekam medis telah difinalisasi."}
                    </div>
                )}

                {/* Allergy warning */}
                {allergyWarning && (
                    <AlertBanner variant="danger">
                        {allergyWarning} Obat ini TIDAK BOLEH diberikan.
                    </AlertBanner>
                )}

                {/* Resep status badge */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Status Resep</h3>
                    <Badge variant={
                        resepStatus === "Draft" ? "neutral"
                            : resepStatus === "Sent" ? "warning"
                                : "success"
                    }>
                        {resepStatus === "Draft" ? "Draft"
                            : resepStatus === "Sent" ? "Terkirim ke Farmasi"
                                : "Sudah Didispensasi"}
                    </Badge>
                </div>

                {/* Input form */}
                {!isLocked && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-xl bg-muted/20">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Nama Obat</Label>
                            <Input
                                placeholder="Paracetamol 500mg"
                                value={newItem.nama_obat}
                                onChange={(e) => handleDrugNameChange(e.target.value)}
                                className={allergyWarning ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Jumlah</Label>
                            <Input
                                placeholder="10 Tab"
                                value={newItem.jumlah}
                                onChange={(e) => setNewItem({ ...newItem, jumlah: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Aturan Pakai</Label>
                            <Input
                                placeholder="3x1 sesudah makan"
                                value={newItem.aturan_pakai}
                                onChange={(e) => setNewItem({ ...newItem, aturan_pakai: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            />
                        </div>
                        <Button onClick={addItem} className="md:col-span-4 mt-2" disabled={!!allergyWarning}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Obat
                        </Button>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-medium mb-2">Daftar Resep</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Obat</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Aturan Pakai</TableHead>
                                    {!isLocked && <TableHead className="w-[80px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resepList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isLocked ? 3 : 4} className="text-center text-muted-foreground h-24">Belum ada resep</TableCell>
                                    </TableRow>
                                ) : (
                                    resepList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama_obat}</TableCell>
                                            <TableCell>{item.jumlah}</TableCell>
                                            <TableCell>{item.aturan_pakai}</TableCell>
                                            {!isLocked && (
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeResepItem(item.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {!isLocked && (
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" disabled={resepList.length === 0}>Simpan sebagai Draft</Button>
                        <Button disabled={resepList.length === 0} onClick={handleSendResep}>
                            <Send className="mr-2 h-4 w-4" />
                            Kirim Resep ke Farmasi
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { ICDService, FREQUENT_DIAGNOSES, type ICD } from "../../../services/icd-service"
import { Plus, Trash2, Search, Lock, Zap } from "lucide-react"
import { useRekamMedisStore } from "../../../store/rekam-medis-store"

interface DiagnosaFormProps {
    disabled?: boolean
}

export function DiagnosaForm({ disabled = false }: DiagnosaFormProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ICD[]>([])
    const { diagnosaList, addDiagnosa: storeAdd, removeDiagnosa: storeRemove } = useRekamMedisStore()

    const handleSearch = async () => {
        if (!query) return
        const data = await ICDService.searchICD10(query)
        setResults(data)
    }

    const handleAdd = (icd: ICD) => {
        storeAdd(icd)
        setResults([])
        setQuery("")
    }

    const handleRemove = (code: string) => {
        storeRemove(code)
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {disabled && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <Lock className="h-4 w-4" />
                        Rekam medis telah difinalisasi. Data tidak dapat diubah.
                    </div>
                )}

                {!disabled && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <h3 className="text-sm font-medium">Diagnosa Sering Dipakai</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {FREQUENT_DIAGNOSES.map((icd) => {
                                const isSelected = diagnosaList.some((d) => d.code === icd.code)
                                return (
                                    <button
                                        key={icd.code}
                                        type="button"
                                        onClick={() => !isSelected && handleAdd(icd)}
                                        disabled={isSelected}
                                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isSelected
                                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                                            }`}
                                    >
                                        <span className="font-bold">{icd.code}</span>
                                        <span className="hidden sm:inline">— {icd.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {!disabled && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Cari Diagnosa (ICD-10)</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ketik kode atau nama diagnosa..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} variant="secondary">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        {results.length > 0 && (
                            <div className="border rounded-md p-2 bg-muted/50 max-h-40 overflow-y-auto space-y-1">
                                {results.map((item) => (
                                    <div key={item.code} className="flex items-center justify-between p-2 hover:bg-accent rounded-sm cursor-pointer" onClick={() => handleAdd(item)}>
                                        <span className="text-sm font-medium w-16">{item.code}</span>
                                        <span className="text-sm flex-1">{item.name}</span>
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-medium mb-2">Diagnosa Terpilih</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Diagnosa</TableHead>
                                    {!disabled && <TableHead className="w-[80px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {diagnosaList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={disabled ? 2 : 3} className="text-center text-muted-foreground h-24">Belum ada diagnosa dipilih</TableCell>
                                    </TableRow>
                                ) : (
                                    diagnosaList.map((item, idx) => (
                                        <TableRow key={item.code}>
                                            <TableCell className="font-medium">
                                                {item.code}
                                                {idx === 0 && (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        Utama
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            {!disabled && (
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(item.code)}>
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

                {!disabled && (
                    <div className="flex justify-end">
                        <Button disabled={diagnosaList.length === 0}>Simpan Diagnosa</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { ICDService, FREQUENT_PROCEDURES, type ICD } from "../../../services/icd-service"
import { Plus, Trash2, ChevronDown, Lock, Scissors, Zap } from "lucide-react"
import { useRekamMedisStore } from "../../../store/rekam-medis-store"
import { cn } from "../../../lib/utils"

const SEARCH_DEBOUNCE_MS = 300

interface TindakanFormProps {
    disabled?: boolean
}

export function TindakanForm({ disabled = false }: TindakanFormProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<ICD[]>([])
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const { tindakanList, addTindakan: storeAdd, removeTindakan: storeRemove } = useRekamMedisStore()

    const fetchResults = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const data = await ICDService.searchICD9(query.trim())
            setResults(data)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!open) return
        debounceRef.current = setTimeout(() => fetchResults(search), SEARCH_DEBOUNCE_MS)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [search, open, fetchResults])

    useEffect(() => {
        if (open) {
            setSearch("")
            setResults([])
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [open])

    const handleAdd = (icd: ICD) => {
        storeAdd(icd)
        setSearch("")
        setResults([])
        setOpen(false)
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
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <h3 className="text-sm font-medium">Tindakan Sering Dipakai</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {FREQUENT_PROCEDURES.map((proc) => {
                                    const isSelected = tindakanList.some((t) => t.code === proc.code)
                                    return (
                                        <button
                                            key={proc.code}
                                            type="button"
                                            onClick={() => !isSelected && handleAdd(proc)}
                                            disabled={isSelected}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                                                isSelected
                                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-primary hover:text-white hover:border-primary cursor-pointer"
                                            )}
                                        >
                                            <span className="font-bold">{proc.code}</span>
                                            <span className="hidden sm:inline">— {proc.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-slate-500" />
                                Cari Tindakan / Prosedur (ICD-9)
                            </h3>
                            <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className={cn(
                                        "h-10 w-full justify-between font-normal",
                                        "text-muted-foreground"
                                    )}
                                >
                                    <span className="truncate">
                                        Ketik kode atau nama prosedur...
                                    </span>
                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] p-0"
                                align="start"
                            >
                                <div className="p-2 border-b">
                                    <Input
                                        ref={inputRef}
                                        placeholder="Cari kode atau nama prosedur..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Escape") setOpen(false)
                                        }}
                                        className="h-9"
                                    />
                                </div>
                                <div className="max-h-60 overflow-auto">
                                    {loading ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            Memuat...
                                        </div>
                                    ) : !search.trim() ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            Ketik kode atau nama prosedur untuk mencari.
                                        </div>
                                    ) : results.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            Tidak ada hasil.
                                        </div>
                                    ) : (
                                        <div className="p-1">
                                            {results.map((item) => {
                                                const isSelected = tindakanList.some((t) => t.code === item.code)
                                                return (
                                                    <button
                                                        key={item.code}
                                                        type="button"
                                                        disabled={isSelected}
                                                        className={cn(
                                                            "flex w-full items-center gap-2 rounded-sm py-2 px-2 text-left text-sm outline-none transition-colors",
                                                            "hover:bg-accent hover:text-accent-foreground",
                                                            "disabled:opacity-50 disabled:pointer-events-none",
                                                            isSelected && "bg-muted"
                                                        )}
                                                        onClick={() => !isSelected && handleAdd(item)}
                                                    >
                                                        <span className="font-medium w-14 shrink-0">{item.code}</span>
                                                        <span className="flex-1 truncate">{item.name}</span>
                                                        {isSelected ? (
                                                            <span className="text-xs text-muted-foreground">Dipilih</span>
                                                        ) : (
                                                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    </>
                )}

                <div>
                    <h3 className="text-sm font-medium mb-2">Tindakan Terpilih</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead>Tindakan / Prosedur</TableHead>
                                    {!disabled && <TableHead className="w-[80px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tindakanList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={disabled ? 2 : 3} className="text-center text-muted-foreground h-24">
                                            Belum ada tindakan dipilih
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tindakanList.map((item) => (
                                        <TableRow key={item.code}>
                                            <TableCell className="font-medium">{item.code}</TableCell>
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
            </CardContent>
        </Card>
    )
}

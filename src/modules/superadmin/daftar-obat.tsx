import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { PageHeader } from "../../components/layout/page-header"
import { Card, CardContent } from "../../components/ui/card"
import { DataTable } from "../../components/ui/data-table"
import { AlertBanner } from "../../components/ui/alert-banner"
import { Button } from "../../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Package, AlertTriangle } from "lucide-react"
import { ObatSyncService, type MasterObatItem } from "../../services/obat-sync-service"
import { cn } from "../../lib/utils"
import { formatIdInteger, formatIdr } from "../../lib/locale-format"

function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—"
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(iso)
    )
}

const SEARCH_DEBOUNCE_MS = 350

const columns: ColumnDef<MasterObatItem>[] = [
    { accessorKey: "kode", header: "Kode" },
    { accessorKey: "nama", header: "Nama Obat" },
    { accessorKey: "nama_kelompok", header: "Kelompok", cell: ({ row }) => row.getValue("nama_kelompok") ?? "—" },
    { accessorKey: "kode_satuan", header: "Satuan", cell: ({ row }) => row.getValue("kode_satuan") ?? "—" },
    {
        accessorKey: "harga_jual",
        header: "Harga Jual",
        cell: ({ row }) => {
            const v = row.getValue("harga_jual") as number | null
            return v != null ? formatIdr(v) : "—"
        },
    },
    {
        accessorKey: "stok",
        header: "Stok",
        cell: ({ row }) => {
            const v = row.getValue("stok") as number | null
            return v != null ? formatIdInteger(v) : "—"
        },
    },
    {
        accessorKey: "synced_at",
        header: "Terakhir Sync",
        cell: ({ row }) => formatDate(row.getValue("synced_at") as string | null),
    },
]

export default function SuperadminDaftarObatPage() {
    const [page, setPage] = useState(1)
    const [searchInput, setSearchInput] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [stokTipisOnly, setStokTipisOnly] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([{ id: "nama", desc: false }])
    const [detailObat, setDetailObat] = useState<MasterObatItem | null>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchInput.trim())
            setPage(1)
            debounceRef.current = null
        }, SEARCH_DEBOUNCE_MS)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [searchInput])

    const perPage = 20
    const sortBy = sorting[0]?.id ?? "nama"
    const sortOrder = sorting[0]?.desc ? "desc" : "asc"
    const { data, isLoading } = useQuery({
        queryKey: ["superadmin", "master-obat", page, debouncedSearch, sortBy, sortOrder, stokTipisOnly],
        queryFn: () =>
            ObatSyncService.getMasterObat({
                search: debouncedSearch || undefined,
                page,
                per_page: perPage,
                sort_by: sortBy,
                sort_order: sortOrder,
                stok_tipis: stokTipisOnly || undefined,
            }),
    })

    const items = data?.items ?? []
    const total = data?.total ?? 0
    const summary = data?.summary
    const totalPages = Math.max(1, Math.ceil(total / perPage))

    const applySearchNow = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = null
        setDebouncedSearch(searchInput.trim())
        setPage(1)
    }

    const handleSortingChange = (updater: React.SetStateAction<SortingState>) => {
        setSorting(updater)
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Daftar Obat"
                description="Data master obat dari hasil sinkronisasi (mirror). Digunakan untuk autocomplete di form Resep."
            />

            {summary != null && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <Card
                        role="button"
                        tabIndex={0}
                        aria-pressed={!stokTipisOnly}
                        className={cn(
                            "cursor-pointer border-border shadow-sm outline-none transition",
                            "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            !stokTipisOnly && "ring-2 ring-ring/40"
                        )}
                        onClick={() => {
                            setStokTipisOnly(false)
                            setPage(1)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setStokTipisOnly(false)
                                setPage(1)
                            }
                        }}
                    >
                        <CardContent className="flex flex-row items-center gap-3 pt-4 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Package className="h-5 w-5 text-muted-foreground" aria-hidden />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total obat di master</p>
                                <p className="text-xl font-semibold tabular-nums text-foreground">
                                    {formatIdInteger(summary.total_obat)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">Klik untuk tampilkan semua obat</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        role="button"
                        tabIndex={0}
                        aria-pressed={stokTipisOnly}
                        className={cn(
                            "cursor-pointer border-border bg-card shadow-sm outline-none transition",
                            "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            stokTipisOnly && "ring-2 ring-ring/40"
                        )}
                        onClick={() => {
                            setStokTipisOnly(true)
                            setPage(1)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                setStokTipisOnly(true)
                                setPage(1)
                            }
                        }}
                    >
                        <CardContent className="flex flex-row items-center gap-3 pt-4 pb-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stok tipis (&lt; 30)</p>
                                <p className="text-xl font-semibold tabular-nums text-foreground">
                                    {formatIdInteger(summary.stok_dibawah_30)} obat
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Klik untuk melihat daftar obat yang perlu restock
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    {stokTipisOnly && (
                        <AlertBanner variant="warning" className="mb-4 items-start">
                            Menampilkan hanya obat dengan stok di bawah 30. Klik kartu &quot;Total obat&quot; di atas untuk
                            kembali ke daftar lengkap.
                        </AlertBanner>
                    )}
                    <div className="mb-4">
                        <input
                            type="search"
                            placeholder="Cari kode atau nama..."
                            className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applySearchNow()}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={items}
                        searchKey={undefined}
                        isLoading={isLoading}
                        enablePagination={false}
                        manualSorting
                        sorting={sorting}
                        onSortingChange={handleSortingChange}
                        onRowClick={setDetailObat}
                    />
                    {!isLoading && total === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            {debouncedSearch
                                ? `Tidak ada obat yang cocok dengan "${debouncedSearch}".`
                                : stokTipisOnly
                                  ? "Tidak ada obat dengan stok di bawah 30 (atau stok belum tersedia dari sync)."
                                  : "Belum ada data obat. Jalankan Sync Obat terlebih dahulu."}
                        </p>
                    )}
                    {total > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                            <span className="text-sm text-muted-foreground">
                                Total {formatIdInteger(total)} obat
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Sebelumnya
                                </Button>
                                <span className="flex items-center px-2 text-sm">
                                    Halaman {formatIdInteger(page)} dari {formatIdInteger(totalPages)}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!detailObat} onOpenChange={(open) => !open && setDetailObat(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Obat</DialogTitle>
                    </DialogHeader>
                    {detailObat && (
                        <dl className="grid gap-3 text-sm">
                            <div>
                                <dt className="font-medium text-muted-foreground">Kode</dt>
                                <dd className="mt-0.5">{detailObat.kode}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Nama Obat</dt>
                                <dd className="mt-0.5">{detailObat.nama}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Kelompok</dt>
                                <dd className="mt-0.5">{detailObat.nama_kelompok ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Satuan</dt>
                                <dd className="mt-0.5">{detailObat.kode_satuan ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Harga Jual</dt>
                                <dd className="mt-0.5">
                                    {detailObat.harga_jual != null ? formatIdr(detailObat.harga_jual) : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Stok</dt>
                                <dd className="mt-0.5">
                                    {detailObat.stok != null ? formatIdInteger(detailObat.stok) : "—"}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Terakhir Sync</dt>
                                <dd className="mt-0.5">{formatDate(detailObat.synced_at)}</dd>
                            </div>
                        </dl>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

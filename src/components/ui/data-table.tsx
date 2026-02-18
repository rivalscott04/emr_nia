import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./table"
import { Button } from "./button"
import { Input } from "./input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu"
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { DataTableSkeleton } from "../layout/page-loading"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    isLoading?: boolean
    /** Tampilkan pagination bawaan (Previous/Next). Set false jika pakai pagination server (e.g. Sebelumnya/Selanjutnya). */
    enablePagination?: boolean
    /** Sorting di header (click = A-Z / rendah→tinggi). Default true. */
    enableSorting?: boolean
    /** Server-side sort: data sudah di-sort dari API, hanya tampilkan indikator. */
    manualSorting?: boolean
    /** State sort (controlled). Untuk server-side, set dari parent. */
    sorting?: SortingState
    /** Callback saat sort berubah (untuk server-side). */
    onSortingChange?: (updater: React.SetStateAction<SortingState>) => void
    /** Callback saat baris di-klik. Jika diset, baris tampil clickable (hover + cursor). */
    onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    isLoading = false,
    enablePagination = true,
    enableSorting = true,
    manualSorting = false,
    sorting: controlledSorting,
    onSortingChange,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
    const sorting = controlledSorting ?? internalSorting
    const setSorting = onSortingChange ?? setInternalSorting
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    if (isLoading) {
        return <DataTableSkeleton hasSearch={Boolean(searchKey)} />
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 py-4 sm:gap-4">
                {searchKey && (
                    <Input
                        placeholder={`Cari ${searchKey}...`}
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="w-full min-w-0 max-w-sm sm:w-48"
                    />
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto sm:ml-0">
                            Kolom
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0" aria-hidden />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const column = header.column
                                    const canSort = enableSorting && column.getCanSort()
                                    const isSorted = column.getIsSorted()
                                    const toggleHandler = column.getToggleSortingHandler()
                                    return (
                                        <TableHead key={header.id} className={canSort ? "px-3" : undefined}>
                                            {header.isPlaceholder ? null : canSort ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="h-8 w-full min-w-0 justify-center gap-1.5 font-medium hover:bg-muted/70"
                                                    onClick={toggleHandler}
                                                    aria-label={
                                                        isSorted === "asc"
                                                            ? "Urutkan naik (klik untuk turun)"
                                                            : isSorted === "desc"
                                                              ? "Urutkan turun (klik untuk hapus sort)"
                                                              : "Urutkan"
                                                    }
                                                >
                                                    {flexRender(
                                                        column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {isSorted === "asc" ? (
                                                        <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                                                    ) : isSorted === "desc" ? (
                                                        <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                                                    ) : (
                                                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                                    )}
                                                </Button>
                                            ) : (
                                                flexRender(
                                                    column.columnDef.header,
                                                    header.getContext()
                                                )
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    className={onRowClick ? "cursor-pointer hover:bg-muted/70" : undefined}
                                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {enablePagination && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

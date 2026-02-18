import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    emptyMessage?: string
    /** Optional class for the trigger button */
    className?: string
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Pilih...",
    disabled = false,
    emptyMessage = "Tidak ada hasil.",
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    const selectedOption = options.find((o) => o.value === value)
    const filtered = React.useMemo(() => {
        if (!search.trim()) return options
        const q = search.trim().toLowerCase()
        return options.filter((o) => o.label.toLowerCase().includes(q))
    }, [options, search])

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue)
        setSearch("")
        setOpen(false)
    }

    React.useEffect(() => {
        if (open) {
            setSearch("")
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [open])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "h-10 w-full justify-between font-normal",
                        !selectedOption && "text-muted-foreground",
                        className
                    )}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2 border-b">
                    <Input
                        ref={inputRef}
                        placeholder="Cari..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setOpen(false)
                            const single = filtered[0]
                            if (e.key === "Enter" && filtered.length === 1 && single) {
                                e.preventDefault()
                                handleSelect(single.value)
                            }
                        }}
                        className="h-9"
                    />
                </div>
                <div className="max-h-60 overflow-auto">
                    {filtered.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {emptyMessage}
                        </div>
                    ) : (
                        <div className="p-1">
                            {filtered.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={value === opt.value}
                                    className={cn(
                                        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                        value === opt.value && "bg-accent"
                                    )}
                                    onClick={() => handleSelect(opt.value)}
                                >
                                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        {value === opt.value ? (
                                            <Check className="h-4 w-4" />
                                        ) : null}
                                    </span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

import { cn } from "../../lib/utils"

interface PageHeaderProps {
    title: string
    description?: string
    /** Tombol/link aksi utama. Teks tetap tampil; di mobile/tablet layout beradaptasi. */
    action?: React.ReactNode
    className?: string
}

/**
 * Header halaman yang responsif: judul + deskripsi + aksi.
 * Di mobile/tablet: blok judul dan tombol bisa wrap; teks aksi tetap informatif.
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground sm:mt-0">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </div>
    )
}

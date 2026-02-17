import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { TooltipTrigger } from "../ui/tooltip"
import { LayoutDashboard, Users, Calendar, FileText, Activity, Pill, Settings, LogOut } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Di tablet (md) sidebar collapsed: icon-only. Di desktop (lg+) full dengan label. */
    collapsed?: boolean
    /** Dipanggil setelah navigasi (untuk menutup drawer di mobile). */
    onNavigate?: () => void
}

export function Sidebar({ className, collapsed = false, onNavigate }: SidebarProps) {
    const location = useLocation()
    const pathname = location.pathname

    const routes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" },
        { label: "Pasien", icon: Users, href: "/pasien", active: pathname.startsWith("/pasien") },
        { label: "Kunjungan", icon: Calendar, href: "/kunjungan", active: pathname.startsWith("/kunjungan") },
        { label: "Rekam Medis", icon: FileText, href: "/rekam-medis", active: pathname.startsWith("/rekam-medis") },
        { label: "Tindakan", icon: Activity, href: "/tindakan", active: pathname.startsWith("/tindakan") },
        { label: "Resep", icon: Pill, href: "/resep", active: pathname.startsWith("/resep") },
        { label: "Pengaturan", icon: Settings, href: "/settings", active: pathname.startsWith("/settings") },
    ]

    return (
        <div
            className={cn(
                "relative flex flex-col pb-12 h-screen border-r border-slate-800 bg-slate-900 text-slate-50 transition-[width] duration-200 ease-out",
                collapsed ? "w-[4rem] min-w-[4rem]" : "w-64 min-w-64",
                className
            )}
            role="navigation"
            aria-label="Menu utama"
        >
            <div className="space-y-4 py-4 flex-1 overflow-visible min-h-0 flex flex-col">
                <div className={cn("py-2 overflow-visible", collapsed ? "px-2" : "px-3")}>
                    <h2
                        className={cn(
                            "flex items-center gap-2 font-bold tracking-tight text-white overflow-hidden",
                            collapsed ? "mb-4 justify-center px-0" : "mb-6 px-4 text-lg"
                        )}
                    >
                        {collapsed ? (
                            <TooltipTrigger label="E-Rekam Medis" side="right">
                                <Activity className="h-6 w-6 shrink-0 text-blue-400" aria-hidden />
                            </TooltipTrigger>
                        ) : (
                            <>
                                <Activity className="h-6 w-6 shrink-0 text-blue-400" aria-hidden />
                                <span className="truncate">E-Rekam Medis</span>
                            </>
                        )}
                    </h2>
                    <nav className="space-y-1 overflow-visible" aria-label="Navigasi">
                        {routes.map((route) => {
                            const iconEl = (
                                <route.icon
                                    className={cn(
                                        "h-4 w-4 shrink-0",
                                        route.active ? "text-white" : "text-slate-400 group-hover:text-white",
                                        !collapsed && "mr-2"
                                    )}
                                    aria-hidden
                                />
                            )
                            return (
                                <div key={route.href} className={cn("flex", collapsed && "justify-center")}>
                                    {collapsed ? (
                                        <TooltipTrigger label={route.label} side="right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-10 w-10 shrink-0 hover:bg-slate-800 hover:text-white",
                                                    route.active && "bg-blue-600 text-white hover:bg-blue-700 font-medium"
                                                )}
                                                asChild
                                            >
                                                <Link
                                                    to={route.href}
                                                    className="flex items-center justify-center"
                                                    onClick={onNavigate}
                                                    aria-label={route.label}
                                                >
                                                    {iconEl}
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start hover:bg-slate-800 hover:text-white",
                                                route.active && "bg-blue-600 text-white hover:bg-blue-700 font-medium"
                                            )}
                                            asChild
                                        >
                                            <Link to={route.href} className="flex items-center" onClick={onNavigate}>
                                                {iconEl}
                                                <span className="truncate">{route.label}</span>
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>
            </div>
            <div className={cn("absolute bottom-4 left-0 w-full overflow-visible", collapsed ? "px-2" : "px-3")}>
                {collapsed ? (
                    <TooltipTrigger label="Logout" side="right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={onNavigate}
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                        </Button>
                    </TooltipTrigger>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={onNavigate}
                    >
                        <LogOut className="h-4 w-4 shrink-0 mr-2" aria-hidden />
                        <span>Logout</span>
                    </Button>
                )}
            </div>
        </div>
    )
}

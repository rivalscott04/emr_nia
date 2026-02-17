import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { TooltipTrigger } from "../ui/tooltip"
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Activity,
    Pill,
    LogOut,
    FolderKanban,
    Building2,
    ScrollText,
    RefreshCw,
    Hospital,
} from "lucide-react"
import { useAuth } from "../../modules/auth/auth-context"
import type { PermissionName } from "../../types/auth"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsed?: boolean
    onNavigate?: () => void
}

export function Sidebar({ className, collapsed = false, onNavigate }: SidebarProps) {
    const location = useLocation()
    const pathname = location.pathname
    const { hasPermission, logout } = useAuth()

    const clinicalRoutes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard", permission: "dashboard.view" },
        { label: "Pasien", icon: Users, href: "/pasien", active: pathname.startsWith("/pasien"), permission: "pasien.read" },
        { label: "Kunjungan", icon: Calendar, href: "/kunjungan", active: pathname.startsWith("/kunjungan"), permission: "kunjungan.read" },
        { label: "Rekam Medis", icon: FileText, href: "/rekam-medis", active: pathname.startsWith("/rekam-medis"), permission: "rekam_medis.read" },
        { label: "Tindakan", icon: Activity, href: "/tindakan", active: pathname.startsWith("/tindakan"), permission: "rekam_medis.read" },
        { label: "Resep", icon: Pill, href: "/resep", active: pathname.startsWith("/resep"), permission: "rekam_medis.read" },
    ] as Array<{ label: string; icon: React.ElementType; href: string; active: boolean; permission: PermissionName }>

    const visibleClinicalRoutes = clinicalRoutes.filter((route) => hasPermission(route.permission))

    const adminRoutes: Array<{
        label: string
        icon: React.ElementType
        href: string
        active: boolean
        permission?: PermissionName
    }> = [
        {
            label: "Akses User",
            icon: FolderKanban,
            href: "/superadmin/access",
            active: pathname.startsWith("/superadmin/access"),
            permission: "user_access.manage",
        },
        {
            label: "Role & Poli",
            icon: Building2,
            href: "/superadmin/roles-poli",
            active: pathname.startsWith("/superadmin/roles-poli"),
            permission: "role_poli.manage",
        },
        {
            label: "Master ICD",
            icon: FileText,
            href: "/superadmin/master-icd",
            active: pathname.startsWith("/superadmin/master-icd"),
            permission: "master_icd.manage",
        },
        {
            label: "Sync Obat",
            icon: RefreshCw,
            href: "/superadmin/sync-obat",
            active: pathname.startsWith("/superadmin/sync-obat"),
            permission: "obat_sync.manage",
        },
        {
            label: "Info Klinik",
            icon: Hospital,
            href: "/superadmin/info-klinik",
            active: pathname.startsWith("/superadmin/info-klinik"),
            permission: "settings.manage",
        },
        {
            label: "Audit Log",
            icon: ScrollText,
            href: "/superadmin/audit",
            active: pathname.startsWith("/superadmin/audit"),
            permission: "audit_log.read",
        },
    ]
    const visibleAdminRoutes = adminRoutes.filter((route) => !route.permission || hasPermission(route.permission))

    const handleLogout = async () => {
        await logout()
        onNavigate?.()
    }

    const renderNavItem = (route: { label: string; icon: React.ElementType; href: string; active: boolean }) => {
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
    }

    return (
        <div
            className={cn(
                "flex flex-col h-screen border-r border-slate-800 bg-slate-900 text-slate-50 transition-[width] duration-200 ease-out",
                collapsed ? "w-[4rem] min-w-[4rem]" : "w-64 min-w-64",
                className
            )}
            role="navigation"
            aria-label="Menu utama"
        >
            <div className={cn("py-4", collapsed ? "px-2" : "px-3")}>
                <h2
                    className={cn(
                        "flex items-center gap-2 font-bold tracking-tight text-white overflow-hidden",
                        collapsed ? "justify-center px-0" : "px-4 text-lg"
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
            </div>

            <nav
                className={cn("flex-1 overflow-y-auto space-y-1 pb-4", collapsed ? "px-2" : "px-3")}
                aria-label="Navigasi"
            >
                {visibleClinicalRoutes.map(renderNavItem)}

                {visibleAdminRoutes.length > 0 && (
                    <div className={cn("pt-3 mt-3 border-t border-slate-800", collapsed ? "px-0" : "px-1")}>
                        {!collapsed && (
                            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Administrasi
                            </div>
                        )}
                        {visibleAdminRoutes.map(renderNavItem)}
                    </div>
                )}
            </nav>

            <div className={cn("border-t border-slate-800 py-3", collapsed ? "px-2" : "px-3")}>
                {collapsed ? (
                    <TooltipTrigger label="Logout" side="right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 w-full justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                        </Button>
                    </TooltipTrigger>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4 shrink-0 mr-2" aria-hidden />
                        <span>Logout</span>
                    </Button>
                )}
            </div>
        </div>
    )
}

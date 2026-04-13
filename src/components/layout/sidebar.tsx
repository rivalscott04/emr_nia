import { useState, useEffect, Fragment } from "react"
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
    Package,
    FolderKanban,
    Building2,
    ScrollText,
    RefreshCw,
    Hospital,
    ChevronRight,
    Download,
    Receipt,
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
    const { hasPermission, isSuperadmin, isAdmin, isDokter } = useAuth()

    const clinicalRoutes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard", permission: "dashboard.view", dokterOnly: false },
        { label: "Pasien", icon: Users, href: "/pasien", active: pathname.startsWith("/pasien"), permission: "pasien.read", dokterOnly: false },
        { label: "Kunjungan", icon: Calendar, href: "/kunjungan", active: pathname.startsWith("/kunjungan"), permission: "kunjungan.read", dokterOnly: false },
        { label: "Rekap Tindakan", icon: Receipt, href: "/rekap-tindakan", active: pathname.startsWith("/rekap-tindakan"), permissionAny: ["rekap_tindakan.read", "rekam_medis.read"], dokterOnly: false },
        { label: "Rekam Medis", icon: FileText, href: "/rekam-medis", active: pathname.startsWith("/rekam-medis"), permission: "rekam_medis.read", dokterOnly: false },
        { label: "Tindakan", icon: Activity, href: "/tindakan", active: pathname.startsWith("/tindakan"), permission: "rekam_medis.read", dokterOnly: false },
        { label: "Export Pasien", icon: Download, href: "/export-pasien", active: pathname.startsWith("/export-pasien"), permission: "pasien.read", dokterOnly: true },
    ] as Array<{ label: string; icon: React.ElementType; href: string; active: boolean; permission?: PermissionName; permissionAny?: PermissionName[]; dokterOnly?: boolean }>

    const visibleClinicalRoutes = clinicalRoutes.filter((route) => {
        if ("permissionAny" in route && route.permissionAny) {
            if (!route.permissionAny.some((p) => hasPermission(p))) return false
        } else if (route.permission && !hasPermission(route.permission)) {
            return false
        }
        if (route.dokterOnly && !isDokter) return false
        return true
    })

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
                label: "Info Klinik",
                icon: Hospital,
                href: "/superadmin/info-klinik",
                active: pathname.startsWith("/superadmin/info-klinik"),
                permission: "settings.manage",
            },
            {
                label: "Catatan Aktivitas",
                icon: ScrollText,
                href: "/superadmin/audit",
                active: pathname.startsWith("/superadmin/audit"),
                permission: "audit_log.read",
            },
        ]
    const visibleAdminRoutes = adminRoutes.filter((route) => !route.permission || hasPermission(route.permission))
    const canSeeAdminSection = (isSuperadmin || isAdmin) && (visibleAdminRoutes.length > 0 || hasPermission("obat_sync.manage"))

    const obatSubRoutes = [
        { label: "Daftar Obat", icon: Package, href: "/superadmin/daftar-obat", active: pathname.startsWith("/superadmin/daftar-obat") },
        { label: "Sync Obat", icon: RefreshCw, href: "/superadmin/sync-obat", active: pathname.startsWith("/superadmin/sync-obat") },
    ] as const
    const canShowObatAccordion = hasPermission("obat_sync.manage")
    const isObatPath = pathname.startsWith("/superadmin/daftar-obat") || pathname.startsWith("/superadmin/sync-obat")
    const [obatAccordionOpen, setObatAccordionOpen] = useState(isObatPath)
    useEffect(() => {
        if (isObatPath) setObatAccordionOpen(true)
    }, [isObatPath])

    const pharmacyRoutes = [
        { label: "Antrian Resep", icon: ScrollText, href: "/farmasi/resep", active: pathname.startsWith("/farmasi/resep"), permission: "resep.process" },
        { label: "Riwayat Penyerahan", icon: Calendar, href: "/farmasi/riwayat", active: pathname.startsWith("/farmasi/riwayat"), permission: "resep.process" },
    ] as Array<{ label: string; icon: React.ElementType; href: string; active: boolean; permission: PermissionName }>

    const visiblePharmacyRoutes = pharmacyRoutes.filter((route) => hasPermission(route.permission))
    const canSeePharmacySection = visiblePharmacyRoutes.length > 0

    const renderObatAccordion = () => {
        if (collapsed) {
            return (
                <div key="obat" className="flex justify-center">
                    <TooltipTrigger label="Obat" side="right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 shrink-0 hover:bg-slate-800 hover:text-white",
                                isObatPath && "bg-blue-600 text-white hover:bg-blue-700 font-medium"
                            )}
                            asChild
                        >
                            <Link
                                to="/superadmin/daftar-obat"
                                className="flex items-center justify-center"
                                onClick={onNavigate}
                                aria-label="Obat"
                            >
                                <Package className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white" aria-hidden />
                            </Link>
                        </Button>
                    </TooltipTrigger>
                </div>
            )
        }
        return (
            <div key="obat-accordion" className="space-y-0.5">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start hover:bg-slate-800 hover:text-white",
                        isObatPath && "bg-slate-800/50 text-white"
                    )}
                    onClick={() => setObatAccordionOpen((v) => !v)}
                    aria-expanded={obatAccordionOpen}
                >
                    <Package className="h-4 w-4 shrink-0 mr-2 text-slate-400" aria-hidden />
                    <span className="truncate flex-1 text-left">Obat</span>
                    <ChevronRight
                        className={cn("h-4 w-4 shrink-0 ml-auto text-slate-400 transition-transform", obatAccordionOpen && "rotate-90")}
                        aria-hidden
                    />
                </Button>
                {obatAccordionOpen && (
                    <div className="ml-6 space-y-0.5 border-l border-slate-700 pl-2">
                        {obatSubRoutes.map((sub) => {
                            const Icon = sub.icon
                            return (
                                <div key={sub.href} className="flex">
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start hover:bg-slate-800 hover:text-white h-9 text-sm",
                                            sub.active && "bg-blue-600 text-white hover:bg-blue-700 font-medium"
                                        )}
                                        asChild
                                    >
                                        <Link to={sub.href} className="flex items-center" onClick={onNavigate}>
                                            <Icon
                                                className={cn("h-3.5 w-3.5 shrink-0 mr-2", sub.active ? "text-white" : "text-slate-400")}
                                                aria-hidden
                                            />
                                            <span className="truncate">{sub.label}</span>
                                        </Link>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
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

                {canSeePharmacySection && (
                    <div className={cn("pt-3 mt-3 border-t border-slate-800", collapsed ? "px-0" : "px-1")}>
                        {!collapsed && (
                            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Farmasi (Apoteker)
                            </div>
                        )}
                        {visiblePharmacyRoutes.map(renderNavItem)}
                    </div>
                )}

                {canSeeAdminSection && (
                    <div className={cn("pt-3 mt-3 border-t border-slate-800", collapsed ? "px-0" : "px-1")}>
                        {!collapsed && (
                            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Administrasi (Superadmin / Admin)
                            </div>
                        )}
                        {visibleAdminRoutes.length === 0 && canShowObatAccordion
                            ? renderObatAccordion()
                            : visibleAdminRoutes.map((route) =>
                                  route.label === "Info Klinik" && canShowObatAccordion ? (
                                      <Fragment key="obat-and-next">
                                          {renderObatAccordion()}
                                          {renderNavItem(route)}
                                      </Fragment>
                                  ) : (
                                      renderNavItem(route)
                                  )
                              )}
                    </div>
                )}
            </nav>
        </div>
    )
}

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { useSidebarBreakpoints } from "../../hooks/use-media-query"

import { useAuth } from "../../modules/auth/auth-context"
import { AlertCircle, LogOut } from "lucide-react"

export function AppLayout() {
    const { isMobile, isTablet } = useSidebarBreakpoints()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { isImpersonating, stopImpersonating, user } = useAuth()

    /** Tablet = icon-only, desktop = full. Mobile = drawer (bukan di sini). */
    const sidebarCollapsed = isTablet

    return (
        <div className="flex h-screen overflow-hidden bg-background relative flex-col">
            {isImpersonating && (
                <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-between shadow-md z-50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                            Mode Impersonate: Anda sedang login sebagai <strong>{user?.name}</strong> ({user?.roles.join(", ")}).
                        </span>
                    </div>
                    <button
                        onClick={stopImpersonating}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-xs uppercase tracking-wide"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Stop Impersonating
                    </button>
                </div>
            )}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: desktop & tablet (tetap visible), mobile disembunyikan dari flow */}
                {!isMobile && (
                    <aside
                        className="flex flex-col border-r border-slate-800 shrink-0 transition-[width] duration-200"
                        style={{ width: sidebarCollapsed ? "4rem" : "16rem" }}
                    >
                        <Sidebar collapsed={sidebarCollapsed} />
                    </aside>
                )}

                {/* Mobile: drawer overlay + sidebar */}
                {isMobile && mobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                            aria-hidden
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <aside
                            className="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-slate-800 bg-slate-900 shadow-lg md:hidden"
                            aria-modal="true"
                            role="dialog"
                            aria-label="Menu navigasi"
                        >
                            <Sidebar collapsed={false} onNavigate={() => setMobileMenuOpen(false)} />
                        </aside>
                    </>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                    <Header
                        onMenuClick={() => setMobileMenuOpen(true)}
                        showMenuButton={isMobile}
                    />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
                <Toaster position="top-right" richColors />
            </div>
        </div>
    )
}

import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Bell, Menu } from "lucide-react"
import { useAuth } from "../../modules/auth/auth-context"

interface HeaderProps {
    onMenuClick?: () => void
    showMenuButton?: boolean
}

const roleDisplayLabels: Record<string, string> = {
    superadmin: "Superadmin",
    admin_poli: "Admin (Administrasi)",
    dokter: "Dokter",
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
    const { user, logout, isSuperadmin, isAdmin } = useAuth()
    const initial = user?.name?.charAt(0).toUpperCase() ?? "U"
    const showSettings = isSuperadmin || isAdmin

    return (
        <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b border-white/20 bg-slate-900 px-4 md:px-6 text-slate-50">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {showMenuButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 md:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={onMenuClick}
                        aria-label="Buka menu navigasi"
                    >
                        <Menu className="h-5 w-5" aria-hidden />
                    </Button>
                )}
                {/* Left side content (breadcrumbs, search, etc.) */}
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full p-0 hover:bg-slate-800 [&>div]:shrink-0"
                        >
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-white bg-white shadow-md"
                                style={{ backgroundColor: 'white', color: '#0f172a' }}
                            >
                                <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>{initial}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 border-slate-200 bg-white text-slate-900 shadow-lg"
                        align="end"
                        forceMount
                    >
                        <DropdownMenuLabel className="font-normal text-slate-900">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                                <p className="text-xs leading-none text-slate-500">
                                    {user?.email ?? "-"}
                                </p>
                                {user?.roles?.length ? (
                                    <p className="text-xs leading-none text-slate-500">
                                        {user.roles.map((r) => roleDisplayLabels[r] ?? r.replace("_", " ")).join(", ")}
                                    </p>
                                ) : null}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-200" />
                        <DropdownMenuItem
                            asChild
                            className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
                        >
                            <Link to="/dashboard">Profile</Link>
                        </DropdownMenuItem>
                        {showSettings && (
                            <DropdownMenuItem
                                asChild
                                className="text-slate-900 focus:bg-slate-100 focus:text-slate-900"
                            >
                                <Link to="/settings">Settings</Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-slate-200" />
                        <DropdownMenuItem
                            className="text-destructive focus:bg-red-50 focus:text-destructive"
                            onClick={() => void logout()}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

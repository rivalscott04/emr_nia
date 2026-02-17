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

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
    const { user, logout } = useAuth()
    const initial = user?.name?.charAt(0).toUpperCase() ?? "U"

    return (
        <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
                {showMenuButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 md:hidden"
                        onClick={onMenuClick}
                        aria-label="Buka menu navigasi"
                    >
                        <Menu className="h-5 w-5" aria-hidden />
                    </Button>
                )}
                {/* Left side content (breadcrumbs, search, etc.) */}
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                <span className="font-medium text-xs">{initial}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email ?? "-"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => void logout()}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

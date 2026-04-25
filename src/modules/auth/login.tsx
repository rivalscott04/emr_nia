import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { AlertBanner } from "../../components/ui/alert-banner"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ApiError } from "../../lib/api-client"
import { useAuth } from "./auth-context"
import { toast } from "sonner"
import brandLogo from "../../favicon.svg"

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [loginValue, setLoginValue] = useState("")
    const [password, setPassword] = useState("")
    const [formError, setFormError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isAuthenticated } = useAuth()

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true })
        }
    }, [isAuthenticated, navigate])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setFormError(null)

        try {
            await login(loginValue, password)
            const state = location.state as { from?: { pathname?: string } } | null
            navigate(state?.from?.pathname ?? "/dashboard", { replace: true })
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 401) {
                    setFormError("Login gagal. Periksa kembali username/email dan password Anda.")
                } else if (error.status === 422) {
                    setFormError("Beberapa isian belum lengkap atau tidak valid. Periksa kembali data login Anda.")
                } else {
                    setFormError("Sistem tidak dapat memproses login saat ini. Coba beberapa saat lagi atau hubungi admin.")
                }

                // Tetap kirim ke toast untuk admin/teknis (jika sonner aktif)
                toast.error(error.message)
            } else {
                setFormError("Sistem tidak dapat memproses login saat ini. Coba beberapa saat lagi atau hubungi admin.")
                toast.error("Terjadi kesalahan tak terduga saat login.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 flex">
            {/* Left column: brand image + system info */}
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-slate-900 text-slate-50 p-10">
                <div className="max-w-md space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center shadow-sm">
                            <img
                                src={brandLogo}
                                alt="Logo SENIA"
                                className="h-7 w-7"
                            />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-400">
                                SENIA
                            </p>
                            <p className="text-sm text-slate-200">
                                Sistem EMR Nia untuk klinik & apotek
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                            Rekam medis klinik yang rapi, cepat, dan aman.
                        </h1>
                        <p className="text-sm text-slate-300">
                            Workflow terstruktur dari antrian hingga resep, membantu tim klinik menyelesaikan dokumentasi
                            kunjungan dalam waktu kurang dari tiga menit.
                        </p>
                    </div>

                    {/* Representative EMR preview image (pure UI illustration) */}
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-100">
                                    Ringkasan Kunjungan Pasien
                                </p>
                                <p className="text-[11px] text-slate-400">
                                    Identitas, alergi, SOAP, dan resep dalam satu layar.
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/40">
                                Active EMR
                            </span>
                        </div>
                        <div className="space-y-2 text-[11px] text-slate-300">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-lg bg-slate-900/60 border border-slate-700/70 p-2">
                                    <p className="text-[10px] text-slate-400">Identitas Pasien</p>
                                    <p className="mt-1 h-2 w-16 rounded bg-slate-600/80" />
                                    <p className="mt-1 h-2 w-10 rounded bg-slate-700/80" />
                                </div>
                                <div className="rounded-lg bg-slate-900/60 border border-slate-700/70 p-2">
                                    <p className="text-[10px] text-slate-400">Alergi</p>
                                    <p className="mt-1 h-2 w-20 rounded bg-rose-500/60" />
                                </div>
                                <div className="rounded-lg bg-slate-900/60 border border-slate-700/70 p-2">
                                    <p className="text-[10px] text-slate-400">TTV</p>
                                    <div className="mt-1 flex gap-1">
                                        <span className="h-2 flex-1 rounded bg-sky-500/70" />
                                        <span className="h-2 flex-1 rounded bg-sky-600/70" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-lg bg-slate-900/60 border border-slate-700/70 p-2">
                                    <p className="text-[10px] text-slate-400">SOAP</p>
                                    <p className="mt-1 h-2 w-full rounded bg-slate-700/70" />
                                    <p className="mt-1 h-2 w-3/4 rounded bg-slate-700/60" />
                                </div>
                                <div className="rounded-lg bg-slate-900/60 border border-slate-700/70 p-2">
                                    <p className="text-[10px] text-slate-400">Resep</p>
                                    <p className="mt-1 h-2 w-full rounded bg-slate-700/70" />
                                    <p className="mt-1 h-2 w-2/3 rounded bg-slate-700/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right column: login form */}
            <div className="flex flex-1 items-center justify-center px-4 py-10 lg:px-10">
                <Card className="w-full max-w-md shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Masuk ke SENIA</CardTitle>
                        <CardDescription>
                            SENIA (Sistem EMR Nia) hanya untuk staf klinik dan apotek yang berwenang.
                            Isi email atau nama pengguna beserta kata sandi seperti yang diberikan admin.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="grid gap-4">
                            {formError && (
                                <AlertBanner variant="danger">
                                    {formError}
                                </AlertBanner>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email atau nama pengguna</Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="login"
                                    autoComplete="username"
                                    placeholder="Contoh: nama@klinik.id atau nama.staf"
                                    value={loginValue}
                                    onChange={(event) => setLoginValue(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Kata sandi</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Kata sandi akun Anda (biasanya dari admin)"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? "Sedang masuk..." : "Masuk"}
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Lupa akses? Hubungi admin klinik Anda untuk reset akun.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

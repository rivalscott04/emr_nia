    /**
 * Label ramah orang awam untuk Audit Log.
 * Dipakai agar pengguna non-teknis paham "siapa melakukan apa, di mana, dan hasilnya".
 */

/** Jenis tindakan dalam bahasa sehari-hari */
export const METHOD_LABELS: Record<string, string> = {
    GET: "Melihat data",
    POST: "Menambah data baru",
    PUT: "Mengubah data",
    PATCH: "Mengubah data",
    DELETE: "Menghapus data",
}

export function getMethodLabel(method: string): string {
    return METHOD_LABELS[method] ?? method
}

/** Hasil tindakan dalam bahasa sehari-hari */
export function getStatusLabel(code: number | null | undefined): string {
    if (code == null) return "-"
    if (code >= 200 && code < 300) {
        if (code === 201) return "Berhasil dibuat"
        return "Berhasil"
    }
    if (code >= 400 && code < 500) return "Ditolak / tidak diizinkan"
    if (code >= 500) return "Gagal (error sistem)"
    return String(code)
}

/** Warna badge untuk status (tetap pakai kode untuk filter, tampilan pakai label) */
export function getStatusVariant(
    code: number | null | undefined
): "success" | "warning" | "destructive" | "neutral" {
    if (code == null) return "neutral"
    if (code >= 200 && code < 300) return "success"
    if (code >= 400 && code < 500) return "warning"
    if (code >= 500) return "destructive"
    return "neutral"
}

/**
 * Deskripsi singkat lokasi di sistem dari path API.
 * Path tetap ditampilkan (atau bisa di tooltip) untuk yang butuh detail teknis.
 */
const PATH_HINTS: { pattern: RegExp; label: string }[] = [
    { pattern: /rekam-medis\/kunjungan/i, label: "Rekam medis – kunjungan" },
    { pattern: /rekam-medis/i, label: "Rekam medis" },
    { pattern: /kunjungan/i, label: "Kunjungan pasien" },
    { pattern: /resep/i, label: "Resep obat" },
    { pattern: /pasien/i, label: "Data pasien" },
    { pattern: /obat/i, label: "Data obat" },
    { pattern: /icd/i, label: "Kode diagnosis (ICD)" },
    { pattern: /superadmin\/impersonate/i, label: "Masuk sebagai pengguna lain" },
    { pattern: /superadmin\/obat-sync/i, label: "Sinkronisasi data obat" },
    { pattern: /superadmin\/users/i, label: "Pengaturan pengguna" },
    { pattern: /superadmin/i, label: "Pengaturan super admin" },
    { pattern: /auth/i, label: "Login / autentikasi" },
]

export function getPathDescription(path: string): string {
    for (const { pattern, label } of PATH_HINTS) {
        if (pattern.test(path)) return label
    }
    return path.replace(/^api\/?/, "").replace(/\//g, " → ") || "Sistem"
}

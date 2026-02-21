/**
 * Cetak lampiran pemeriksaan (gambar dari canvas) sebagai dokumen terpisah.
 * Mirip alur print-resep: buat iframe, inject HTML dengan gambar, lalu print().
 */
export type PrintVariant = "lampiran" | "untuk_pasien"

export interface PrintLampiranPemeriksaanOptions {
    /** Data URL gambar (dari canvas.toDataURL('image/png')) */
    imageDataUrl: string
    /** Nama pasien (opsional) */
    pasienNama?: string
    /** No. RM (opsional) */
    noRm?: string
    /** Judul dokumen */
    title?: string
    /** Ukuran gambar saat cetak (CSS), misal "100%", "17cm", "15cm" */
    imageWidth?: string
    /** Tinggi gambar saat cetak (CSS), misal "auto", "12cm". Jika tidak diisi, pakai auto agar proporsi tetap. */
    imageHeight?: string
    /** 'untuk_pasien' = judul & footer ramah pasien (untuk dibawa pulang); 'lampiran' = default arsip */
    variant?: PrintVariant
}

function escapeHtml(text: string | null | undefined): string {
    if (text == null) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

export function printLampiranPemeriksaan(options: PrintLampiranPemeriksaanOptions): void {
    const {
        imageDataUrl,
        pasienNama,
        noRm,
        title: titleOption,
        imageWidth,
        imageHeight = "auto",
        variant = "lampiran",
    } = options

    const isUntukPasien = variant === "untuk_pasien"
    const title =
        titleOption ??
        (isUntukPasien ? "Penjelasan Pemeriksaan untuk Pasien" : "Lampiran Pemeriksaan")
    const kopJudul = isUntukPasien ? "PENJELASAN PEMERIKSAAN UNTUK PASIEN" : "LAMPIRAN PEMERIKSAAN"
    const footerText = isUntukPasien
        ? "Dibawa pulang sebagai penjelasan pemeriksaan — EMR Nia"
        : "Dicetak dari EMR Nia - Lampiran Pemeriksaan"

    const nama = escapeHtml(pasienNama ?? "—")
    const rm = escapeHtml(noRm ?? "—")
    const imgStyle =
        imageWidth != null
            ? `max-width: 100%; width: ${escapeHtml(imageWidth)}; height: ${escapeHtml(imageHeight)}; object-fit: contain;`
            : "max-width: 100%; height: auto;"

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; padding: 20px; max-width: 21cm; margin: 0 auto; color: #000; background: #fff; }
    .kop { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
    .kop .judul { font-size: 14pt; font-weight: bold; }
    .kop .subjudul { font-size: 10pt; color: #444; margin-top: 4px; }
    .blok { margin-bottom: 12px; }
    .blok .label { font-weight: bold; margin-bottom: 2px; }
    .gambar-wrapper { margin: 16px 0; text-align: center; }
    .gambar-wrapper img { max-width: 100%; height: auto; border: 1px solid #ccc; }
    .footer { margin-top: 24px; font-size: 9pt; color: #444; text-align: center; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="kop">
    <div class="judul">${escapeHtml(kopJudul)}</div>
    ${isUntukPasien ? '<div class="subjudul">Gambar penjelasan dari dokter untuk dibawa pulang</div>' : ""}
  </div>

  <div class="blok">
    <div class="label">Pasien</div>
    <div>${nama}</div>
    <div>No. RM: ${rm}</div>
  </div>

  <div class="gambar-wrapper">
    <img src="${imageDataUrl}" alt="Gambar pemeriksaan" style="${imgStyle}" />
  </div>

  <div class="footer">${escapeHtml(footerText)}</div>
</body>
</html>`

    const iframe = document.createElement("iframe")
    iframe.setAttribute("style", "position:fixed;left:0;top:0;width:0;height:0;border:0;overflow:hidden;")
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document
    if (!doc) {
        iframe.remove()
        return
    }
    doc.open()
    doc.write(html)
    doc.close()

    setTimeout(() => {
        iframe.contentWindow?.print()
        setTimeout(() => iframe.remove(), 2000)
    }, 400)
}

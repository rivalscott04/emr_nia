import type { ResepDetailFarmasi } from "../../types/farmasi"

function formatWaktu(waktu: string | null | undefined): string {
    if (!waktu) return "—"
    const d = new Date(waktu)
    if (Number.isNaN(d.getTime())) return String(waktu)
    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(d)
    } catch {
        return String(waktu)
    }
}

/**
 * Format umum resep Indonesia untuk cetak (dokter tulis tangan via apotek).
 * Kop → Pasien → Dokter → Tabel item resep → Ruang TTD → Footer.
 */
export function printResep(detail: ResepDetailFarmasi): void {
    const pasien = detail.pasien ?? {}
    const namaPasien = escapeHtml(pasien.nama ?? "—")
    const noRm = escapeHtml(pasien.no_rm ?? "—")
    const allergies = pasien.allergies && Array.isArray(pasien.allergies) ? pasien.allergies : []
    const alergiText = allergies.length > 0 ? allergies.join(", ") : "Tidak ada"
    const dokter = escapeHtml(detail.dokter ?? "—")
    const noResep = escapeHtml(detail.no_resep ?? "—")
    const waktuText = formatWaktu(detail.waktu)

    const items = Array.isArray(detail.items) ? detail.items : []
    const itemsHtml =
        items.length > 0
            ? items
                  .map(
                      (item, i) =>
                          `<tr>
            <td class="col-no">${i + 1}</td>
            <td class="col-nama">${escapeHtml(item.nama_obat)}</td>
            <td class="col-jumlah">${escapeHtml(item.jumlah)}</td>
            <td class="col-aturan">${escapeHtml(item.aturan_pakai)}</td>
          </tr>`
                  )
                  .join("")
            : `<tr><td colspan="4" style="padding:12px; border:1px solid #333; text-align:center; color:#666;">— Belum ada item resep —</td></tr>`

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resep ${noResep}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; padding: 20px; max-width: 21cm; margin: 0 auto; color: #000; background: #fff; position: relative; }
    .emboss { position: fixed; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 0; pointer-events: none; }
    .emboss span { font-size: 72pt; font-weight: bold; letter-spacing: 0.1em; color: rgba(0,0,0,0.06); text-shadow: 1px 1px 0 rgba(255,255,255,0.8), -1px -1px 0 rgba(0,0,0,0.08); transform: rotate(-15deg); white-space: nowrap; }
    .content { position: relative; z-index: 1; }
    .kop { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; }
    .kop .judul { font-size: 14pt; font-weight: bold; }
    .kop .sub { font-size: 10pt; }
    .blok { margin-bottom: 14px; }
    .blok .label { font-weight: bold; margin-bottom: 2px; }
    .alergi { color: #c2410c; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th, td { border: 1px solid #000; text-align: left; padding: 6px 8px; }
    th { background: #f0f0f0; font-weight: bold; font-size: 10pt; }
    .col-no { width: 35px; }
    .col-nama { width: auto; min-width: 200px; }
    .col-jumlah { width: 70px; }
    .col-aturan { width: 120px; font-size: 10pt; }
    .footer { margin-top: 24px; font-size: 9pt; color: #444; text-align: center; }
    .ttd { margin-top: 28px; }
    .ttd .label { width: 200px; margin-left: auto; text-align: center; font-size: 10pt; }
    @media print { body { padding: 12px; } .emboss span { color: rgba(0,0,0,0.07); -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="emboss" aria-hidden="true"><span>APOTIK NIA</span></div>
  <div class="content">
  <div class="kop">
    <div class="judul">RESEP</div>
    <div class="sub">No. Resep: ${noResep} &nbsp;&nbsp;|&nbsp;&nbsp; Tanggal: ${waktuText}</div>
  </div>

  <div class="blok">
    <div class="label">Pasien</div>
    <div>${namaPasien}</div>
    <div>No. RM: ${noRm}</div>
    <div class="alergi">Alergi: ${escapeHtml(alergiText)}</div>
  </div>

  <div class="blok">
    <div class="label">Dokter</div>
    <div>${dokter}</div>
  </div>

  <div class="blok">
    <div class="label">Item Resep</div>
    <table>
      <thead>
        <tr>
          <th class="col-no">No</th>
          <th class="col-nama">Nama Obat</th>
          <th class="col-jumlah">Jumlah</th>
          <th class="col-aturan">Aturan Pakai</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
  </div>

  <div class="ttd">
    <div class="label">(Ruang untuk tanda tangan dokter)</div>
  </div>

  <div class="footer">Dicetak dari EMR Nia - Apotek</div>
  </div>
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

function escapeHtml(text: string | null | undefined): string {
    if (text == null) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Export Pasien - {{ $dokterName }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; }
        h1 { font-size: 14px; margin-bottom: 8px; }
        .meta { margin-bottom: 12px; color: #444; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 5px 6px; text-align: left; }
        th { background: #e5e7eb; font-weight: bold; }
        tr:nth-child(even) { background: #f9fafb; }
    </style>
</head>
<body>
    <h1>Daftar Pasien (Export untuk Keperluan Pajak/Arsip)</h1>
    <p class="meta"><strong>Dokter:</strong> {{ $dokterName }} &nbsp;|&nbsp; <strong>Tanggal export:</strong> {{ $tanggalExport }}</p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Dokter</th>
                <th>No RM</th>
                <th>NIK</th>
                <th>Nama</th>
                <th>Tanggal Lahir</th>
                <th>Jenis Kelamin</th>
                <th>Alamat</th>
                <th>No HP</th>
                <th>Gol. Darah</th>
                <th>Pekerjaan</th>
                <th>Status Pernikahan</th>
                <th>Nama Ibu</th>
                <th>Nama Suami</th>
                <th>Alergi</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($pasiens as $index => $p)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $dokterName }}</td>
                <td>{{ $p['no_rm'] ?? '' }}</td>
                <td>{{ $p['nik'] ?? '' }}</td>
                <td>{{ $p['nama'] ?? '' }}</td>
                <td>{{ $p['tanggal_lahir'] ?? '' }}</td>
                <td>{{ $p['jenis_kelamin'] ?? '' }}</td>
                <td>{{ $p['alamat'] ?? '' }}</td>
                <td>{{ $p['no_hp'] ?? '' }}</td>
                <td>{{ $p['golongan_darah'] ?? '' }}</td>
                <td>{{ $p['pekerjaan'] ?? '' }}</td>
                <td>{{ $p['status_pernikahan'] ?? '' }}</td>
                <td>{{ $p['nama_ibu_kandung'] ?? '' }}</td>
                <td>{{ $p['nama_suami'] ?? '' }}</td>
                <td>{{ $p['alergi'] ?? '' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>

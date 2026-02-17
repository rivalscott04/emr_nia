<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterObatMirror extends Model
{
    use HasFactory;

    protected $table = 'master_obat_mirror';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'external_noindex',
        'kode',
        'nama',
        'nama_kelompok',
        'kode_satuan',
        'harga_jual',
        'stok',
        'raw_payload',
        'synced_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'harga_jual' => 'float',
            'stok' => 'float',
            'raw_payload' => 'array',
            'synced_at' => 'datetime',
        ];
    }
}


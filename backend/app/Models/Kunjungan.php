<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kunjungan extends Model
{
    use HasFactory, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'pasien_id',
        'pasien_nama',
        'dokter_id',
        'dokter_nama',
        'poli',
        'kunjungan_ke',
        'tanggal',
        'keluhan_utama',
        'td_sistole',
        'td_diastole',
        'berat_badan',
        'tinggi_badan',
        'hpht',
        'htp',
        'gravida',
        'para',
        'form_hidup',
        'abortus',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kunjungan_ke' => 'integer',
            'tanggal' => 'datetime',
            'td_sistole' => 'integer',
            'td_diastole' => 'integer',
            'berat_badan' => 'float',
            'tinggi_badan' => 'float',
            'hpht' => 'date',
            'htp' => 'datetime',
            'gravida' => 'integer',
            'para' => 'integer',
            'form_hidup' => 'integer',
            'abortus' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Pasien, $this>
     */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class);
    }

    /**
     * @return HasOne<RekamMedis, $this>
     */
    public function rekamMedis(): HasOne
    {
        return $this->hasOne(RekamMedis::class);
    }
}


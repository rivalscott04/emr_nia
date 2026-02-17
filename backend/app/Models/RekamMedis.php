<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RekamMedis extends Model
{
    use HasFactory, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'id',
        'kunjungan_id',
        'status',
        'resep_status',
        'subjective',
        'objective',
        'assessment',
        'plan',
        'instruksi',
        'sistole',
        'diastole',
        'nadi',
        'rr',
        'suhu',
        'spo2',
        'berat_badan',
        'tinggi_badan',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'suhu' => 'float',
            'berat_badan' => 'float',
            'tinggi_badan' => 'float',
        ];
    }

    /**
     * @return BelongsTo<Kunjungan, $this>
     */
    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(Kunjungan::class);
    }

    /**
     * @return HasMany<RekamMedisDiagnosa, $this>
     */
    public function diagnosas(): HasMany
    {
        return $this->hasMany(RekamMedisDiagnosa::class);
    }

    /**
     * @return HasMany<RekamMedisResepItem, $this>
     */
    public function resepItems(): HasMany
    {
        return $this->hasMany(RekamMedisResepItem::class);
    }

    /**
     * @return HasMany<RekamMedisAddendum, $this>
     */
    public function addendums(): HasMany
    {
        return $this->hasMany(RekamMedisAddendum::class);
    }
}


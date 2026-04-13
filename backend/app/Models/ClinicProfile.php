<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicProfile extends Model
{
    protected $table = 'clinic_profiles';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'telepon',
        'alamat',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterIcdCode extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'type',
        'code',
        'name',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}

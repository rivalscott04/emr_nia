<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ObatSyncLog extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'started_at',
        'finished_at',
        'status',
        'total_fetched',
        'total_inserted',
        'total_updated',
        'total_skipped',
        'error_message',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}


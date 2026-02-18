<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ObatSyncLog */
class ObatSyncLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $keterangan = match ($this->status) {
            'failed' => $this->error_message ?? 'Gagal',
            'success' => sprintf(
                'Fetched: %d, Inserted: %d, Updated: %d, Skipped: %d',
                $this->total_fetched,
                $this->total_inserted,
                $this->total_updated,
                $this->total_skipped
            ),
            default => 'Sedang berjalan',
        };

        return [
            'id' => $this->id,
            'started_at' => $this->started_at?->toIso8601String(),
            'finished_at' => $this->finished_at?->toIso8601String(),
            'status' => $this->status,
            'total_fetched' => $this->total_fetched,
            'total_inserted' => $this->total_inserted,
            'total_updated' => $this->total_updated,
            'total_skipped' => $this->total_skipped,
            'message' => $keterangan,
        ];
    }
}

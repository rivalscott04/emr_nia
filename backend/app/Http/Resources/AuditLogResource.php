<?php

namespace App\Http\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AuditLog */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actor' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
            ],
            'method' => $this->method,
            'path' => $this->path,
            'status_code' => $this->status_code,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'request_payload' => $this->request_payload,
            'meta' => $this->meta,
            'created_at' => optional($this->created_at)?->toISOString(),
        ];
    }
}

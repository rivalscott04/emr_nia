<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuditLog\IndexAuditLogRequest;
use App\Http\Resources\AuditLogCollection;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(IndexAuditLogRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['limit'] ?? 20);

        $query = AuditLog::query()->with('user');

        if (! empty($validated['q'])) {
            $keyword = (string) $validated['q'];
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('path', 'like', '%'.$keyword.'%')
                    ->orWhere('method', 'like', '%'.$keyword.'%')
                    ->orWhereHas('user', function ($userQuery) use ($keyword): void {
                        $userQuery->where('name', 'like', '%'.$keyword.'%')
                            ->orWhere('email', 'like', '%'.$keyword.'%');
                    });
            });
        }

        if (! empty($validated['method'])) {
            $query->where('method', $validated['method']);
        }

        if (! empty($validated['status_code'])) {
            $query->where('status_code', (int) $validated['status_code']);
        }

        if (! empty($validated['user_id'])) {
            $query->where('user_id', (int) $validated['user_id']);
        }

        if (! empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (! empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        $logs = $query
            ->orderByDesc('created_at')
            ->paginate($limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new AuditLogCollection($logs))->toArray($request),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterIcdCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IcdController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        $type = (string) $request->query('type', 'ICD-10');
        $limit = min(50, max(1, (int) $request->query('limit', 15)));

        if ($query === '') {
            return response()->json([
                'success' => true,
                'message' => '',
                'data' => [
                    'items' => [],
                    'total' => 0,
                ],
            ]);
        }

        $records = MasterIcdCode::query()
            ->where('type', $type)
            ->where('is_active', true)
            ->where(function ($builder) use ($query): void {
                $builder->where('code', 'like', '%'.$query.'%')
                    ->orWhere('name', 'like', '%'.$query.'%');
            })
            ->orderBy('code')
            ->limit($limit)
            ->get(['id', 'type', 'code', 'name']);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'items' => $records,
                'total' => $records->count(),
            ],
        ]);
    }
}

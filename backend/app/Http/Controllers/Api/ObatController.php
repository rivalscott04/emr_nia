<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Obat\SearchObatRequest;
use App\Services\ObatService;
use Illuminate\Http\JsonResponse;

class ObatController extends Controller
{
    public function __construct(
        private readonly ObatService $obatService
    ) {
    }

    public function search(SearchObatRequest $request): JsonResponse
    {
        $query = (string) $request->validated('q');
        $limit = (int) ($request->validated('limit') ?? 20);

        $items = $this->obatService->search($query, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'items' => $items,
                'total' => count($items),
            ],
        ]);
    }
}


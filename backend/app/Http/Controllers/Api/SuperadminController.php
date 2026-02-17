<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\IndexSuperadminUserRequest;
use App\Http\Requests\Superadmin\IndexMasterIcdRequest;
use App\Http\Requests\Superadmin\StoreMasterIcdRequest;
use App\Http\Requests\Superadmin\StorePoliRequest;
use App\Http\Requests\Superadmin\StoreRoleRequest;
use App\Http\Requests\Superadmin\StoreSuperadminUserRequest;
use App\Http\Requests\Superadmin\UpdateMasterIcdRequest;
use App\Http\Requests\Superadmin\UpdatePoliRequest;
use App\Http\Requests\Superadmin\UpdateRoleRequest;
use App\Http\Requests\Superadmin\UpdateSuperadminUserRequest;
use App\Http\Resources\SuperadminUserCollection;
use App\Http\Resources\SuperadminUserResource;
use App\Services\SuperadminService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class SuperadminController extends Controller
{
    public function __construct(
        private readonly SuperadminService $superadminService
    ) {
    }

    public function users(IndexSuperadminUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['limit'] ?? 20);
        $users = $this->superadminService->paginateUsers($validated, $limit);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new SuperadminUserCollection($users))->toArray($request),
        ]);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $this->superadminService->getRolesData(),
        ]);
    }

    public function storeRole(StoreRoleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $role = $this->superadminService->createRole($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ],
        ], 201);
    }

    public function updateRole(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();

        try {
            $role = $this->superadminService->updateRole($id, $validated);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ],
        ]);
    }

    public function deleteRole(int $id): JsonResponse
    {
        try {
            $this->superadminService->deleteRole($id);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus.',
            'data' => null,
        ]);
    }

    public function polis(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $this->superadminService->getPolis(),
        ]);
    }

    public function storePoli(StorePoliRequest $request): JsonResponse
    {
        $poli = $this->superadminService->createPoli($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Poli berhasil dibuat.',
            'data' => $poli,
        ], 201);
    }

    public function updatePoli(UpdatePoliRequest $request, int $id): JsonResponse
    {
        try {
            $poli = $this->superadminService->updatePoli($id, $request->validated());
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Poli berhasil diperbarui.',
            'data' => $poli,
        ]);
    }

    public function deletePoli(int $id): JsonResponse
    {
        try {
            $this->superadminService->deletePoli($id);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Poli berhasil dihapus.',
            'data' => null,
        ]);
    }

    public function storeUser(StoreSuperadminUserRequest $request): JsonResponse
    {
        $user = $this->superadminService->createUser($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dibuat.',
            'data' => (new SuperadminUserResource($user))->toArray($request),
        ], 201);
    }

    public function updateUser(UpdateSuperadminUserRequest $request, int $id): JsonResponse
    {
        try {
            $user = $this->superadminService->updateUser($id, $request->validated());
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'User access berhasil diperbarui.',
            'data' => (new SuperadminUserResource($user))->toArray($request),
        ]);
    }

    public function deleteUser(int $id): JsonResponse
    {
        try {
            $this->superadminService->deleteUser($id);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus.',
            'data' => null,
        ]);
    }

    public function icdCodes(IndexMasterIcdRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $records = $this->superadminService->paginateIcdCodes($validated, (int) ($validated['limit'] ?? 100));

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'items' => $records->items(),
                'total' => $records->total(),
            ],
        ]);
    }

    public function storeIcdCode(StoreMasterIcdRequest $request): JsonResponse
    {
        try {
            $record = $this->superadminService->createIcdCode($request->validated());
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Master ICD berhasil dibuat.',
            'data' => $record,
        ], 201);
    }

    public function updateIcdCode(UpdateMasterIcdRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->superadminService->updateIcdCode($id, $request->validated());
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Master ICD berhasil diperbarui.',
            'data' => $record,
        ]);
    }

    public function deleteIcdCode(int $id): JsonResponse
    {
        try {
            $this->superadminService->deleteIcdCode($id);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Master ICD berhasil dihapus.',
            'data' => null,
        ]);
    }
}

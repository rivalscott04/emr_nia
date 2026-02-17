<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $login = trim((string) $validated['login']);
        $loginLower = mb_strtolower($login);
        $password = (string) $validated['password'];

        /** @var User|null $user */
        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$loginLower])
            ->orWhereRaw('LOWER(username) = ?', [$loginLower])
            ->first();

        if (! $user || ! Hash::check($password, (string) $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Login gagal. Periksa username/email dan password.',
                'data' => null,
            ], 401);
        }

        $token = auth('api')->claims([
            'roles' => $user->roleNames(),
        ])->login($user);

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user' => (new AuthUserResource($user))->toArray($request),
            ],
        ]);
    }

    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'data' => null,
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => (new AuthUserResource($user))->toArray(request()),
        ]);
    }

    public function logout(): JsonResponse
    {
        $token = JWTAuth::getToken();
        if ($token) {
            auth('api')->logout();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
            'data' => null,
        ]);
    }
}

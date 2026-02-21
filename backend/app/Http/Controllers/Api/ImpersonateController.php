<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use Illuminate\Http\Request;

class ImpersonateController extends Controller
{
    public function impersonate(Request $request, string $userId)
    {
        $admin = $request->user();

        // 1. Verify Requestor is Superadmin
        if (! $admin->hasRole('superadmin')) {
            abort(403, 'Unauthorized. Only superadmin can impersonate.');
        }

        // 2. Find Target User
        $user = User::findOrFail($userId);

        // 3. Prevent impersonating another superadmin (optional, safety)
        if ($user->hasRole('superadmin')) {
            abort(403, 'Cannot impersonate another superadmin.');
        }

        // 4. Create Token for Target User (JWT)
        $token = auth('api')->login($user);
        if (! $token) {
            return response()->json([
                'success' => false,
                'message' => 'Could not create token.',
                'data' => null,
            ], 500);
        }

        $message = "Impersonating {$user->name}";

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'token' => $token,
                'user' => (new AuthUserResource($user))->toArray($request),
                'message' => $message,
            ],
        ]);
    }
}

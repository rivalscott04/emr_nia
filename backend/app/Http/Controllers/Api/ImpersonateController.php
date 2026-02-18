<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;

class ImpersonateController extends Controller
{
    public function impersonate(Request $request, string $userId)
    {
        $admin = $request->user();

        // 1. Verify Requestor is Superadmin
        if (!$admin->hasRole('superadmin')) {
            abort(403, 'Unauthorized. Only superadmin can impersonate.');
        }

        // 2. Find Target User
        $user = User::findOrFail($userId);

        // 3. Prevent impersonating another superadmin (optional, safety)
        if ($user->hasRole('superadmin')) {
            abort(403, 'Cannot impersonate another superadmin.');
        }

        // 4. Create Token for Target User (JWT)
        // We can add custom claims like 'impersonated_by' but usually just generating a valid token is enough
        if (!$token = auth('api')->login($user)) {
             return response()->json(['error' => 'Could not create token'], 500);
        }

        // OR explicitly using JWTAuth facade if preferred:
        // $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user' => $user->load('roles'),
            'message' => "Impersonating {$user->name}",
        ]);
    }
}

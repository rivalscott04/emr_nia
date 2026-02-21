<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermissionAny
{
    /**
     * User must have at least one of the given permissions (comma-separated).
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $permissions): Response
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        /** @var User|null $user */
        $user = auth('api')->user();
        if (! $user) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Unauthenticated.',
                'data' => null,
            ], 401);
        }

        $list = array_map('trim', explode(',', $permissions));
        $hasAny = false;
        foreach ($list as $permission) {
            if ($permission !== '' && $user->hasPermission($permission)) {
                $hasAny = true;
                break;
            }
        }

        if (! $hasAny) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk aksi ini.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}

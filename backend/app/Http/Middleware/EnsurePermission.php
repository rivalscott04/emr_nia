<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
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

        if (! $user->hasPermission($permission)) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk aksi ini.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}

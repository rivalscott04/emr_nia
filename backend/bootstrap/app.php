<?php

use App\Http\Middleware\AuditApiAction;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsurePermissionAny;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\PreflightCorsForApi;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // HandleCors dulu, lalu PreflightCorsForApi — prepend terakhir = jalan pertama. OPTIONS harus dijawab 204+CORS sebelum auth.
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->prepend(PreflightCorsForApi::class);

        // Force Accept: application/json pada API routes agar auth failure selalu menghasilkan JSON 401, bukan redirect (CORS error).
        $middleware->api(prepend: [ForceJsonResponse::class]);

        $middleware->alias([
            'permission' => EnsurePermission::class,
            'permission_any' => EnsurePermissionAny::class,
            'audit.api' => AuditApiAction::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Request ke /api/* yang unauthenticated selalu dapat JSON 401, jangan redirect ke login (bikin CORS error).
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->is('api')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                    'data' => null,
                ], 401);
            }
        });
    })->create();

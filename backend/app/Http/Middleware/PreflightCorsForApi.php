<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Tangani preflight OPTIONS dengan 204 + CORS agar tidak sampai ke auth (redirect → CORS error).
 * Tangkap semua OPTIONS (termasuk path api/* dan superadmin/*) karena path di request bisa beda tergantung server.
 */
class PreflightCorsForApi
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('OPTIONS')) {
            return $next($request);
        }

        // Semua OPTIONS (preflight) dijawab 204 + CORS; path bisa "api/*" atau "superadmin/*" tergantung prefix.
        $origin = $request->header('Origin', '*');
        $allowedOrigins = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*') ?: '*'))) ?: ['*'];
        $allowOrigin = in_array('*', $allowedOrigins, true) ? '*' : (in_array($origin, $allowedOrigins, true) ? $origin : ($allowedOrigins[0] ?? '*'));

        return response('', 204)
            ->withHeaders([
                'Access-Control-Allow-Origin' => $allowOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
                'Access-Control-Max-Age' => (string) max(0, (int) env('CORS_MAX_AGE', 86400)),
            ]);
    }
}

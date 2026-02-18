<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Force Accept: application/json pada semua request API.
 *
 * Ini memastikan expectsJson() selalu true untuk route api/*,
 * sehingga auth failure mengembalikan JSON 401 alih-alih redirect (yang menyebabkan CORS error).
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditApiAction
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $response;
        }

        /** @var User|null $user */
        $user = auth('api')->user();

        $payload = $request->except(['password', 'password_confirmation']);

        AuditLog::query()->create([
            'user_id' => $user?->id,
            'method' => $request->method(),
            'path' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_payload' => $payload,
            'meta' => [
                'query' => $request->query(),
            ],
        ]);

        return $response;
    }
}

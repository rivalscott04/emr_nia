<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $login = mb_strtolower(trim((string) $request->input('login', '')));
            $loginKey = $login !== '' ? hash('sha256', $login) : 'empty';

            return [
                Limit::perMinute(20)->by($request->ip()),
                Limit::perMinute(5)->by($request->ip().'|'.$loginKey),
            ];
        });
    }
}

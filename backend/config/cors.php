<?php

return [
    // Izinkan CORS untuk semua path selama development.
    // Path eksplisit api/* dan api/superadmin/* agar preflight OPTIONS (master-icd, dll) selalu dapat header CORS.
    'paths' => ['api/*', 'api/superadmin/*', '*'],

    'allowed_methods' => ['*'],
    // Bisa pakai * atau daftar origin dipisah koma, contoh: http://localhost:3000,https://app.example.com
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*') ?: '*'))) ?: ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => (int) env('CORS_MAX_AGE', 0),
    'supports_credentials' => filter_var(env('CORS_SUPPORTS_CREDENTIALS', false), FILTER_VALIDATE_BOOLEAN),
];

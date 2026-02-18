<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'farmasi' => [
        // Login REST API (Mizan Cloud) – untuk ambil token sebelum sync
        'login_url' => env('FARMASI_LOGIN_URL', 'https://biling.mizancloud.com/auth/tenant/login'),
        'company_code' => env('FARMASI_COMPANY_CODE', 'apotek_nia'),
        // Daftar barang (paginated): GET {barang_daftar_url}?idgudang={idgudang}&halaman={n}
        'barang_daftar_url' => env('FARMASI_BARANG_DAFTAR_URL', 'http://103.103.23.30:8984/api/barang/daftar'),
        'idgudang' => env('FARMASI_IDGUDANG', '1-1'),
        'timeout_ms' => env('FARMASI_TIMEOUT_MS', 5000),
        // Verifikasi SSL. Set false hanya untuk development jika dapat "SSL certificate problem"
        'verify_ssl' => env('FARMASI_VERIFY_SSL', true),
        // Fallback: token statis (opsional, jika tidak pakai login)
        'token' => env('FARMASI_API_TOKEN'),
        'obat_endpoint' => env('FARMASI_OBAT_ENDPOINT'),
    ],

];

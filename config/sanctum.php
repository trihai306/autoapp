<?php

return [
	/*
	|--------------------------------------------------------------------------
	| Stateful Domains
	|--------------------------------------------------------------------------
	| Các domain được coi là stateful cho SPA sử dụng Sanctum.
	*/

	'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,autoapp.test,lionsoftware.vn')), 

	'expiration' => null,

	'middleware' => [
		'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
		'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
		'add_cookies_to_response' => Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
		'create_fresh_api_token' => Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
	],
];



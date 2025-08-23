<?php

return [
	/*
	|--------------------------------------------------------------------------
	| Laravel CORS Configuration
	|--------------------------------------------------------------------------
	| Cho phép SPA (localhost:3000) gọi API và sanctum/csrf-cookie với cookie
	| kèm theo (credentials: include). KHÔNG dùng wildcard '*' khi có credentials.
	*/

	'paths' => [
		'api/*',
		'broadcasting/auth',
		'sanctum/csrf-cookie',
	],

	'allowed_methods' => ['*'],

	'allowed_origins' => [
		env('FRONTEND_URL', 'http://localhost:3000'),
		env('APP_URL', 'http://autoapp.test'),
		'https://lionsoftware.vn',
		'http://lionsoftware.vn',
	],

	'allowed_origins_patterns' => [],

	'allowed_headers' => ['*'],

	'exposed_headers' => [],

	'max_age' => 0,

	'supports_credentials' => true,
];



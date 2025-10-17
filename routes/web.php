<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

Route::get('/', function () {
    return view('welcome');
});

// Broadcasting authentication routes
Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);

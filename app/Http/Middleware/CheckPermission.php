<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => 'You must be logged in to access this resource.'
            ], 401);
        }

        $user = Auth::user();

        // Check if user has the required permission
        if (!$user->can($permission)) {
            return response()->json([
                'message' => 'Forbidden.',
                'error' => 'You do not have permission to access this resource.',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }
}
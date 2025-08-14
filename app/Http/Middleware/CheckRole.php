<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated.',
                'error' => 'You must be logged in to access this resource.'
            ], 401);
        }

        $user = Auth::user();

        // Check if user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            return response()->json([
                'message' => 'Forbidden.',
                'error' => 'You do not have the required role to access this resource.',
                'required_roles' => $roles,
                'user_roles' => $user->getRoleNames()
            ], 403);
        }

        return $next($request);
    }
}
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\Sanctum;
use Symfony\Component\HttpFoundation\Response;

class BroadcastingAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log request details để debug
        Log::info('Broadcasting auth request', [
            'method' => $request->method(),
            'url' => $request->url(),
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        // Kiểm tra xem user đã được xác thực chưa
        if (!Auth::check()) {
            Log::warning('Broadcasting auth: User not authenticated');
            
            // Thử xác thực bằng token từ header
            $token = $request->bearerToken();
            if ($token) {
                Log::info('Broadcasting auth: Attempting to authenticate with token');
                
                // Thử xác thực với Sanctum
                try {
                    // Tìm user từ token
                    $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                    if ($tokenModel) {
                        $user = $tokenModel->tokenable;
                        if ($user) {
                            // Set user cho request
                            Auth::login($user);
                            Log::info('Broadcasting auth: Successfully authenticated with token', [
                                'user_id' => $user->id,
                                'user_name' => $user->name
                            ]);
                            return $next($request);
                        }
                    }
                    
                    Log::error('Broadcasting auth: Token not found or invalid');
                } catch (\Exception $e) {
                    Log::error('Broadcasting auth: Token authentication failed', [
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Nếu không có token hoặc token không hợp lệ, trả về lỗi 403
            Log::error('Broadcasting auth: Access denied - no valid authentication');
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Log::info('Broadcasting auth: User authenticated successfully', [
            'user_id' => Auth::id(),
            'user_name' => Auth::user()->name ?? 'Unknown'
        ]);

        return $next($request);
    }
}

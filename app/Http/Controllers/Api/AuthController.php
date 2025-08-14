<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use App\Helpers\PermissionHelper;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

#[Group('Authentication')]
class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user
     *
     * Creates a new user account and returns user data along with an API token.
     * @unauthenticated
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            /**
             * The first name of the user.
             * @example John
             */
            'first_name' => ['required', 'string', 'max:255'],
            /**
             * The last name of the user.
             * @example Doe
             */
            'last_name' => ['required', 'string', 'max:255'],
            /**
             * The email of the user. Must be unique.
             * @example john@example.com
             */
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            /**
             * The phone number of the user. Must be unique.
             * @example 0987654321
             */
            'phone_number' => ['required', 'string', 'max:255', 'unique:users'],
            /**
             * The password for the user.
             * @example password
             */
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $result = $this->authService->register($validated);
            // User registered successfully.
            return response()->json([
                'message' => 'User registered successfully.',
                'user' => $result['user'],
                'token' => $result['token'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Log in a user
     *
     * Authenticates a user and returns user data with an API token.
     * @unauthenticated
     * @throws ValidationException
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            /**
             * The user's email or phone number.
             * @example john@example.com or 0987654321
             */
            'login' => 'required|string',
            /**
             * The user's password.
             * @example password
             */
            'password' => 'required',
        ]);

        try {
            $result = $this->authService->login($validated);
            // User logged in successfully.
            return response()->json([
                'user' => $result['user'],
                'token' => $result['token'],
                'login_token' => $result['user']->login_token,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get user profile
     *
     * Returns the authenticated user's profile information.
     * @authenticated
     */
    public function getProfile()
    {
        // The authenticated user's profile data.
        return response()->json($this->authService->getProfile());
    }

    /**
     * Log out
     *
     * Invalidates the user's current API token.
     * @authenticated
     */
    public function logout()
    {
        $this->authService->logout();
        // The user was successfully logged out.
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Forgot password
     *
     * Sends a password reset link to the user's email.
     * @unauthenticated
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            /**
             * The user's email address.
             * @example john@example.com
             */
            'email' => 'required|email'
        ]);

        $status = $this->authService->forgotPassword($request->email);
        // A password reset link has been sent.
        return response()->json(['message' => $status]);
    }

    /**
     * Reset password
     *
     * Resets the user's password using the provided token.
     * @unauthenticated
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            /** The password reset token from the email. */
            'token' => 'required',
            /**
             * The user's email address.
             * @example john@example.com
             */
            'email' => 'required|email',
            /** The new password. */
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = $this->authService->resetPassword($request->all());
        // The password has been successfully reset.
        return response()->json(['message' => $status]);
    }

    /**
     * Generate login token
     *
     * Generates a permanent login token for the user that can be used for passwordless login.
     * Returns existing token if user already has one.
     * @unauthenticated
     */
    public function generateLoginToken(Request $request)
    {
        $validated = $request->validate([
            /**
             * The user's email or phone number.
             * @example john@example.com or 0987654321
             */
            'login' => 'required|string',
        ]);

        try {
            $result = $this->authService->generateLoginToken($validated['login']);
            
            // Login token retrieved or generated successfully.
            return response()->json([
                'message' => 'Login token retrieved successfully.',
                'user' => $result['user']->only(['id', 'name', 'email', 'first_name', 'last_name']),
                'login_token' => $result['login_token'],
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Login with token
     *
     * Authenticates a user using a login token instead of password.
     * @unauthenticated
     */
    public function loginWithToken(Request $request)
    {
        $validated = $request->validate([
            /**
             * The login token.
             * @example abc123def456...
             */
            'token' => 'required|string',
        ]);

        try {
            $result = $this->authService->loginWithToken($validated['token']);
            
            // User logged in successfully with token.
            return response()->json([
                'message' => 'User logged in successfully.',
                'user' => $result['user'],
                'token' => $result['token'],
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get user permissions
     *
     * Returns the current user's roles and permissions.
     * @authenticated
     */
    public function getUserPermissions()
    {
        $permissions = PermissionHelper::getFormattedUserPermissions();
        
        return response()->json([
            'user' => auth()->user()->only(['id', 'name', 'email', 'first_name', 'last_name']),
            'permissions' => $permissions
        ]);
    }
}

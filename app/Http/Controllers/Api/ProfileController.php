<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

/**
 * @authenticated
 */
#[Group('User Profile')]
class ProfileController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Update profile settings
     *
     * Update the authenticated user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            /** The user's name. */
            'name' => 'sometimes|string|max:255',
            /** The user's email. Must be unique. */
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            /** The user's phone number. */
            'phone_number' => 'nullable|string|max:20',
            /** The user's address. */
            'address' => 'nullable|string|max:255',
        ]);

        $updatedUser = $this->userService->updateUser($user, $validated);

        // The updated user resource.
        return response()->json($updatedUser);
    }

    /**
     * Change password
     *
     * Update the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            /** The user's current password. */
            'current_password' => ['required', 'current_password'],
            /** The new password. */
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $this->userService->updateUser(Auth::user(), [
            'password' => bcrypt($request->input('password')),
        ]);
        
        // The password was changed successfully.
        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * Update avatar
     *
     * Update the authenticated user's avatar. The request must be a `multipart/form-data` request.
     * @requestMediaType multipart/form-data
     */
    public function updateAvatar(Request $request)
    {
        $validated = $request->validate([
            /** The image file to upload (max: 2MB). */
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user = $this->userService->updateAvatar(Auth::user(), $validated['avatar']);

        // The avatar was updated successfully.
        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => asset('storage/'.$user->avatar)
        ]);
    }
}

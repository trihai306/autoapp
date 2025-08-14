<?php

namespace App\Services;

use App\Models\User;
use App\Queries\BaseQuery;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserService
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getAllUsers(Request $request)
    {
        $query = $this->userRepository->getModel()->query()->with('roles');

        if (!$request->has('sort')) {
            $query->latest();
        }
        
        return BaseQuery::for($query, $request)->paginate();
    }

    public function findUserById(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    public function findUserByEmail(string $email): ?User
    {
        return $this->userRepository->findBy('email', $email);
    }

    public function findUserByEmailOrPhone(string $login): ?User
    {
        return $this->userRepository->findUserByEmailOrPhone($login);
    }

    public function createUser(array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user = $this->userRepository->create($data);

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }
        return $user->load('roles');
    }

    public function updateUser(User $user, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $this->userRepository->update($user, $data);

        if (isset($data['roles'])) {
            $user->syncRoles($data['roles']);
        }
        
        return $user->fresh()->load('roles');
    }

    public function deleteUser(User $user): bool
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        return $this->userRepository->delete($user->id);
    }

    public function assignRolesToUser(User $user, array $roleNames): User
    {
        $this->userRepository->assignRole($user, $roleNames);
        return $user->fresh()->load('roles');
    }

    public function updateAvatar(User $user, UploadedFile $avatar): User
    {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $avatar->store('avatars', 'public');

        $this->updateUser($user, ['avatar' => $path]);

        return $user->fresh();
    }

    public function deleteMultiple(array $userIds): int
    {
        return $this->userRepository->deleteByIds($userIds);
    }

    public function updateStatusMultiple(array $userIds, string $status): int
    {
        return $this->userRepository->updateByIds($userIds, ['status' => $status]);
    }

    public function getStatistics(): array
    {
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $lockedUsers = User::where('status', 'locked')->count();
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))->count();
        $totalBalance = User::sum('balance');
        $usersWithRoles = User::whereHas('roles')->count();

        return [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'lockedUsers' => $lockedUsers,
            'recentUsers' => $recentUsers,
            'totalBalance' => (float) $totalBalance,
            'usersWithRoles' => $usersWithRoles,
        ];
    }
}

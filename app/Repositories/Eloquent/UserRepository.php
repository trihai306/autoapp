<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Spatie\Permission\Models\Role;
use App\Repositories\Eloquent\BaseRepository;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    /**
     * UserRepository constructor.
     *
     * @param User $model
     */
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function syncRoles(User $user, array $roleIds): void
    {
        $roles = Role::whereIn('id', $roleIds)->get();
        $user->syncRoles($roles);
    }

    public function assignRole(User $user, string $roleName): void
    {
        $user->assignRole($roleName);
    }

    public function findUserByEmailOrPhone(string $login): ?User
    {
        return $this->model->where('email', $login)
            ->orWhere('phone_number', $login)
            ->first();
    }

    public function deleteByIds(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }

    public function updateByIds(array $ids, array $data): int
    {
        return $this->model->whereIn('id', $ids)->update($data);
    }
}

<?php

namespace App\Repositories;

use App\Models\User;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function syncRoles(User $user, array $roleIds): void;
    public function assignRole(User $user, string $roleName): void;
    public function findUserByEmailOrPhone(string $login): ?User;
    public function deleteByIds(array $ids): int;
    public function updateByIds(array $ids, array $data): int;
}

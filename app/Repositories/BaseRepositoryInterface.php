<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;

interface BaseRepositoryInterface
{
    /**
     * @param array $attributes
     * @return Model
     */
    public function create(array $attributes): Model;

    /**
     * @param $id
     * @return Model|null
     */
    public function find($id): ?Model;

    /**
     * @param Model $model
     * @param array $attributes
     * @return Model
     */
    public function update(Model $model, array $attributes): Model;

    /**
     * @param Model $model
     * @return bool
     */
    public function delete(Model $model): bool;

    /**
     * @return \Illuminate\Database\Eloquent\Collection|static[]
     */
    public function all();

    /**
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15);

    /**
     * @return Model
     */
    public function getModel(): Model;

    /**
     * Delete multiple records by IDs
     *
     * @param array $ids
     * @return int
     */
    public function deleteMultiple(array $ids): int;

    /**
     * Update status for multiple records
     *
     * @param array $ids
     * @param string $status
     * @return int
     */
    public function updateStatusMultiple(array $ids, string $status): int;
}

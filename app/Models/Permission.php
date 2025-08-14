<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    /**
     * The fields that are searchable.
     *
     * @var array
     */
    public $searchable = ['name'];

    /**
     * The fields that are sortable.
     *
     * @var array
     */
    public $sortable = ['name', 'created_at'];

    // Permissions usually don't have many filterable fields other than name,
    // which is covered by search.
    public $filterable = [];
}

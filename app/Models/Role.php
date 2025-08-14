<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
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

    // Roles usually don't have many filterable fields other than name,
    // which is covered by search.
    public $filterable = [];
}

<?php

namespace App\Repositories\Eloquent;

use App\Models\AccountTask;
use App\Repositories\AccountTaskRepositoryInterface;

class AccountTaskRepository extends BaseRepository implements AccountTaskRepositoryInterface
{
    /**
     * @param AccountTask $model
     */
    public function __construct(AccountTask $model)
    {
        parent::__construct($model);
    }
}

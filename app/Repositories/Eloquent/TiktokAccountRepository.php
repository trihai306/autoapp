<?php

namespace App\Repositories\Eloquent;

use App\Models\TiktokAccount;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\TiktokAccountRepositoryInterface;

class TiktokAccountRepository extends BaseRepository implements TiktokAccountRepositoryInterface
{
    public function __construct(TiktokAccount $model)
    {
        parent::__construct($model);
    }
}

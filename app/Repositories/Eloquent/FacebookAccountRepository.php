<?php

namespace App\Repositories\Eloquent;

use App\Models\FacebookAccount;
use App\Repositories\Eloquent\BaseRepository;
use App\Repositories\FacebookAccountRepositoryInterface;

class FacebookAccountRepository extends BaseRepository implements FacebookAccountRepositoryInterface
{
    public function __construct(FacebookAccount $model)
    {
        parent::__construct($model);
    }
}



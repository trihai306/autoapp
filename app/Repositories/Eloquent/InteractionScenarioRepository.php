<?php

namespace App\Repositories\Eloquent;

use App\Models\InteractionScenario;
use App\Repositories\InteractionScenarioRepositoryInterface;

class InteractionScenarioRepository extends BaseRepository implements InteractionScenarioRepositoryInterface
{
    /**
     * @param InteractionScenario $model
     */
    public function __construct(InteractionScenario $model)
    {
        parent::__construct($model);
    }
}

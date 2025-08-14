<?php

namespace App\Repositories\Eloquent;

use App\Models\ScenarioScript;
use App\Repositories\ScenarioScriptRepositoryInterface;

class ScenarioScriptRepository extends BaseRepository implements ScenarioScriptRepositoryInterface
{
    /**
     * @param ScenarioScript $model
     */
    public function __construct(ScenarioScript $model)
    {
        parent::__construct($model);
    }
}

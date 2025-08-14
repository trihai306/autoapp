<?php

namespace App\Services;

use App\Models\ScenarioScript;
use App\Queries\BaseQuery;
use App\Repositories\ScenarioScriptRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ScenarioScriptService
{
    protected $scenarioScriptRepository;

    public function __construct(ScenarioScriptRepositoryInterface $scenarioScriptRepository)
    {
        $this->scenarioScriptRepository = $scenarioScriptRepository;
    }

    public function getAll(Request $request): LengthAwarePaginator
    {
        $query = $this->scenarioScriptRepository->getModel()->query();
        return BaseQuery::for($query, $request)->paginate();
    }

    public function getById(int $id): ?ScenarioScript
    {
        return $this->scenarioScriptRepository->find($id);
    }

    public function create(array $data): ScenarioScript
    {
        return $this->scenarioScriptRepository->create($data);
    }

    public function update(ScenarioScript $scenarioScript, array $data): ScenarioScript
    {
        $this->scenarioScriptRepository->update($scenarioScript, $data);
        return $scenarioScript->fresh();
    }

    public function delete(ScenarioScript $scenarioScript): bool
    {
        return $this->scenarioScriptRepository->delete($scenarioScript);
    }
}
